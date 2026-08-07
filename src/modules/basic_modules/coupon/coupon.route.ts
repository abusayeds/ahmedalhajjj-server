import { Router } from "express";
import {
  getCoupons,
  getCouponDetail,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "./coupon.controller";

const router = Router();

router.get("/", getCoupons);
router.get("/:id", getCouponDetail);
router.post("/create", createCoupon);
router.post("/validate", validateCoupon);
router.patch("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export const couponRoutes = router;
