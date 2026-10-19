/* The one place to edit before launch.
   Anything left as "REPLACE_ME" (or empty) is treated as "not set yet":
   the page shows a clearly marked placeholder state, never a dead link. */
window.ASHA = {
  /* Stripe Payment Links. Create them in the Stripe dashboard (Payment Links),
     one per tier. For the monthly ones, create the price as "Recurring".
     For "custom", turn on "Let customers choose what to pay". */
  PAYMENT_LINKS: {
    supplies15:    "REPLACE_ME",  // one time, $15
    backpack25:    "REPLACE_ME",  // one time, $25
    fees100:       "REPLACE_ME",  // one time, $100
    custom:        "REPLACE_ME",  // one time, customer chooses amount
    monthly15:     "REPLACE_ME",  // monthly, $15
    monthly25:     "REPLACE_ME",  // monthly, $25
    monthly100:    "REPLACE_ME",  // monthly, $100
    monthlyCustom: "REPLACE_ME"   // monthly, customer chooses amount
  },

  /* Contact form. Create a free form at formspree.io and paste its endpoint,
     for example "https://formspree.io/f/abcdwxyz". Point it at info@ashasark.com. */
  FORM_ENDPOINT: "REPLACE_ME",

  CONTACT_EMAIL: "info@ashasark.com",

  /* Printed in the donation fine print and the footer, and used to answer
     "Is my gift tax deductible?". Leave empty until the exact wording and
     registration number are confirmed. Example:
     "Asha's Ark is a registered 501(c)(3) nonprofit. EIN 00-0000000." */
  TAX_STATUS_LINE: "",

  SITE_URL: "https://ashasark.com/"
};
