const crypto = require('crypto');

function generateKeyAndIV() {
    const key = crypto.randomBytes(32); // Generate a 32-byte key for AES-256
    const iv = crypto.randomBytes(16);  // Generate a 16-byte IV for AES

    const base64Key = key.toString('base64');
    const base64IV = iv.toString('base64');

    return { base64Key, base64IV };
}

function main() {
    const { base64Key, base64IV } = generateKeyAndIV();
    console.log('Base64 Encoded Key:', base64Key);
    console.log('Base64 Encoded IV:', base64IV);
}

main();
