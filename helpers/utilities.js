const crypto = require('crypto');
const envExport = require('./env');
const utilites = {};

utilites.perseJSON = (jsonString) => {
    let output = {};

    try {
        output = JSON.parse(jsonString);
    } catch (err) {
        output = { err };
    }

    return output;
};

console.log(this.perseJSON);

utilites.hash = (string) => {
    if (typeof string === 'string' && string.length > 0) {
        const hash = crypto.createHmac('sha256', envExport.secretKey).update(string).digest('hex');
        return hash;
    } else {
        return null;
    }
};

module.exports = utilites;
