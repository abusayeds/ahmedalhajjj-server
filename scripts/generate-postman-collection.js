const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

/**
 * Mobile App (Frontend) Postman Collection Generator
 * -----------------------------------------------
 * NOTE: "Frontend" = Mobile App only.
 * Dashboard / Admin APIs are intentionally excluded.
 * Admin team tests dashboard APIs through the dashboard UI.
 */

const authHeader = (tokenVar = "accessToken") => [
  { key: "Authorization", value: `Bearer {{${tokenVar}}}` },
];

const jsonHeader = [{ key: "Content-Type", value: "application/json" }];

const rawBody = (obj) => ({
  mode: "raw",
  raw: JSON.stringify(obj, null, 2),
  options: { raw: { language: "json" } },
});

const url = (segments) => ({
  raw: `{{baseUrl}}/${segments.join("/")}`,
  host: ["{{baseUrl}}"],
  path: segments,
});

const testScript = (lines) => [
  {
    listen: "test",
    script: { type: "text/javascript", exec: lines },
  },
];

const saveTokenScript = [
  "const json = pm.response.json();",
  "if (json && json.data) {",
  "  const token = json.data.token || json.data.accessToken;",
  "  if (token) {",
  "    pm.collectionVariables.set('accessToken', token);",
  "    pm.collectionVariables.set('token', token);",
  "  }",
  "  if (json.data.user) {",
  "    if (json.data.user._id) pm.collectionVariables.set('userId', json.data.user._id);",
  "    if (json.data.user.email) pm.collectionVariables.set('userEmail', json.data.user.email);",
  "  }",
  "}",
];

const collection = {
  info: {
    _postman_id: "ahmedalhajjj-mobile-app-api-v1",
    name: "AhmedAlhajji Mobile App API (Frontend)",
    description:
      "# Mobile App API Collection (Frontend Developers)\n\n" +
      "> **Important:** In this project, **Frontend = Mobile App** only.\n" +
      "> **Dashboard = Admin panel** (separate). Dashboard/Admin APIs are **NOT** in this collection.\n\n" +
      "## Who is this for?\n" +
      "Give this file to your **mobile app / frontend developer** so they can see which API belongs to which app screen.\n\n" +
      "## Base URLs // example\n" +
      "- Local: `http://localhost:2002/api/v1`\n" +
      "- Production: change `serverUrl` variable\n\n" +
      "## Folder → App Screen Map\n" +
      "| Folder | App Screen / Feature |\n" +
      "|--------|---------------------|\n" +
      "| Auth & Onboarding | Sign up, OTP, Login |\n" +
      "| Password Recovery | Forgot password flow |\n" +
      "| User Profile | Profile view & edit |\n" +
      "| Pricing & Plans | Subscription plans list, plan details, trial promo info |\n" +
      "| Coupon (Checkout) | Validate discount code before payment |\n" +
      "| Purchase & My Plan | Paywall, Stripe checkout, active subscription |\n" +
      "| Legal Pages | Privacy, Terms, About (read-only) |\n\n" +
      "## Purchase flow (App)\n" +
      "1. Login User\n" +
      "2. Get All Subscription Plans → save `subscriptionId`\n" +
      "3. Validate Coupon (optional) → e.g. ELITE50 // example\n" +
      "4. Initiate Purchase → open `checkoutUrl` in app (Stripe)\n" +
      "5. After Stripe payment, backend webhook activates subscription automatically\n" +
      "6. Call **Get Current Active Subscription** to refresh UI\n\n" +
      "## Test user // example\n" +
      "- email: alex.trader@example.com\n" +
      "- password: Password123!",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "serverUrl", value: "http://localhost:2002", type: "string" },
    { key: "baseUrl", value: "{{serverUrl}}/api/v1", type: "string" },
    { key: "accessToken", value: "", type: "string" },
    { key: "token", value: "", type: "string" },
    { key: "forgotToken", value: "", type: "string" },
    { key: "verifyForgotToken", value: "", type: "string" },
    { key: "userEmail", value: "alex.trader@example.com", type: "string" },
    { key: "userId", value: "", type: "string" },
    { key: "subscriptionId", value: "", type: "string" },
    { key: "subscriptionName", value: "VIP", type: "string" },
    { key: "purchaseId", value: "", type: "string" },
    { key: "couponCode", value: "ELITE50", type: "string" },
  ],
  item: [
    {
      name: "Auth & Onboarding",
      description: "App screens: Sign Up, OTP Verification, Login",
      item: [
        {
          name: "Register User",
          description:
            "Screen: Sign Up\n\nBody fields // example:\n- firstName: Alex\n- lastName: Trader\n- email: alex.trader@example.com\n- password: Password123!\n- confirmPassword: Password123!",
          event: testScript([
            ...saveTokenScript,
            "pm.test('Registration token saved', () => pm.expect(pm.collectionVariables.get('accessToken')).to.not.equal(''));",
          ]),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({
              firstName: "Alex",
              lastName: "Trader",
              email: "alex.trader@example.com",
              password: "Password123!",
              confirmPassword: "Password123!",
              phone: "+8801712345678",
              address: "Dhaka, Bangladesh",
            }),
            url: url(["user", "register"]),
          },
        },
        {
          name: "Verify OTP",
          description: "Screen: OTP Verification\n\nUse OTP from email/server console. // example otp: 123456",
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({ otp: "123456" }),
            url: url(["user", "verify-otp"]),
          },
        },
        {
          name: "Login User",
          description: "Screen: Login\n\nBody // example:\n- email: alex.trader@example.com\n- password: Password123!",
          event: testScript(saveTokenScript),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({
              email: "{{userEmail}}",
              password: "Password123!",
            }),
            url: url(["user", "login"]),
          },
        },
        {
          name: "Resend OTP",
          description: "Screen: OTP Verification (resend button)",
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({ email: "{{userEmail}}" }),
            url: url(["user", "resend-otp"]),
          },
        },
      ],
    },
    {
      name: "Password Recovery",
      description: "App screens: Forgot Password → OTP → Reset Password",
      item: [
        {
          name: "Forgot Password",
          description: "Screen: Forgot Password\n\nBody // example: email: alex.trader@example.com",
          event: testScript([
            "const json = pm.response.json();",
            "if (json.data && json.data.token) pm.collectionVariables.set('forgotToken', json.data.token);",
          ]),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({ email: "{{userEmail}}" }),
            url: url(["user", "forgot-password"]),
          },
        },
        {
          name: "Verify Forgot Password OTP",
          description: "Screen: Forgot Password OTP\n\nBody // example: otp: 123456",
          event: testScript([
            "const json = pm.response.json();",
            "if (json.data && json.data.token) pm.collectionVariables.set('verifyForgotToken', json.data.token);",
          ]),
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader("forgotToken")],
            body: rawBody({ otp: "123456" }),
            url: url(["user", "verify-forgot-otp"]),
          },
        },
        {
          name: "Reset Password",
          description:
            "Screen: Set New Password\n\nBody // example:\n- password: NewSecurePass123!\n- confirmPassword: NewSecurePass123!",
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader("verifyForgotToken")],
            body: rawBody({
              password: "NewSecurePass123!",
              confirmPassword: "NewSecurePass123!",
            }),
            url: url(["user", "reset-password"]),
          },
        },
      ],
    },
    {
      name: "User Profile",
      description: "App screens: Profile, Edit Profile, Change Password",
      item: [
        {
          name: "My Profile",
          description: "Screen: Profile / Account\n\nAuth: Bearer token required",
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["user", "my-profile"]),
          },
        },
        {
          name: "Update Profile",
          description:
            "Screen: Edit Profile\n\nBody // example:\n- name: Alex Trader Updated\n- phone: +8801712345678",
          request: {
            method: "PATCH",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({
              name: "Alex Trader Updated",
              firstName: "Alex",
              lastName: "Trader Updated",
              phone: "+8801712345678",
              address: "Dhaka, Bangladesh",
            }),
            url: url(["user", "update-profile"]),
          },
        },
        {
          name: "Change Password",
          description:
            "Screen: Change Password\n\nBody // example:\n- oldPassword: Password123!\n- newPassword: NewSecurePass123!\n- confirmPassword: NewSecurePass123!",
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({
              oldPassword: "Password123!",
              newPassword: "NewSecurePass123!",
              confirmPassword: "NewSecurePass123!",
            }),
            url: url(["user", "change-password"]),
          },
        },
      ],
    },
    {
      name: "Pricing & Plans",
      description: "App screens: Pricing, Plan Details, Free Trial Promo banner",
      item: [
        {
          name: "Get All Subscription Plans",
          description: "Screen: Pricing / Choose Plan\n\nReturns VIP, Forex, Crypto plans for the app pricing screen.",
          event: testScript([
            "const json = pm.response.json();",
            "if (json.data && json.data.length) {",
            "  pm.collectionVariables.set('subscriptionId', json.data[0]._id);",
            "  pm.collectionVariables.set('subscriptionName', json.data[0].name);",
            "}",
          ]),
          request: { method: "GET", url: url(["subscription"]) },
        },
        {
          name: "Get Subscription Plan By ID",
          description: "Screen: Plan Details\n\nUse subscriptionId from previous API or variable {{subscriptionId}}",
          request: {
            method: "GET",
            url: url(["subscription", "{{subscriptionId}}"]),
          },
        },
        {
          name: "Get Trial & Promo Config",
          description:
            "Screen: Pricing banner / First N users free offer\n\nRead-only for app. Shows trial duration, promo limit, claimed count.",
          request: {
            method: "GET",
            url: url(["subscription", "trial-config"]),
          },
        },
      ],
    },
    {
      name: "Coupon (Checkout)",
      description: "App screen: Checkout — apply coupon code before payment",
      item: [
        {
          name: "Validate Coupon Code",
          description:
            "Screen: Checkout — Coupon input\n\nBody // example:\n- code: ELITE50\n\nOther example codes: FOREX20, CRYPTO30",
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({ code: "{{couponCode}}" }),
            url: url(["coupon", "validate"]),
          },
        },
      ],
    },
    {
      name: "Purchase & My Plan",
      description: "App screens: Paywall, Stripe Payment, My Subscription, Purchase History",
      item: [
        {
          name: "Initiate Paid Purchase (With Coupon)",
          description:
            "Screen: Checkout → Pay with Stripe\n\nBody // example:\n- subscriptionId: from Get All Plans\n- isFreeTrial: false\n- couponCode: ELITE50\n- billingCycle: monthly\n\nResponse:\n- checkoutUrl → open in app WebView/browser\n- paymentRequired: true → wait for Stripe, then refresh current subscription",
          event: testScript([
            "const json = pm.response.json();",
            "if (json.data && json.data.purchase) {",
            "  if (json.data.purchase._id) pm.collectionVariables.set('purchaseId', json.data.purchase._id);",
            "  if (json.data.purchase.userId) pm.collectionVariables.set('userId', json.data.purchase.userId);",
            "  if (json.data.purchase.subscriptionId) pm.collectionVariables.set('subscriptionId', json.data.purchase.subscriptionId);",
            "  if (json.data.purchase.subscriptionName) pm.collectionVariables.set('subscriptionName', json.data.purchase.subscriptionName);",
            "}",
          ]),
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({
              subscriptionId: "{{subscriptionId}}",
              isFreeTrial: false,
              couponCode: "{{couponCode}}",
              billingCycle: "monthly",
            }),
            url: url(["subscription", "purchase", "initiate"]),
          },
        },
        {
          name: "Initiate Free Trial",
          description:
            "Screen: Start Free Trial button\n\nBody // example:\n- subscriptionId: plan id\n- isFreeTrial: true\n- billingCycle: monthly",
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({
              subscriptionId: "{{subscriptionId}}",
              isFreeTrial: true,
              billingCycle: "monthly",
            }),
            url: url(["subscription", "purchase", "initiate"]),
          },
        },
        {
          name: "Get Current Active Subscription",
          description: "Screen: My Plan / Subscription Status\n\nCall after payment success to update app UI.",
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["subscription", "user", "current"]),
          },
        },
        {
          name: "Get User Purchase History",
          description: "Screen: Billing History / Past Purchases",
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["subscription", "user", "purchases"]),
          },
        },
        {
          name: "Get Trial Status",
          description: "Screen: Free trial badge / trial remaining days",
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["subscription", "user", "trial-status"]),
          },
        },
      ],
    },
    {
      name: "Legal Pages",
      description: "App screens: Settings → Privacy Policy, Terms, About Us (read-only HTML content)",
      item: [
        {
          name: "Get Privacy Policy",
          description: "Screen: Settings → Privacy Policy",
          request: { method: "GET", url: url(["management", "privacy"]) },
        },
        {
          name: "Get Terms & Conditions",
          description: "Screen: Settings → Terms & Conditions",
          request: { method: "GET", url: url(["management", "terms"]) },
        },
        {
          name: "Get About Us",
          description: "Screen: Settings → About Us",
          request: { method: "GET", url: url(["management", "about"]) },
        },
      ],
    },
  ],
};

const outputPath = path.join(__dirname, "..", "postman_collection.json");
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
console.log(`Mobile App Postman collection generated: ${outputPath}`);

if (process.env.POSTMAN_API_KEY) {
  console.log("POSTMAN_API_KEY detected → syncing to Postman cloud...");
  const { syncCollection } = require("./sync-postman-collection");
  syncCollection().catch((error) => {
    console.error("Postman sync failed:", error.message);
  });
} else {
  console.log("Tip: add POSTMAN_API_KEY to .env and run npm run postman:sync for auto Postman sync.");
}
