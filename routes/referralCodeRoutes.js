const express = require('express');
const referralController = require('../controllers/referralController');

const router = express.Router();

// Route to generate referral codes for an array of phone numbers
router.get('/get-all-referral-codes', referralController.getAllReferralCodes);
router.post('/generate-referral-codes', referralController.generateReferralCodes);
router.patch('/update-referral-code', referralController.updateReferralCode);
router.delete('/delete-referral-code', referralController.deleteReferralCode);
router.post('/use-referral-codes', referralController.useReferralCodes);

module.exports = router;
