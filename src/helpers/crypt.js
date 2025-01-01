// const crypto = require('crypto');
// require("dotenv").config();

// const SECRET = crypto.createHash('sha256').update(process.env["MASTER_SECRET"]).digest(); // Ensure 32-byte key

// // Encryption function
// function encrypt(text) {
//   const IV = crypto.randomBytes(16); // Generate a random 16-byte Initialization Vector
//   const cipher = crypto.createCipheriv('aes-256-cbc', SECRET, IV);

//   let encrypted = cipher.update(text, 'utf8', 'hex');
//   encrypted += cipher.final('hex');

//   // Return both the encrypted data and the IV
//   return {
//     iv: IV.toString('hex'),
//     encryptedData: encrypted,
//   };
// }

// // Decryption function
// function decrypt(encryptedText, iv) {
//   const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET, Buffer.from(iv, 'hex'));

//   let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');

//   return decrypted;
// }

// exports.encrypt = encrypt;
// exports.decrypt = decrypt;


const crypto = require('crypto');
require("dotenv").config();

const SECRET = crypto.createHash('sha256').update(process.env["MASTER_SECRET"]).digest(); // Ensure 32-byte key

// Encryption function
function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', SECRET, Buffer.alloc(16, 0)); // Use a zero-filled IV
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decryption function
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET, Buffer.alloc(16, 0)); // Use the same zero-filled IV
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
