const apiResponse = require("../helpers/apiResponse");
const Models = require("../models");
const { Op } = require('sequelize');

// Helper to generate a unique referral code
const generateUniqueCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = Array(10)
      .fill(null)
      .map(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return chars.charAt(Math.floor(Math.random() * chars.length));
      })
      .join('');

    exists = await Models.ReferralCode.findOne({ where: { referralCode: code } });
  }
  return code;
};

// Controller to generate referral codes for single or multiple phone numbers
exports.generateReferralCodes = async (req, res) => {
  try {
    let { phone } = req.query;

    // Check if phone is provided
    if (!phone) {
      return apiResponse.ErrorResponse(res, "`phone` query parameter is required.");
    }

    phone = phone.trim(); // Trim any whitespace

    // Check if an active referral code already exists for this phone
    const existingCode = await Models.ReferralCode.findOne({
      where: {
        phone,
        [Op.and]: [
          { expiresAt: { [Op.gt]: new Date() } },  // Not expired by time
          { count: { [Op.lt]: 50 } }               // Not reached max usage
        ]
      }
    });

    if (existingCode) {
      // If the phone number already has a valid referral code, return an error response
      return apiResponse.ErrorResponse(res, "A referral code already exists for this phone number.");
    }

    // Generate a new unique referral code for this phone number
    const newCode = await generateUniqueCode();

    // Insert the new referral code into the database
    const newReferralEntry = await Models.ReferralCode.create({
      phone,
      referralCode: newCode,
      count: 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    // Send a success response with the newly created referral code
    return apiResponse.successResponseWithData(res, "Referral code generated successfully.", newReferralEntry);
  } catch (err) {
    console.error("Error generating referral code:", err);
    return apiResponse.ErrorResponse(res, "Failed to generate referral code.");
  }
};




exports.useReferralCodes = async (req, res) => {
  try {
    // Extract `uuid` from query parameters and `phone`, `referralCode` from request body
    const { uuid } = req.query;
    const { phone, referralCode } = req.body;

    // Validate the inputs: `uuid`, `phone`, and `referralCode`
    if (!uuid) {
      return apiResponse.ErrorResponse(res, "`uuid` query parameter is required.");
    }
    if (!phone) {
      return apiResponse.ErrorResponse(res, "`phone` is required.");
    }
    if (!referralCode) {
      return apiResponse.ErrorResponse(res, "`referralCode` is required.");
    }

    // Check if the phone number exists in the ReferralCode table
    const referralCodeData = await Models.ReferralCode.findOne({
      where: { phone }
    });

    // If the referral code data is not found, return an error
    if (!referralCodeData) {
      return apiResponse.ErrorResponse(res, "Invalid Referral code.");
    }

    // Check if the referral code has reached maximum usage
    if (referralCodeData.count >= 50) {
      return apiResponse.ErrorResponse(res, "Referral code has reached its maximum usage.");
    }

    // Check if the referral code matches
    if (referralCodeData.referralCode !== referralCode) {
      return apiResponse.ErrorResponse(res, "Invalid referral code.");
    }

    // Check if the referral code has expired
    if (new Date(referralCodeData.expiresAt) < new Date()) {
      return apiResponse.ErrorResponse(res, "Referral code has expired.");
    }

    // Increment the referral code usage count
    referralCodeData.count += 1;
    await referralCodeData.save();

    // Update the Address table, activating the address with the provided uuid
    await Models.Address.update(
      {
        activated: true,
        active_date: Date.now(),
        refered_by: phone,
      },
      {
        where: { uuid }
      }
    );

    // Respond with a success message
    return apiResponse.successResponseWithData(res, "Referral code used successfully.");
    
  } catch (err) {
    console.error("Error using referral codes:", err);
    return apiResponse.ErrorResponse(res, "Failed to fetch referral codes.");
  }
};


exports.getAllReferralCodes = async (req, res) => {
  try {
  const referrerCode = await Models.ReferralCode.findAll()

  if (referrerCode.length === 0) {
    return apiResponse.ErrorResponse(res, "No referral codes found.");
  }
 
  return apiResponse.successResponseWithData(res, "Referral codes fetched successfully." , referrerCode);
} catch (err) {
  console.error("Error fetching referral codes:", err);
  return apiResponse.ErrorResponse(res, "Failed to get all referral codes.");
}
};