import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getTrialConfig,
  updateTrialConfig,
  getUserPurchases,
  getUserActiveSubscription,
  createPurchase,
  getUserTrialStatus,
} from "./subscription.service";

export const getSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const subscriptions = await getAllSubscriptions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscriptions retrieved successfully",
    data: subscriptions,
  });
});

export const getSubscriptionDetail = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscription = await getSubscriptionById(id);

    if (!subscription) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Subscription not found",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subscription retrieved successfully",
      data: subscription,
    });
  }
);

export const createSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const subscription = await createSubscriptionPlan(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Subscription plan created successfully",
      data: subscription,
    });
  }
);

export const updateSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscription = await updateSubscriptionPlan(id, req.body);

    if (!subscription) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Subscription plan not found",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subscription plan updated successfully",
      data: subscription,
    });
  }
);

export const deleteSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const subscription = await deleteSubscriptionPlan(id);

    if (!subscription) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Subscription plan not found",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subscription plan deleted successfully",
      data: subscription,
    });
  }
);

export const getTrialConfigHandler = catchAsync(
  async (req: Request, res: Response) => {
    const config = await getTrialConfig();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Trial and Promo configuration retrieved successfully",
      data: config,
    });
  }
);

export const updateTrialConfigHandler = catchAsync(
  async (req: Request, res: Response) => {
    const config = await updateTrialConfig(req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Trial and Promo configuration updated successfully",
      data: config,
    });
  }
);

export const getUserSubscriptions = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    const purchases = await getUserPurchases(userId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User subscriptions retrieved",
      data: purchases,
    });
  }
);

export const getCurrentSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    const subscription = await getUserActiveSubscription(userId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: subscription
        ? "Active subscription found"
        : "No active subscription",
      data: subscription,
    });
  }
);

export const getTrialStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
      data: null,
    });
  }

  const trialStatus = await getUserTrialStatus(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Trial status retrieved",
    data: trialStatus,
  });
});

export const initiatePurchase = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { subscriptionId, isFreeTrial } = req.body;

    if (!userId) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    if (!subscriptionId) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Subscription ID is required",
        data: null,
      });
    }

    const trialStatus = await getUserTrialStatus(userId);

    if (isFreeTrial && trialStatus.hasUsedFreeTrial) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "You have already used your free trial",
        data: null,
      });
    }

    const purchase = await createPurchase({
      userId,
      subscriptionId,
      isFreeTrial: isFreeTrial || false,
      paymentStatus: "pending",
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Purchase initiated",
      data: purchase,
    });
  }
);
