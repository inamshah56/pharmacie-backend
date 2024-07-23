// CURRENTLY ACTIVATED ENVIRONMENT
const SANDBOX = true
// FUNCTION TO GET JAZZ CASH CREDENTIALS
const getJazzCredentials = () => {
    if (SANDBOX) {
        return {
            merchantId: process.env.SANDBOX_JAZZCASH_MERCHANT_ID,
            password: process.env.SANDBOX_JAZZCASH_PASSWORD,
            salt: process.env.SANDBOX_JAZZCASH_HASH_SALT,
            sandbox: SANDBOX
        }
    }
    else {
        return {
            merchantId: process.env.JAZZCASH_MERCHANT_ID,
            password: process.env.JAZZCASH_PASSWORD,
            salt: process.env.JAZZCASH_HASH_SALT,
            sandbox: SANDBOX
        }
    }
};





module.exports = {
    getJazzCredentials
}