const express = require('express');
const referralController  = require('../controllers/referralController');

const router = express.Router();

// Route to generate referral codes for an array of phone numbers
router.post('/generate-referral-codes', referralController.generateReferralCodes);
router.post('/use-referral-codes', referralController.useReferralCodes);
router.get('/get-all-referral-codes', referralController.getAllReferralCodes);

module.exports = router;
