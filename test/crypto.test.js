"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var crypto_1 = require("../src/lib/crypto");
var password_1 = require("../src/lib/password");
var KEY = 'ab'.repeat(32); // 64 hex = 32 bytes
(0, vitest_1.describe)('crypto', function () {
    (0, vitest_1.it)('cifra y descifra con AES-256-GCM', function () {
        var token = (0, crypto_1.randomToken)();
        var enc = (0, crypto_1.encryptSecret)(token, KEY);
        (0, vitest_1.expect)(enc.startsWith('v1.')).toBe(true);
        (0, vitest_1.expect)(enc).not.toContain(token);
        (0, vitest_1.expect)((0, crypto_1.decryptSecret)(enc, KEY)).toBe(token);
    });
    (0, vitest_1.it)('el ciphertext alterado se rechaza', function () {
        var enc = (0, crypto_1.encryptSecret)('secreto', KEY);
        var _a = enc.split('.'), v = _a[0], iv = _a[1], tag = _a[2], data = _a[3];
        var buf = Buffer.from(data, 'base64url');
        buf[0] ^= 0xff;
        (0, vitest_1.expect)(function () { return (0, crypto_1.decryptSecret)([v, iv, tag, buf.toString('base64url')].join('.'), KEY); }).toThrow();
    });
    (0, vitest_1.it)('formato inválido de token → error', function () {
        (0, vitest_1.expect)(function () { return (0, crypto_1.decryptSecret)('basura', KEY); }).toThrow();
    });
    (0, vitest_1.it)('sha256hex estable y pseudónimos distintos por usuario', function () {
        (0, vitest_1.expect)((0, crypto_1.sha256hex)('abc')).toBe((0, crypto_1.sha256hex)('abc'));
        (0, vitest_1.expect)((0, crypto_1.pseudonymize)('user-1', 'sal')).toBe((0, crypto_1.pseudonymize)('user-1', 'sal'));
        (0, vitest_1.expect)((0, crypto_1.pseudonymize)('user-1', 'sal')).not.toBe((0, crypto_1.pseudonymize)('user-2', 'sal'));
        (0, vitest_1.expect)((0, crypto_1.pseudonymize)('user-1', 'sal')).not.toContain('user-1');
    });
});
(0, vitest_1.describe)('password (scrypt)', function () {
    (0, vitest_1.it)('verifica la correcta y rechaza la incorrecta', function () {
        var hash = (0, password_1.hashPassword)('clave-secreta1');
        (0, vitest_1.expect)((0, password_1.verifyPassword)('clave-secreta1', hash)).toBe(true);
        (0, vitest_1.expect)((0, password_1.verifyPassword)('otra-clave1', hash)).toBe(false);
    });
    (0, vitest_1.it)('salt distinto por hash', function () {
        (0, vitest_1.expect)((0, password_1.hashPassword)('clave-secreta1')).not.toBe((0, password_1.hashPassword)('clave-secreta1'));
    });
    (0, vitest_1.it)('hash corrupto → false sin lanzar', function () {
        (0, vitest_1.expect)((0, password_1.verifyPassword)('x', 'esto-no-es-un-hash')).toBe(false);
    });
});
