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

utilites.randomString = (stringLength) => {
    let length = stringLength;
    length = typeof stringLength === 'number' && stringLength > 0 ? stringLength : false;

    if (length) {
        const tokenCharacter = 'abcdefghijklmnopqrestvwxyz0123456789';
        let tokenOutput = '';

        for (let i = 1; i <= length; i++) {
            const randomCharacter = tokenCharacter.charAt(
                Math.floor(Math.random() * tokenCharacter.length),
            );
            tokenOutput += randomCharacter;
        }
        return tokenOutput;
    } else {
        return false, 'Can not create random token, please provide number';
    }
};

utilites.hash = (string) => {
    if (typeof string === 'string' && string.length > 0) {
        const hash = crypto.createHmac('sha256', envExport.secretKey).update(string).digest('hex');
        return hash;
    } else {
        return null;
    }
};

module.exports = utilites;
