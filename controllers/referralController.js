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
 
    if (typeof phone === 'string' && phone.startsWith('[') && phone.endsWith(']')) {
      phone = JSON.parse(phone);  // Parses stringified array into an actual array
    } else if (typeof phone === 'string') {
      phone = [phone]; // Wrap single phone numbers in an array
    }

    // Trim whitespace and remove any empty strings from the phone array
    phone = phone.map(p => p.trim()).filter(p => p);

    const referralEntries = [];

    for (const phoneNumber of phone) {
      // Check if an active referral code already exists for this phone
      const existingCode = await Models.ReferralCode.findOne({
        where: {
          phone: phoneNumber,
          [Op.and]: [
            { expiresAt: { [Op.gt]: new Date() } },  // Not expired by time
            { count: { [Op.lt]: 50 } }               // Not reached max usage
          ]
        }
      });

      if (existingCode) {
        // Add existing code to the result array if it’s still valid
        referralEntries.push(existingCode);
      } else {
        // Generate a new unique referral code for this phone number
        const newCode = await generateUniqueCode();

        // Create an object for bulk insertion later
        referralEntries.push({
          phone: phoneNumber,  // Store as string in the database
          referralCode: newCode,
          count: 0,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });
      }
    }

    // Bulk insert new referral entries if there are any new entries
    const newEntries = referralEntries.filter(entry => !entry.id); // Filter to insert only new records
    if (newEntries.length > 0) {
      await Models.ReferralCode.bulkCreate(newEntries);
    }

    // Fetch all entries related to the provided phone numbers for final output
    const result = await Models.ReferralCode.findAll({
      where: { phone: { [Op.in]: phone } }
    });

    return apiResponse.successResponseWithData(res, "Referral codes generated successfully.", result);
  } catch (err) {
    console.error("Error generating referral codes:", err);
    return apiResponse.ErrorResponse(res, "Failed to generate referral codes.");
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
  
  if (!referrerCode) {
    return apiResponse.ErrorResponse(res, "No referral codes found.");
  }
 
  return apiResponse.successResponseWithData(res, "Referral codes fetched successfully." , referrerCode);
} catch (err) {
  console.error("Error fetching referral codes:", err);
  return apiResponse.ErrorResponse(res, "Failed to get all referral codes.");
}
};