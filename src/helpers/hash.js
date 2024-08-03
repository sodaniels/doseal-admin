const bcrypt = require('bcrypt');
const saltRounds = 10;

async function Hash(plainTextPassword) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
}

exports.Hash = Hash