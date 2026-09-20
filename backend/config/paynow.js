const { Paynow } = require("paynow");

const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID,
  process.env.PAYNOW_INTEGRATION_KEY
);

paynow.resultUrl =
  process.env.PAYNOW_RESULT_URL;

paynow.returnUrl =
  process.env.PAYNOW_RETURN_URL;

module.exports = paynow;