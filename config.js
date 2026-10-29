/* The one place to edit before launch.
   Anything left as "REPLACE_ME" (or empty) is treated as "not set yet":
   the page shows a clearly marked placeholder state, never a dead link. */
window.ASHA = {
  /* Stripe Payment Links. Create them in the Stripe dashboard (Payment Links),
     one per tier. For the monthly ones, create the price as "Recurring".
     For "custom", turn on "Let customers choose what to pay". */
  PAYMENT_LINKS: {
    supplies15:    "https://buy.stripe.com/3cI4gzanh7WP4HF50A87K07",  // one time, $15
    backpack25:    "https://buy.stripe.com/28EdR9dzt0un2zx9gQ87K02",  // one time, $25
    fees100:       "https://buy.stripe.com/8x228rdzt4KDdebgJi87K04",  // one time, $100
    custom:        "REPLACE_ME",  // one time, customer chooses amount (left out for now)
    monthly15:     "https://buy.stripe.com/aFa14ncvp3GzeifgJi87K00",  // monthly, $15
    monthly25:     "https://buy.stripe.com/6oUfZheDxfphfmjeBa87K03",  // monthly, $25
    monthly100:    "https://buy.stripe.com/14A4gz2UP7WPfmjeBa87K05",  // monthly, $100
    monthlyCustom: "REPLACE_ME"   // monthly, customer chooses amount (left out for now)
  },

  /* Contact form, via FormSubmit.co (no account needed). The very first
     submission sent here triggers a one-time confirmation email to
     info@ashasark.org — someone has to click the link in it once before
     submissions start actually arriving. */
  FORM_ENDPOINT: "https://formsubmit.co/ajax/info@ashasark.org",

  CONTACT_EMAIL: "info@ashasark.org",

  /* Printed in the donation fine print and the footer, and used to answer
     "Is my gift tax deductible?". Leave empty until the exact wording and
     registration number are confirmed. Example:
     "Asha's Ark is a registered 501(c)(3) nonprofit. EIN 00-0000000." */
  TAX_STATUS_LINE: "Asha's Ark is a registered nonprofit. Donations are tax deductible to the extent allowed by law.",

  SITE_URL: "https://ashasark.org/"
};
