const Models = require('../models');
const apiResponse = require('../helpers/apiResponse');
const SellerAuh = require('../middlewares/sellerAuth');
const { getJazzCredentials } = require('../config/jazzCash.config');
const FARMACIE_CHARGES = 1000;
const { MWALLET, INQUIRY, createHash, generateRefNo } = require('../payments/jazzCash');


// =================================================================================
//                                GLOBAL VARIABLES
// =================================================================================


const jazz = getJazzCredentials();

// =================================================================================
//                                CONTROLERS
// =================================================================================
exports.jazzcashMwalletFarmacie = [
    SellerAuh,
    async (req, res) => {
        try {
            userId = req.user.id;
            // REQUIRED FIELDS
            const { phone, address_uuid, cnic, refered_by, address_id } = req.body;
            if (!phone) return apiResponse.validationErrorWithData(res, "Phone is required");
            if (!address_uuid) return apiResponse.validationErrorWithData(res, "address uuid is required");
            if (!address_id) return apiResponse.validationErrorWithData(res, "address id is required");
            if (!cnic) return apiResponse.validationErrorWithData(res, "cnic last 6 digit  is required");



            //FIELDS VALIDATION
            if (phone.length != 11) return apiResponse.validationErrorWithData(res, "Phone number is invalid");
            if (cnic.length != 6) return apiResponse.validationErrorWithData(res, "CNIC number is invalid");


            // FINDING THE FARM
            const address = await Models.Address.findOne({
                where: {
                    id: address_id,
                    uuid: address_uuid,
                },
                attributes: ["activated", "active_date", "ref_no", "response_code", "refered_by"]
            });
            if (!address) return apiResponse.validationErrorWithData(res, "Address not found, id or uuid is invalid");

            if (address.activated) return res.status(409).send({ success: true, message: "Already subscribed for simulator." });
            let ref_no = address.ref_no;
            if (ref_no) {
                if (!address.response_code || ["124", "157"].includes(address.response_code)) {
                    // JAZZCASH INQUIRY REQUEST TO CHECK THE PENDING STATUS.
                    INQUIRY.setCredentials({
                        merchantId: jazz.merchantId,
                        password: jazz.password,
                        salt: jazz.salt,
                        sandbox: jazz.sandbox
                    });

                    // SETTING THE DATA FOR JAZZCASH IQUIRY
                    INQUIRY.setData({
                        txnRefNo: ref_no,
                    });
                    const response = await INQUIRY.createRequest();
                    const inquiryResponse = response.data;
                    if (inquiryResponse.pp_ResponseCode == "000" || inquiryResponse.pp_ResponseCode == "121") {
                        // Creating the payment history logs.
                        await Models.PaymentHistory.create({
                            user_id: userId,
                            address_id: address_id,
                            refered_by: refered_by || address.refered_by,
                            unit_price: FARMACIE_CHARGES,
                            service: "farmacie",
                            sandbox: jazz.sandbox,
                            ref_no: ref_no,
                            retrival_ref_no: inquiryResponse.pp_RetrievalReferenceNo,
                            payment_provider: "jazzcash"
                        })
                        // SETTING THE RESPONSE CODES FOR FUTURE ACTIONS
                        await Models.Address.update(
                            {
                                activated: true,
                                active_date: new Date(),
                                response_code: "000",
                                refered_by: null,
                            },
                            {
                                where: { id: address_id, uuid: address_uuid }
                            });
                        return apiResponse.successResponseWithData(res, "Farmacie Shop activated successfully and is live now.", inquiryResponse);
                    }
                }
                // ELSE PROCEED AGAIN FOR PAYMENT
            }
            // GENERATE A NEW REF_NO
            ref_no = generateRefNo();

            // Updating the ref_no in DB first so that if the transaction not successful and we lost the the transaction we can check that status from ref_no.

            await Models.Address.update(
                {
                    ref_no: ref_no,
                    refered_by: refered_by || address.refered_by,
                    response_code: null
                },
                { where: { id: address_id, uuid: address_uuid } }
            );


            // // SIMULATOR CHARGES CALCULATION ACCORDING TO THE LAND SIZE.


            // SETTING JAZZCASH CREADENTIALS
            MWALLET.setCredentials({
                merchantId: jazz.merchantId,
                password: jazz.password,
                salt: jazz.salt,
                sandbox: jazz.sandbox
            });

            // SETTING THE DATA FOR JAZZCASH MWALLET
            MWALLET.setData({
                amount: FARMACIE_CHARGES,
                txnRefNo: ref_no,
                cnic: cnic,
                description: "Subscription for simulator",
                mobileNumber: phone,
                billRefrence: ref_no,
            });
            const response = await MWALLET.createRequest();

            // The try section after this will only run when we got the 200 status from the jazzCash.
            // If there is some error Jazz cash have it's own response codes But the global status is 200 means jazz Cash responding.

            // Now updating the address on the basis of reponse.
            const jazzResponse = response.data;
            console.log("jazzResponse ===============================\n", jazzResponse)

            // PAYMENT SUCCESSFUL
            if (jazzResponse.pp_ResponseCode == "000" || jazzResponse.pp_ResponseCode == "121") {
                message = "Simulator activated successfully";
                // Creating the payment history logs.
                await Models.PaymentHistory.create({
                    user_id: userId,
                    address_id: address_id,
                    refered_by: refered_by || address.refered_by,
                    unit_price: FARMACIE_CHARGES,
                    service: "farmacie",
                    sandbox: jazz.sandbox,
                    ref_no: ref_no,
                    retrival_ref_no: jazzResponse.pp_RetreivalReferenceNo,
                    payment_provider: "jazzcash"
                })
                // SETTING THE RESPONSE CODES FOR FUTURE ACTIONS
                await Models.Address.update({
                    activated: true,
                    active_date: new Date(),
                    response_code: "000",
                    refered_by: null,
                }, {
                    where: { id: address_id }
                });
                return apiResponse.successResponseWithData(res, "Farmacie Shop activated successfully and is live now.", jazzResponse);
            }
            // PAYMENET NOT SUCCESSFUL
            // SETTING THE RESPONSE CODES FOR FUTURE ACTIONS
            await Models.Address.update({
                response_code: jazzResponse.pp_ResponseCode,
                refered_by: refered_by || address.refered_by,
            }, {
                where: { id: address_id, uuid: address_uuid }
            });
            // INVALID MERCHANT CREADENTIALS
            if (jazzResponse.pp_ResponseCode == '101') return apiResponse.ErrorResponse(res, "Merchant creadentials are invalid, Backend error");
            // INVALID VALUE OF SOME VARIABLE IN PAYLOAD
            if (jazzResponse.pp_ResponseCode == '110') return apiResponse.ErrorResponse(res, jazzResponse.pp_ResponseMessage);
            // INVALID HASH RECEIVED
            if (jazzResponse.pp_ResponseCode == '115') return apiResponse.ErrorResponse(res, jazzResponse.pp_ResponseMessage);
            // INVALID TRANSACTION OR MISUSE OF CARD BY SOMEONE ELSE OR FRAUD
            if (jazzResponse.pp_ResponseCode == '409') return apiResponse.ErrorResponse(res, "Error while processing the transaction, Please try again later");
            // REQUEST REJECTED
            if (jazzResponse.pp_ResponseCode == '430') return apiResponse.ErrorResponse(res, "Your request rejected by the jazzCash, Please try again later");
            // SERVER FAILED or JAZZCASH BUSY
            if (jazzResponse.pp_ResponseCode == '431') return apiResponse.ErrorResponse(res, "JazzCash is down, Please try again later");
            // TRANSACTION FAILED
            if (jazzResponse.pp_ResponseCode == '999') return apiResponse.ErrorResponse(res, jazzResponse.pp_ResponseMessage);

            // PENDING STATUS
            if (jazzResponse.pp_ResponseCode == '124' || jazzResponse.pp_ResponseCode == '157') return res.status(202).send({ "message": "Transaction pending, Accept the payment request and recheck the status." });
            if (jazzResponse.pp_ResponseCode == "58") return res.status(202).send({ "message": "Transaction timed out, Please recheck the status in a while." });
            if (jazzResponse.pp_ResponseCode == "432") return res.status(202).send({ "message": "Server is busy, Please recheck the status in a while." });

            // OTHER RESPONSE CODES
            return apiResponse.validationErrorWithData(res, jazzResponse.pp_ResponseMessage);

        } catch (error) {
            console.log("error ===============================\n", error)
            return apiResponse.ErrorResponse(res, "Error in the JazzCash request, Please check the backend.");
        }
    }]





