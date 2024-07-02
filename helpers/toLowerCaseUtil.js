// toLowerCaseUtil.js

module.exports = (obj) => {
    function toLowerCaseRecursive(obj) {
        if (typeof obj === 'string') {
            return obj.toLowerCase();
        } else if (Array.isArray(obj)) {
            return obj.map(toLowerCaseRecursive);
        } else if (obj && typeof obj === 'object') {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = toLowerCaseRecursive(obj[key]);
                return acc;
            }, {});
        }
        return obj;
    }

    return toLowerCaseRecursive(obj);
};
