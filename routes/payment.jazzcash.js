const express = require("express");
const jazzPaymentController = require("../controllers/PaymentController.jazzCash");
const router = express.Router();


router.post("/jazzcash-mwallet/farmacie", jazzPaymentController.jazzcashMwalletFarmacie);
// router.post("/jazzcash-mwallet/ipn", Controller.PaymentController.jazzcashCheckout);
