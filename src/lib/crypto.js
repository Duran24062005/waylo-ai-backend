"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptSecret = encryptSecret;
exports.decryptSecret = decryptSecret;
exports.sha256hex = sha256hex;
exports.pseudonymize = pseudonymize;
exports.randomToken = randomToken;
var node_crypto_1 = require("node:crypto");
// Cifrado autenticado (AES-256-GCM) para tokens de la IPS y refresh_token de Google.
// Formato: v1.<iv b64url>.<tag b64url>.<ciphertext b64url>
function encryptSecret(plain, keyHex) {
    var iv = (0, node_crypto_1.randomBytes)(12);
    var cipher = (0, node_crypto_1.createCipheriv)('aes-256-gcm', Buffer.from(keyHex, 'hex'), iv);
    var enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    var tag = cipher.getAuthTag();
    return ['v1', iv.toString('base64url'), tag.toString('base64url'), enc.toString('base64url')].join('.');
}
function decryptSecret(payload, keyHex) {
    var _a = payload.split('.'), version = _a[0], ivB64 = _a[1], tagB64 = _a[2], dataB64 = _a[3];
    if (version !== 'v1' || !ivB64 || !tagB64 || !dataB64) {
        throw new Error('Token IPS con formato inválido');
    }
    var decipher = (0, node_crypto_1.createDecipheriv)('aes-256-gcm', Buffer.from(keyHex, 'hex'), Buffer.from(ivB64, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64url')), decipher.final()]).toString('utf8');
}
function sha256hex(value) {
    return (0, node_crypto_1.createHash)('sha256').update(value).digest('hex');
}
// Seudónimo estable: HMAC(userId, APP_SECRET). Sin la clave no se revierte → prueba de consentimiento.
function pseudonymize(userId, secret) {
    return (0, node_crypto_1.createHmac)('sha256', secret).update(userId).digest('hex');
}
function randomToken(bytes) {
    if (bytes === void 0) { bytes = 32; }
    return (0, node_crypto_1.randomBytes)(bytes).toString('base64url');
}
