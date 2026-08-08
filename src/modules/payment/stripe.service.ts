import Stripe from "stripe";
import { Request, Response } from "express";
import { FRONTEND_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../../config";
import { UserModel } from "../../modules/basic_modules/user/user.model";
import { PurchaseModel } from "../../modules/basic_modules/subscription/subscription.model";
import { CouponModel } from "../../modules/basic_modules/coupon/coupon.model";

const resolveSubscriptionType = (name?: string) => {
  const value = (name || "").toLowerCase();
  if (value.includes("forex")) return "Forex";
  if (value.includes("crypto")) return "Crypto";
  return "VIP";
};

const activateUserSubscription = async (
  userId: string,
  subscriptionName: string,
  endDate: Date,
  purchaseId?: string,
  status: "active" | "trial" = "active",
) => {
  await UserModel.findByIdAndUpdate(userId, {
    subscriptionType: resolveSubscriptionType(subscriptionName),
    subscriptionStatus: status,
    subscriptionEndDate: endDate,
    currentSubscription: purchaseId || null,
  });
};

const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10" as any,
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    if (STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody || req.body,
        sig,
        STRIPE_WEBHOOK_SECRET as string
      );
    } else {
      event = req.body;
    }
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", session.id);

      if (session.metadata) {
        const { userId, subscriptionId, couponCode, subscriptionName, purchaseId } =
          session.metadata;

        let purchase = purchaseId
          ? await PurchaseModel.findById(purchaseId)
          : await PurchaseModel.findOne({
              userId,
              subscriptionId,
              paymentStatus: "pending",
            }).sort({ createdAt: -1 });

        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const paidAmount = (session.amount_total || 0) / 100;

        if (!purchase) {
          purchase = new PurchaseModel({
            userId,
            subscriptionId,
            subscriptionName: subscriptionName || "VIP",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            startDate: new Date(),
            endDate,
            paymentStatus: "completed",
            amount: paidAmount,
            isActive: true,
            billingCycle: "monthly",
          });
        } else {
          purchase.stripeCustomerId = session.customer as string;
          purchase.stripeSubscriptionId = session.subscription as string;
          purchase.paymentStatus = "completed";
          purchase.isActive = true;
          purchase.endDate = endDate;
          if (paidAmount > 0) {
            purchase.amount = paidAmount;
          }
        }

        await purchase.save();

        if (userId) {
          await PurchaseModel.updateMany(
            {
              userId,
              _id: { $ne: purchase._id },
              isActive: true,
            },
            { $set: { isActive: false } },
          );

          await activateUserSubscription(
            userId,
            purchase.subscriptionName,
            purchase.endDate,
            String(purchase._id),
            "active",
          );
        }

        if (couponCode) {
          const coupon = await CouponModel.findOne({ code: couponCode.toUpperCase() });
          if (coupon) {
            coupon.used = (coupon.used || 0) + 1;
            if (coupon.used >= coupon.limit) {
              coupon.status = "Exhausted";
            }
            await coupon.save();
          }
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription updated:", subscription.id);

      const purchase = await PurchaseModel.findOne({
        stripeSubscriptionId: subscription.id,
      });

      if (purchase) {
        purchase.autoRenew = subscription.cancel_at_period_end === false;
        if (subscription.current_period_end) {
          purchase.endDate = new Date(subscription.current_period_end * 1000);
        }
        await purchase.save();
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription cancelled:", subscription.id);

      await PurchaseModel.updateOne(
        { stripeSubscriptionId: subscription.id },
        {
          isActive: false,
          paymentStatus: "cancelled",
          cancelledAt: new Date(),
        }
      );
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Invoice paid:", invoice.id);

      const purchase = await PurchaseModel.findOne({
        stripeSubscriptionId: invoice.subscription,
      });

      if (purchase) {
        purchase.paymentStatus = "completed";
        purchase.isActive = true;
        await purchase.save();
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.error("Invoice payment failed:", invoice.id);

      const purchase = await PurchaseModel.findOne({
        stripeSubscriptionId: invoice.subscription,
      });

      if (purchase) {
        purchase.paymentStatus = "failed";
        purchase.renewalAttempts += 1;
        if (purchase.renewalAttempts >= 3) {
          purchase.isActive = false;
          purchase.paymentStatus = "cancelled";
          purchase.cancelledAt = new Date();
        }
        await purchase.save();
      }
      break;
    }

    default:
      console.log(`Received event type: ${event.type}`);
  }

  res.json({ received: true });
};

export interface CheckoutSessionParams {
  userId: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  purchaseId: string;
  couponCode?: string;
}

// Create Stripe checkout session for paid subscription purchase
export const createCheckoutSession = async (params: CheckoutSessionParams) => {
  const unitAmount = Math.max(0, Math.round(params.amount * 100));

  if (!STRIPE_SECRET_KEY) {
    return {
      id: `cs_test_${params.purchaseId}`,
      url: null,
    } as unknown as Stripe.Checkout.Session;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${params.subscriptionName} Plan`,
            },
            unit_amount: unitAmount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/subscription/cancelled`,
      client_reference_id: String(params.userId),
      metadata: {
        userId: String(params.userId),
        subscriptionId: String(params.subscriptionId),
        subscriptionName: String(params.subscriptionName),
        purchaseId: String(params.purchaseId),
        couponCode: params.couponCode ? String(params.couponCode) : "",
      },
    });

    return session;
  } catch (error) {
    console.error("Stripe error:", error);
    throw error;
  }
};
