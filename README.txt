TREXSPARK AGENCIES — QUICK DEPLOY GUIDE
=======================================

WHAT THIS IS
------------
A complete 2-plan subscription website ($20/month, $50 lifetime)
for Kenya & Zambia.

HOW TO PUT IT ONLINE (no coding)
--------------------------------
1. Go to https://app.netlify.com/drop
2. Drag the whole "trexspark" folder onto the page.
3. Wait ~10 seconds. You get a live URL.
4. (Optional) Buy a domain like trexspark.com and connect it
   in Netlify → Domain settings.

CURRENT MODE: DEMO
------------------
The site works fully, but payments are SIMULATED.
You'll see "DEMO MODE" on the receipt.

TO ACCEPT REAL PAYMENTS
-----------------------
1. Register at https://pesapal.com (free merchant account).
2. Inside Pesapal dashboard, create a "Payment Link" for
   $20/month and another for $50 one-time.
3. Copy each link.
4. Open script.js, find the line:
      const PESAPAL_PAYMENT_URL = "";
   Paste ONE of the links between the quotes:
      const PESAPAL_PAYMENT_URL = "https://pay.pesapal.com/...";
5. Save file, re-upload to Netlify (drag folder again).
6. Test with a real phone — money will go to your Pesapal balance.

GEO-BLOCK (Kenya & Zambia only)
-------------------------------
1. Sign up free at https://cloudflare.com
2. Add your Netlify domain to Cloudflare.
3. Security → WAF → Custom rules → create:
      Block if country NOT IN (KE, ZM)
4. Save.

SUPPORT
-------
Email: support@trexspark.co