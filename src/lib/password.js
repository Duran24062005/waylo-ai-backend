"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
var node_crypto_1 = require("node:crypto");
// Hash de contraseñas con scrypt (NIST SP 800-63B): built-in de Node, sin nativos.
var PARAMS = { N: 16384, r: 8, p: 1 };
var KEYLEN = 64;
function hashPassword(plain) {
    var salt = (0, node_crypto_1.randomBytes)(16);
    var hash = (0, node_crypto_1.scryptSync)(plain, salt, KEYLEN, PARAMS);
    return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), hash.toString('base64')].join('$');
}
function verifyPassword(plain, stored) {
    try {
        var _a = stored.split('$'), alg = _a[0], n = _a[1], r = _a[2], p = _a[3], saltB64 = _a[4], hashB64 = _a[5];
        if (alg !== 'scrypt' || !saltB64 || !hashB64)
            return false;
        var expected = Buffer.from(hashB64, 'base64');
        var actual = (0, node_crypto_1.scryptSync)(plain, Buffer.from(saltB64, 'base64'), expected.length, {
            N: Number(n),
            r: Number(r),
            p: Number(p),
        });
        return (0, node_crypto_1.timingSafeEqual)(actual, expected);
    }
    catch (_b) {
        return false;
    }
}
