const apiResponse = require("../helpers/apiResponse");
const Models = require("../models");
const crypto = require('crypto');

// ###################################################
//                 Helping Functions
// ###################################################

const generateReferralCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';
  for (let i = 0; i < 10; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    referralCode += characters[randomIndex];
  }
  return referralCode;
};

// ########################################################################################################

// ###################################################
//                 getAllReferralCodes
// ###################################################

exports.getAllReferralCodes = async (req, res) => {
  try {
    const referralCodes = await Models.ReferralCode.findAll()

    if (referralCodes.length === 0) {
      return apiResponse.ErrorResponse(res, "No referral codes found.");
    }

    return apiResponse.successResponseWithData(res, "Referral codes fetched successfully.", referralCodes);
  } catch (err) {
    console.error("Error fetching referral codes:", err);
    return apiResponse.ErrorResponse(res, "Failed to get all referral codes.");
  }
};

// ###################################################
//                generateReferralCodes
// ###################################################

exports.generateReferralCodes = async (req, res) => {
  try {
    let { phone, maxDays, maxUsage } = req.body;

    if (!phone) return apiResponse.ErrorResponse(res, "`phone` is required.");
    if (!maxDays) return apiResponse.ErrorResponse(res, "`maxDays` is required.");
    if (!maxUsage) return apiResponse.ErrorResponse(res, "`maxUsage` is required.");

    phone = phone.trim();

    // Check if a referral code already exists
    const existingCode = await Models.ReferralCode.findOne({ where: { phone } });

    if (existingCode) {
      return apiResponse.ErrorResponse(res, "Referral code already exists for this phone number.");
    }

    // Generate a new referral code
    const code = generateReferralCode();

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + maxDays);

    // Create the referral code entry in the database
    await Models.ReferralCode.create({
      phone,
      referralCode: code,
      maxDays,
      expiresAt,
      maxUsage
    });

    return apiResponse.successResponse(res, "Referral code generated successfully.");
  } catch (err) {
    console.error("Error generating referral code:", err);
    return apiResponse.ErrorResponse(res, "Failed to generate referral code.");
  }
};


// ###################################################
//                updateReferralCode
// ###################################################

exports.updateReferralCode = async (req, res) => {
  try {
    const { referredBy } = req.query
    const { daysToAdd, increaseUsage } = req.body;

    if (!referredBy) return apiResponse.ErrorResponse(res, "`referredBy` query parameter is required.");

    // Find the referral code by phone number
    const referralCodeData = await Models.ReferralCode.findOne({ where: { phone: referredBy } });

    if (!referralCodeData) {
      return apiResponse.ErrorResponse(res, 'Referral code not found for this phone number.');
    }

    if (daysToAdd) {
      // Start with the current expiresAt value or the current date if not set
      const expiresAt = referralCodeData.expiresAt ? new Date(referralCodeData.expiresAt) : new Date();

      // Add the specified number of days to the expiresAt date
      expiresAt.setDate(expiresAt.getDate() + daysToAdd);
      referralCodeData.expiresAt = expiresAt;
    }

    if (increaseUsage) {
      const newMaxUsage = referralCodeData.maxUsage + increaseUsage;

      // Check if the new maxUsage is less than usageCount
      if (newMaxUsage < referralCodeData.usageCount) {
        return apiResponse.ErrorResponse(res, 'Total attempts left cannot be less than the current used count.');
      }
      referralCodeData.maxUsage = newMaxUsage;
    }

    if (daysToAdd) referralCodeData.maxDays += daysToAdd

    // Save the updated referral code data
    await referralCodeData.save();

    // Return a success response after the update
    return apiResponse.successResponse(res, 'Referral code updated successfully.');
  } catch (error) {
    console.error('Error updating referral code:', error);
    return apiResponse.ErrorResponse(res, 'An error occurred while updating the referral code.');
  }
};


// ###################################################
//                  deleteReferralCode
// ###################################################

exports.deleteReferralCode = async (req, res) => {
  try {
    const { referredBy } = req.query;

    if (!referredBy) return apiResponse.ErrorResponse(res, "`referredBy` query parameter is required.");

    const referralCodeData = await Models.ReferralCode.findOne({ where: { phone: referredBy } });

    if (!referralCodeData) {
      return apiResponse.ErrorResponse(res, 'No referral code found for this phone number.');
    }

    // Delete the referral code
    await referralCodeData.destroy();

    // Return a success response after deletion
    return apiResponse.successResponse(res, 'Referral code deleted successfully.');
  } catch (error) {
    console.error('Error deleting referral code:', error);
    return apiResponse.ErrorResponse(res, 'An error occurred while deleting the referral code.');
  }
};

// ###################################################
//                useReferralCodes
// ###################################################

exports.useReferralCodes = async (req, res) => {
  try {
    // Extract `uuid` from query parameters and `phone`, `referralCode` from request body
    const { uuid } = req.query;
    const { referredBy, referralCode } = req.body;

    if (!uuid) {
      return apiResponse.ErrorResponse(res, "`uuid` query parameter is required.");
    }

    // Query the Address table to check if the address is already activated
    const addressData = await Models.Address.findOne({ where: { uuid } });

    if (!addressData) {
      // Handle the case where the address with the given UUID does not exist
      return apiResponse.ErrorResponse(res, "Address not found.");
    }

    if (addressData.activated) {
      // If the address is already activated, return an error response
      return apiResponse.ErrorResponse(res, "Address is already activated.");
    }

    if (!referredBy) {
      return apiResponse.ErrorResponse(res, "`referredBy` is required.");
    }
    if (!referralCode) {
      return apiResponse.ErrorResponse(res, "`referralCode` is required.");
    }

    // Check if the phone number exists in the ReferralCode table
    const referralCodeData = await Models.ReferralCode.findOne({
      where: { phone: referredBy }
    });

    // If the referral code data is not found, return an error
    if (!referralCodeData) {
      return apiResponse.ErrorResponse(res, "Invalid Referral code.");
    }

    // Check if the referral code matches
    if (referralCodeData.referralCode !== referralCode) {
      return apiResponse.ErrorResponse(res, "Invalid referral code.");
    }

    // Check if the referral code has expired
    if (new Date(referralCodeData.expiresAt) < new Date()) {
      return apiResponse.ErrorResponse(res, "Referral code has expired.");
    }

    // Check if the referral code has reached maximum usage
    if (referralCodeData.usageCount >= referralCodeData.maxUsage) {
      return apiResponse.ErrorResponse(res, "Referral code has reached its maximum usage.");
    }

    // Update the Address table, activating the address with the provided uuid
    const [updatedRowCount] = await Models.Address.update(
      {
        activated: true,
        active_date: Date.now(),
        refered_by: referredBy,
      },
      {
        where: { uuid }
      }
    );

    // Check if any rows were updated
    if (updatedRowCount > 0) {
      // Increment the referral code usage count only if the address was updated
      referralCodeData.usageCount += 1;
      await referralCodeData.save();

      // Send a success response
      return apiResponse.successResponse(res, "Referral code used successfully.");
    } else {
      // This else block is generally not needed due to the previous checks
      return apiResponse.ErrorResponse(res, "Failed to activate the address.");
    }
  } catch (err) {
    console.error("Error using referral codes:", err);
    return apiResponse.ErrorResponse(res, "Failed to use referral codes.");
  }
};