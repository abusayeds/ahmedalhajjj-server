import Stripe from "stripe";
import { Request, Response } from "express";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../../config";
import { UserModel } from "../../modules/basic_modules/user/user.model";
import { PurchaseModel } from "../../modules/basic_modules/subscription/subscription.model";
import { CouponModel } from "../../modules/basic_modules/coupon/coupon.model";

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
        const { userId, subscriptionId, couponCode, subscriptionName } = session.metadata;

        let purchase = await PurchaseModel.findOne({
          userId,
          subscriptionId,
        });

        if (!purchase) {
          purchase = new PurchaseModel({
            userId,
            subscriptionId,
            subscriptionName: subscriptionName || "VIP",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            paymentStatus: "completed",
            amount: (session.amount_total || 0) / 100,
            isActive: true,
          });
        } else {
          purchase.stripeCustomerId = session.customer as string;
          purchase.stripeSubscriptionId = session.subscription as string;
          purchase.paymentStatus = "completed";
          purchase.isActive = true;
          purchase.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        await purchase.save();

        if (userId) {
          await UserModel.findByIdAndUpdate(userId, {
            isSubscribed: true,
            subscriptionPlan: subscriptionName || "VIP",
          });
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

// Create checkout session
export const createCheckoutSession = async (
  userId: string,
  subscriptionId: string,
  isFreeTrial: boolean = false,
  couponCode?: string
) => {
  try {
    if (isFreeTrial) {
      const purchase = new PurchaseModel({
        userId,
        subscriptionId,
        subscriptionName: "VIP",
        isFreeTrial: true,
        paymentStatus: "completed",
        isActive: true,
        amount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await purchase.save();
      return purchase;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Subscription Plan",
            },
            unit_amount: 4900,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/subscription/cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
        subscriptionId,
        couponCode: couponCode || "",
      },
    });

    return session;
  } catch (error) {
    console.error("Stripe error:", error);
    throw error;
  }
};
