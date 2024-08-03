const crypto = require('crypto');
require("dotenv").config();

const SECRET = process.env["MASTER_SECRET"];

// Encryption function
function encrypt(text) {
  const cipher = crypto.Cipher('aes-256-cbc', SECRET);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decryption function
function decrypt(encryptedText) {
  const decipher = crypto.Decipher('aes-256-cbc', SECRET);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

exports.encrypt = encrypt
exports.decrypt = decrypt
