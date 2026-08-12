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
      "| Posts | Market news feed, comments, likes & shares |\n" +
      "| Notifications | Bell icon, unread badge, alerts list |\n" +
      "| History | Closed signals, performance overview, filters |\n" +
      "| Legal Pages | Privacy, Terms, About (read-only) |\n\n" +
      "## Purchase flow (App)\n" +
      "1. Login User\n" +
      "2. Get All Subscription Plans → save `subscriptionId`\n" +
      "3. Validate Coupon (optional) → e.g. ELITE50 // example\n" +
      "4. Initiate Purchase → open `checkoutUrl` in app (Stripe)\n" +
      "5. After Stripe payment, backend webhook activates subscription automatically\n" +
      "6. Call **Get Current Active Subscription** to refresh UI\n\n" +
      "## Test users (demo)\n" +
      "Password for all: `1qazxsw2`\n" +
      "- ahmed.user@gmail.com\n" +
      "- fatima.user@gmail.com\n" +
      "- omar.user@gmail.com\n" +
      "- sara.user@gmail.com\n" +
      "- yusuf.user@gmail.com\n" +
      "- aisha.user@gmail.com\n" +
      "- karim.user@gmail.com",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "serverUrl", value: "http://localhost:2002", type: "string" },
    { key: "baseUrl", value: "{{serverUrl}}/api/v1", type: "string" },
    { key: "accessToken", value: "", type: "string" },
    { key: "token", value: "", type: "string" },
    { key: "forgotToken", value: "", type: "string" },
    { key: "verifyForgotToken", value: "", type: "string" },
    { key: "userEmail", value: "ahmed.user@gmail.com", type: "string" },
    { key: "userPassword", value: "1qazxsw2", type: "string" },
    { key: "userId", value: "", type: "string" },
    { key: "signalId", value: "", type: "string" },
    { key: "postId", value: "", type: "string" },
    { key: "commentId", value: "", type: "string" },
    { key: "notificationId", value: "", type: "string" },
    { key: "subscriptionId", value: "", type: "string" },
    { key: "subscriptionName", value: "VIP", type: "string" },
    { key: "purchaseId", value: "", type: "string" },
    { key: "couponCode", value: "WELCOME20", type: "string" },
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
          name: "Login User (Ahmed)",
          description:
            "Screen: Login\n\nDemo users (password for all: 1qazxsw2):\n" +
            "- ahmed.user@gmail.com\n" +
            "- fatima.user@gmail.com\n" +
            "- omar.user@gmail.com\n" +
            "- sara.user@gmail.com\n" +
            "- yusuf.user@gmail.com\n" +
            "- aisha.user@gmail.com\n" +
            "- karim.user@gmail.com",
          event: testScript(saveTokenScript),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({
              email: "ahmed.user@gmail.com",
              password: "1qazxsw2",
            }),
            url: url(["user", "login"]),
          },
        },
        {
          name: "Login User (Fatima)",
          event: testScript(saveTokenScript),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({ email: "fatima.user@gmail.com", password: "1qazxsw2" }),
            url: url(["user", "login"]),
          },
        },
        {
          name: "Login User (Omar)",
          event: testScript(saveTokenScript),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({ email: "omar.user@gmail.com", password: "1qazxsw2" }),
            url: url(["user", "login"]),
          },
        },
        {
          name: "Login User (Sara)",
          event: testScript(saveTokenScript),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({ email: "sara.user@gmail.com", password: "1qazxsw2" }),
            url: url(["user", "login"]),
          },
        },
        {
          name: "Login User (Yusuf)",
          event: testScript(saveTokenScript),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({ email: "yusuf.user@gmail.com", password: "1qazxsw2" }),
            url: url(["user", "login"]),
          },
        },
        {
          name: "Login User (Aisha)",
          event: testScript(saveTokenScript),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({ email: "aisha.user@gmail.com", password: "1qazxsw2" }),
            url: url(["user", "login"]),
          },
        },
        {
          name: "Login User (Karim)",
          event: testScript(saveTokenScript),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({ email: "karim.user@gmail.com", password: "1qazxsw2" }),
            url: url(["user", "login"]),
          },
        },
        {
          name: "Login User (Variable Email)",
          description: "Uses {{userEmail}} and {{userPassword}} collection variables.",
          event: testScript(saveTokenScript),
          request: {
            method: "POST",
            header: jsonHeader,
            body: rawBody({
              email: "{{userEmail}}",
              password: "{{userPassword}}",
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
            "Body // example:\n- code: WELCOME20\n\nOther codes: FOREX15, CRYPTO10, FLAT5USD",
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
      description:
        "App screens: Paywall, Stripe Payment, My Subscription, Purchase History\n\n" +
        "Suggested flow:\n" +
        "1. Login User\n" +
        "2. Get All Subscription Plans → save {{subscriptionId}}\n" +
        "3. Initiate Paid Purchase or Free Trial\n" +
        "4. Get Current Active Subscription",
      item: [
        {
          name: "Get All Subscription Plans",
          description:
            "Screen: Paywall / Choose Plan before purchase\n\n" +
            "Returns all active plans (VIP, Forex, Crypto) with price, features, billing options.\n\n" +
            "Public — no auth required. Saves first plan id to {{subscriptionId}}.",
          event: testScript([
            "pm.test('Status 200', () => pm.response.to.have.status(200));",
            "const json = pm.response.json();",
            "if (json.data && json.data.length) {",
            "  pm.collectionVariables.set('subscriptionId', json.data[0]._id);",
            "  pm.collectionVariables.set('subscriptionName', json.data[0].name);",
            "  const vip = json.data.find(p => (p.name || '').toUpperCase() === 'VIP');",
            "  if (vip) {",
            "    pm.collectionVariables.set('subscriptionId', vip._id);",
            "    pm.collectionVariables.set('subscriptionName', vip.name);",
            "  }",
            "}",
          ]),
          request: { method: "GET", url: url(["subscription"]) },
        },
        {
          name: "Get Subscription Plan By ID",
          description:
            "Screen: Plan details before checkout\n\nUse {{subscriptionId}} from Get All Subscription Plans.",
          request: {
            method: "GET",
            url: url(["subscription", "{{subscriptionId}}"]),
          },
        },
        {
          name: "Initiate Paid Purchase (With Coupon)",
          description:
            "Screen: Checkout → Pay with Stripe\n\nBody // example:\n- subscriptionId: from Get All Plans\n- isFreeTrial: false\n- couponCode: WELCOME20\n- billingCycle: monthly\n\nResponse:\n- checkoutUrl → open in app WebView/browser\n- paymentRequired: true → wait for Stripe, then refresh current subscription",
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
      name: "Signals & Market",
      description: "App screens: Signal list, Signal detail (Summary + Details tabs), Chart, Favorites, Alerts",
      item: [
        {
          name: "Get App Signals (List)",
          description: "Screen: Signals home list. Saves first signal id to {{signalId}}.",
          event: testScript([
            "const json = pm.response.json();",
            "if (json.data && json.data.signals && json.data.signals.length) {",
            "  pm.collectionVariables.set('signalId', json.data.signals[0].id);",
            "}",
          ]),
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["signal", "app"]),
          },
        },
        {
          name: "Get Signal Detail",
          description:
            "Screen: Signal Detail (Summary + Details tabs)\n\nReturns header, live, summary, details, userActions, chart overlays.",
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["signal", "app", "{{signalId}}"]),
          },
        },
        {
          name: "Get Signal Market Data",
          description: "Screen: Live price + statistics block (can poll separately from detail).",
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["signal", "app", "{{signalId}}", "market"]),
          },
        },
        {
          name: "Get Signal Chart",
          description: "Screen: Candlestick chart. Query // example: timeframe=1W",
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["signal", "app", "{{signalId}}", "chart"]),
              query: [{ key: "timeframe", value: "1W" }],
            },
          },
        },
        {
          name: "Get Global Market Hours",
          description: "Screen: Market hours info",
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["signal", "app", "market-hours"]),
          },
        },
        {
          name: "Add Signal Favorite",
          description: "Screen: Star icon on signal detail",
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({ enabled: true }),
            url: url(["signal", "app", "{{signalId}}", "favorite"]),
          },
        },
        {
          name: "Remove Signal Favorite",
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({ enabled: false }),
            url: url(["signal", "app", "{{signalId}}", "favorite"]),
          },
        },
        {
          name: "Enable Signal Alerts",
          description: 'Screen: "Enable Alerts" button',
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({ enabled: true }),
            url: url(["signal", "app", "{{signalId}}", "alerts"]),
          },
        },
        {
          name: "Disable Signal Alerts",
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({ enabled: false }),
            url: url(["signal", "app", "{{signalId}}", "alerts"]),
          },
        },
      ],
    },
    {
      name: "Posts",
      description:
        "App screens: Posts feed (empty + list), post detail, comments thread, like/share actions.\n\n" +
        "Requires **active subscription** (premium content).\n\n" +
        "Suggested flow:\n" +
        "1. Login User\n" +
        "2. Get Posts Feed → saves {{postId}}\n" +
        "3. Get Post Detail\n" +
        "4. Get Post Comments → saves {{commentId}}\n" +
        "5. Add Comment / Edit / Delete Comment\n" +
        "6. Toggle Like Post / Toggle Like Comment / Share Post",
      item: [
        {
          name: "Get Posts Feed",
          description:
            "Screen: Posts home — scrollable cards with category badge, author, likes/comments/shares.\n\n" +
            "Query params // example:\n" +
            "- page=1, limit=10\n" +
            "- category=Education | Market Update | News | All\n" +
            "- search=bitcoin",
          event: testScript([
            "pm.test('Status 200', () => pm.response.to.have.status(200));",
            "const json = pm.response.json();",
            "if (json.data && json.data.posts && json.data.posts.length) {",
            "  pm.collectionVariables.set('postId', json.data.posts[0].id);",
            "  const education = json.data.posts.find(p => (p.category || '').toLowerCase().includes('education'));",
            "  if (education) pm.collectionVariables.set('postId', education.id);",
            "}",
          ]),
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["post", "app"]),
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "10" },
                { key: "category", value: "All", disabled: true },
                { key: "search", value: "", disabled: true },
              ],
            },
          },
        },
        {
          name: "Get Posts Feed — Filter Education",
          description: "Screen: Posts filtered by category chip (Education).",
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["post", "app"]),
              query: [
                { key: "category", value: "Education" },
                { key: "limit", value: "10" },
              ],
            },
          },
        },
        {
          name: "Get Post Detail",
          description:
            "Screen: Expanded post card — full body, cover image, engagement counts, isLikedByMe.",
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["post", "app", "{{postId}}"]),
          },
        },
        {
          name: "Get Post Comments",
          description:
            "Screen: Comments — post summary header + ALL COMMENTS list with likes.\n\n" +
            "Saves first comment id to {{commentId}}.",
          event: testScript([
            "pm.test('Status 200', () => pm.response.to.have.status(200));",
            "const json = pm.response.json();",
            "if (json.data && json.data.comments && json.data.comments.length) {",
            "  pm.collectionVariables.set('commentId', json.data.comments[0].id);",
            "}",
          ]),
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["post", "app", "{{postId}}", "comments"]),
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
              ],
            },
          },
        },
        {
          name: "Add Comment",
          description: 'Screen: "Write a comment..." input + send.',
          event: testScript([
            "pm.test('Status 201', () => pm.response.to.have.status(201));",
            "const json = pm.response.json();",
            "if (json.data && json.data.id) {",
            "  pm.collectionVariables.set('commentId', json.data.id);",
            "}",
          ]),
          request: {
            method: "POST",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({ text: "Solid analysis — thanks for sharing!" }),
            url: url(["post", "app", "{{postId}}", "comments"]),
          },
        },
        {
          name: "Edit Comment",
          description:
            "Screen: Edit own comment (only comment owner).\n\n" +
            "Response includes updated comment with canEdit/canDelete flags.",
          request: {
            method: "PATCH",
            header: [...jsonHeader, ...authHeader()],
            body: rawBody({ text: "Updated comment — great insight on R:R!" }),
            url: url(["post", "app", "comments", "{{commentId}}"]),
          },
        },
        {
          name: "Delete Comment",
          description:
            "Screen: Delete own comment (only comment owner).\n\n" +
            "Returns updated commentsCount for the post.",
          request: {
            method: "DELETE",
            header: authHeader(),
            url: url(["post", "app", "comments", "{{commentId}}"]),
          },
        },
        {
          name: "Toggle Post Like",
          description:
            "Screen: Heart icon on post card.\n\n" +
            "Single toggle API — no body needed.\n" +
            "Already liked → unlikes. Not liked → likes.\n\n" +
            "Response: { isLiked, likesCount }",
          request: {
            method: "POST",
            header: authHeader(),
            url: url(["post", "app", "{{postId}}", "like"]),
          },
        },
        {
          name: "Toggle Comment Like",
          description:
            "Screen: Heart icon on comment.\n\n" +
            "Single toggle API — same as post like.\n" +
            "Response: { isLiked, likesCount }",
          request: {
            method: "POST",
            header: authHeader(),
            url: url(["post", "app", "comments", "{{commentId}}", "like"]),
          },
        },
        {
          name: "Share Post",
          description: "Screen: Share icon — increments sharesCount.",
          request: {
            method: "POST",
            header: authHeader(),
            url: url(["post", "app", "{{postId}}", "share"]),
          },
        },
      ],
    },
    {
      name: "Notifications",
      description:
        "App screen: Bell icon tab — alerts list with unread badge.\n\n" +
        "Suggested flow:\n" +
        "1. Login User\n" +
        "2. Get Unread Count → badge on bell icon\n" +
        "3. Get Notifications → saves {{notificationId}}\n" +
        "4. Mark Notification Read / Mark All Read",
      item: [
        {
          name: "Get Unread Count",
          description:
            "Screen: Bell icon red dot badge.\n\n" +
            "Returns { unreadCount, totalCount } for the logged-in user.",
          request: {
            method: "GET",
            header: authHeader(),
            url: url(["notification", "app", "unread-count"]),
          },
        },
        {
          name: "Get Notifications",
          description:
            "Screen: Notifications list — title, message, timeAgo, isRead, category.\n\n" +
            "Filters by user audience (All Users + plan/trial audience).\n\n" +
            "Query // example: page=1, limit=20, search=signal",
          event: testScript([
            "pm.test('Status 200', () => pm.response.to.have.status(200));",
            "const json = pm.response.json();",
            "if (json.data && json.data.notifications && json.data.notifications.length) {",
            "  pm.collectionVariables.set('notificationId', json.data.notifications[0].id);",
            "}",
          ]),
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["notification", "app"]),
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
                { key: "search", value: "", disabled: true },
              ],
            },
          },
        },
        {
          name: "Mark Notification Read",
          description:
            "Screen: Tap notification → mark as read.\n\n" +
            "Returns updated notification + new unreadCount.",
          request: {
            method: "POST",
            header: authHeader(),
            url: url(["notification", "app", "{{notificationId}}", "read"]),
          },
        },
        {
          name: "Mark All Notifications Read",
          description: "Screen: Mark all as read action — clears unread badge.",
          request: {
            method: "POST",
            header: authHeader(),
            url: url(["notification", "app", "read-all"]),
          },
        },
      ],
    },
    {
      name: "History",
      description:
        "App screen: History — performance overview (wins/losses/breakeven/win rate) + closed signals list.\n\n" +
        "Requires **active subscription**.\n\n" +
        "Query params // example:\n" +
        "- result=Win | Loss | Breakeven | All\n" +
        "- category=Crypto | Forex | Index\n" +
        "- search=NAS (asset search)\n" +
        "- page=1, limit=10",
      item: [
        {
          name: "Get Signal History (All)",
          description:
            "Screen: History v-2 — PERFORMANCE OVERVIEW + CLOSED SIGNALS list.\n\n" +
            "Returns performanceOverview, signals[], pagination, totalClosedSignals.",
          event: testScript([
            "pm.test('Status 200', () => pm.response.to.have.status(200));",
            "const json = pm.response.json();",
            "if (json.data && json.data.performanceOverview) {",
            "  pm.expect(json.data.performanceOverview).to.have.property('winRate');",
            "}",
          ]),
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["signal", "app", "history"]),
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "10" },
              ],
            },
          },
        },
        {
          name: "Get Signal History — Wins Only",
          description: "Screen: Filter chip → Win",
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["signal", "app", "history"]),
              query: [
                { key: "result", value: "Win" },
                { key: "limit", value: "10" },
              ],
            },
          },
        },
        {
          name: "Get Signal History — Losses Only",
          description: "Screen: Filter chip → Loss",
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["signal", "app", "history"]),
              query: [
                { key: "result", value: "Loss" },
                { key: "limit", value: "10" },
              ],
            },
          },
        },
        {
          name: "Get Signal History — Breakeven",
          description: "Screen: Filter chip → Break / Breakeven",
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["signal", "app", "history"]),
              query: [
                { key: "result", value: "Breakeven" },
                { key: "limit", value: "10" },
              ],
            },
          },
        },
        {
          name: "Get Signal History — Search NAS100",
          description: 'Screen: Search bar — "Search Signals..."',
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["signal", "app", "history"]),
              query: [
                { key: "search", value: "NAS" },
                { key: "limit", value: "10" },
              ],
            },
          },
        },
        {
          name: "Get Signal History — Crypto Filter",
          description: "Screen: Category filter (Crypto)",
          request: {
            method: "GET",
            header: authHeader(),
            url: {
              ...url(["signal", "app", "history"]),
              query: [
                { key: "category", value: "Crypto" },
                { key: "limit", value: "10" },
              ],
            },
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
