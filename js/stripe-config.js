/**
 * stripe-config.js — Stripe Payment Link configuration
 * Used by checkout.html to send customers to Stripe for real payment.
 *
 * ============================================================
 * ONE-TIME SETUP (do this in your Stripe Dashboard)
 * ============================================================
 * 1. Create/sign in to a Stripe account: https://dashboard.stripe.com
 *
 * 2. Create a Product for each sauce (Product catalog -> + Add product):
 *      - Snake Bite                    £5.99
 *      - Scorpion Sting                £5.99
 *      - Dragon's Fury                 £5.99
 *      - Nak Muay Thai Sweet Chili     £5.99
 *    (Add new products here the same way if you add more sauces later.)
 *
 * 3. Create ONE Payment Link that includes all four products
 *    (Payment Links -> + New):
 *      - Add all 4 products above as line items on the same link.
 *      - For each line item, enable "Adjustable quantity" (e.g. min 0, max 20)
 *        so customers can set the exact quantity of each sauce themselves on
 *        Stripe's payment page (this mirrors the quantities in their cart —
 *        ask them to double check, since Payment Links can't be pre-loaded
 *        with an arbitrary cart from the browser without a backend).
 *
 * 4. Under that Payment Link's "Options":
 *      - Enable "Collect customer addresses" -> Billing and shipping address,
 *        and select the countries you deliver to (e.g. United Kingdom).
 *      - Add two Shipping rates: "Standard Delivery" (£3.80) and
 *        "Extra Delivery" (£4.65), so customers can pick the correct one
 *        based on the item count shown in the on-site order summary.
 *      - Under "After payment", choose "Redirect customers to your website"
 *        and set the URL to:
 *          https://YOUR-DOMAIN/checkout.html?order=success
 *        (replace YOUR-DOMAIN with wherever this site is hosted).
 *
 * 5. Click "Create link". Copy the resulting https://buy.stripe.com/... URL
 *    and paste it below as PAYMENT_LINK_URL.
 *
 * Note: This is a no-backend integration. For full automatic reconciliation
 * of orders (e.g. auto-fulfilment, emails) you would additionally set up a
 * Stripe webhook listening for `checkout.session.completed`, which requires
 * a small server/serverless function — not needed just to accept payment.
 */
window.STRIPE_CONFIG = {
  // Paste your Stripe Payment Link URL here once created (see steps above).
  PAYMENT_LINK_URL: 'https://buy.stripe.com/REPLACE_WITH_YOUR_PAYMENT_LINK'
};
