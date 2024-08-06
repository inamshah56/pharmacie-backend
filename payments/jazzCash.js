const axios = require("axios");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

// ################################################################
//                        Helping Functions
// ################################################################

function generateRefNo() {
    ref_no = uuidv4();
    const ref_length = Math.floor((Math.random() * 5) + 14); // Random length between 15 to 20 to avoid the pp_secureHash error same length of txn_ref_no.
    ref_no = ref_no.replace(/-/g, "").slice(0, ref_length);
    return ref_no;
}

function getDateStr() {
    let date = new Date();
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    let hours = String(date.getHours()).padStart(2, "0");
    let minutes = String(date.getMinutes()).padStart(2, "0");
    let seconds = String(date.getSeconds()).padStart(2, "0");

    let dateStr = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return dateStr;
}

// ====================================================================

function getFutureDateStr(days) {
    let currentDate = new Date();
    let futureDate = new Date(
        currentDate.getTime() + days * 24 * 60 * 60 * 1000
    );

    let year = futureDate.getFullYear();
    let month = String(futureDate.getMonth() + 1).padStart(2, "0");
    let day = String(futureDate.getDate()).padStart(2, "0");
    let hours = String(futureDate.getHours()).padStart(2, "0");
    let minutes = String(futureDate.getMinutes()).padStart(2, "0");
    let seconds = String(futureDate.getSeconds()).padStart(2, "0");

    let dateStr = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return dateStr;
}

// ====================================================================

function createHash(payload, hashKey) {
    let unhashedString = hashKey;
    for (const key in payload) {
        if (payload[key]) {
            unhashedString += `&${payload[key]}`;
        }
    }
    const unhashedBuffer = Buffer.from(unhashedString, "utf-8");
    const secureHash = crypto
        .createHmac("sha256", hashKey)
        .update(unhashedBuffer)
        .digest("hex");
    return secureHash;
}

// ====================================================================

const sendRequest = async ({ payload, salt, url, data, credentials }) => {
    try {
        if (!credentials || !data) {
            return Promise.reject({
                message: "Incomplete reqeust, Please set credentials and data first, by using setCredentials and setData functions.",
                status: 400,
            });
        }
        payload.pp_SecureHash = createHash(payload, salt);
        console.log("Payload: ", payload)
        const response = await axios.post(url, payload);
        return { status: response.status, data: response.data };

    } catch (error) {
        return Promise.reject({
            message: error.response ? error.response.data : error.message,
            status: error.response ? error.response.status : 500
        });
    }
};

// ################################################################
//                      MWALLET Functions
// ################################################################

const resetMwallet = () => {
    MWALLET.payload = {
        pp_Amount: "",
        pp_BillReference: "",
        pp_CNIC: "",
        pp_Description: "",
        pp_DiscountedAmount: "",
        pp_Language: "EN",
        pp_MerchantID: "",
        pp_MobileNumber: "",
        pp_Password: "",
        pp_SubMerchantID: "",
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: "",
        pp_TxnExpiryDateTime: "", // default is 7, user can replace it by providing the expire days.
        pp_TxnRefNo: "",
        ppmpf_1: "",
        ppmpf_2: "",
        ppmpf_3: "",
        ppmpf_4: "",
        ppmpf_5: "",
    };
    MWALLET.credentials = false;
    MWALLET.data = false;
};

// ====================================================================

const getMwalletCredentials = ({ merchantId, password, salt, sandbox, subMerchantId }) => {
    try {
        if (!merchantId || !password || !salt || sandbox == null) {
            throw new Error(
                "Incomplete credentials, required fields are: merchantId, passowrd, salt, sandbox"
            );
        }
        MWALLET.payload.pp_MerchantID = merchantId;
        if (subMerchantId) MWALLET.payload.pp_SubMerchantID = subMerchantId; //it's not mendatory
        MWALLET.payload.pp_Password = password;
        MWALLET.salt = salt;
        if (sandbox == true) MWALLET.requestUrl = MWALLET.sandboxUrl + MWALLET.url;
        else MWALLET.requestUrl = MWALLET.liveUrl + MWALLET.url;
        MWALLET.credentials = true;
    } catch (error) {
        MWALLET.credentials = false;
        throw new Error(error.message);
    }
};

// ====================================================================


const setMWalletData = (
    { amount,
        billRefrence,
        cnic,
        description,
        discountedAmount,
        mobileNumber,
        txnRefNo,
        expireDays,
        ppmpf1,
        ppmpf2,
        ppmpf3,
        ppmpf4,
        ppmpf5 }
) => {
    try {
        if (
            !amount ||
            !description ||
            !mobileNumber ||
            !cnic
        ) {
            throw new Error(
                "Incomplete data, required fields are: amount, description, mobileNumber, cnic, "
            );
        }
        MWALLET.payload.pp_Amount = amount * 100;
        MWALLET.payload.pp_BillReference = billRefrence;
        MWALLET.payload.pp_CNIC = cnic;
        MWALLET.payload.pp_Description = description;
        MWALLET.payload.pp_DiscountedAmount = discountedAmount || "";
        MWALLET.payload.pp_MobileNumber = mobileNumber;
        const date = getDateStr();
        MWALLET.payload.pp_TxnDateTime = date;
        if (expireDays) MWALLET.payload.pp_TxnExpiryDateTime = getFutureDateStr(expireDays)
        else MWALLET.payload.pp_TxnExpiryDateTime = getFutureDateStr(30);
        MWALLET.payload.pp_TxnRefNo = txnRefNo || `T${date}`;
        MWALLET.payload.ppmpf_1 = ppmpf1 || "";
        MWALLET.payload.ppmpf_2 = ppmpf2 || "";
        MWALLET.payload.ppmpf_3 = ppmpf3 || "";
        MWALLET.payload.ppmpf_4 = ppmpf4 || "";
        MWALLET.payload.ppmpf_5 = ppmpf5 || "";
        MWALLET.data = true;
    } catch (error) {
        MWALLET.data = false;
        throw new Error(error.message);
    }
};



// ====================================================================

const sendMwalletRequest = async () => {
    try {
        const response = await sendRequest({ payload: MWALLET.payload, salt: MWALLET.salt, url: MWALLET.requestUrl, data: MWALLET.data, credentials: MWALLET.credentials })
        resetMwallet();
        return response;
    } catch (error) {
        resetMwallet();
        return Promise.reject(error)

    }

}

// ################################################################
//                      INQUIRY Functions
// ################################################################

// ====================================================================

const resetInquiry = () => {
    INQUIRY.payload = {
        pp_MerchantID: "",
        pp_Password: "",
        pp_TxnRefNo: "",
    };
    INQUIRY.credentials = false;
    INQUIRY.data = false;
};

// ====================================================================
const getInquiryCredentials = ({ merchantId, password, salt, sandbox }) => {
    try {
        if (!merchantId || !password || !salt || sandbox == null) {
            throw new Error(
                "Incomplete credentials, required fields are: merchantId, passowrd, salt, sandbox"
            );
        }
        INQUIRY.payload.pp_MerchantID = merchantId;
        INQUIRY.payload.pp_Password = password;
        INQUIRY.salt = salt;
        if (sandbox === true) INQUIRY.requestUrl = INQUIRY.sandboxUrl + INQUIRY.url;
        else INQUIRY.requestUrl = INQUIRY.liveUrl + INQUIRY.url;
        INQUIRY.credentials = true;
    } catch (error) {
        INQUIRY.credentials = false;
        throw new Error(error.message);
    }
};

// ====================================================================


const setInquiryData = ({ txnRefNo }) => {
    try {
        if (!txnRefNo) {
            throw new Error(
                "txnRefNo is required and is not provided."
            );
        }
        INQUIRY.payload.pp_TxnRefNo = txnRefNo;
        INQUIRY.data = true;
    } catch (error) {
        INQUIRY.data = false;
        throw new Error(error.message);
    }
};

// ====================================================================

const sendInquiryRequest = async () => {
    try {
        const response = await sendRequest({ payload: INQUIRY.payload, salt: INQUIRY.salt, url: INQUIRY.requestUrl, data: INQUIRY.data, credentials: INQUIRY.credentials })
        resetInquiry();
        return response;
    } catch (error) {
        resetInquiry();
        return Promise.reject(error)

    }

}
// ################################################################
//                          Payment Methods
// ################################################################


const MWALLET = {
    salt: "",
    credentials: false,
    data: false,
    url: "/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction",
    liveUrl: "https://payments.jazzcash.com.pk",
    sandboxUrl: "https://sandbox.jazzcash.com.pk",
    requestUrl: "",
    payload: {
        pp_Amount: "",
        pp_BillReference: "",
        pp_CNIC: "",
        pp_Description: "",
        pp_DiscountedAmount: "",
        pp_Language: "EN",
        pp_MerchantID: "",
        pp_MobileNumber: "",
        pp_Password: "",
        pp_SubMerchantID: "",
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: "",
        pp_TxnExpiryDateTime: "", // default is 7, user can replace it by providing the expire days.
        pp_TxnRefNo: "",
        ppmpf_1: "",
        ppmpf_2: "",
        ppmpf_3: "",
        ppmpf_4: "",
        ppmpf_5: "",
    },
    setCredentials: getMwalletCredentials,
    setData: setMWalletData,
    createRequest: sendMwalletRequest,
};

module.exports = { MWALLET };

// ################################################################

const INQUIRY = {
    salt: "",
    credentials: false,
    data: false,
    url: "/ApplicationAPI/API/PaymentInquiry/Inquire",
    liveUrl: "https://payments.jazzcash.com.pk",
    sandboxUrl: "https://sandbox.jazzcash.com.pk",
    requestUrl: "",
    payload: {
        pp_MerchantID: "",
        pp_Password: "",
        pp_TxnRefNo: "",
    },
    setCredentials: getInquiryCredentials,
    setData: setInquiryData,
    createRequest: sendInquiryRequest,
};

module.exports = { MWALLET, INQUIRY, createHash, generateRefNo };
