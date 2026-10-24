import { describe, expect, it } from 'vitest';
import { decryptSecret, encryptSecret, pseudonymize, randomToken, sha256hex } from '../src/lib/crypto';
import { hashPassword, verifyPassword } from '../src/lib/password';

const KEY = 'ab'.repeat(32); // 64 hex = 32 bytes

describe('crypto', () => {
  it('cifra y descifra con AES-256-GCM', () => {
    const token = randomToken();
    const enc = encryptSecret(token, KEY);
    expect(enc.startsWith('v1.')).toBe(true);
    expect(enc).not.toContain(token);
    expect(decryptSecret(enc, KEY)).toBe(token);
  });

  it('el ciphertext alterado se rechaza', () => {
    const enc = encryptSecret('secreto', KEY);
    const [v, iv, tag, data] = enc.split('.');
    const buf = Buffer.from(data, 'base64url');
    buf[0] ^= 0xff;
    expect(() => decryptSecret([v, iv, tag, buf.toString('base64url')].join('.'), KEY)).toThrow();
  });

  it('formato inválido de token → error', () => {
    expect(() => decryptSecret('basura', KEY)).toThrow();
  });

  it('sha256hex estable y pseudónimos distintos por usuario', () => {
    expect(sha256hex('abc')).toBe(sha256hex('abc'));
    expect(pseudonymize('user-1', 'sal')).toBe(pseudonymize('user-1', 'sal'));
    expect(pseudonymize('user-1', 'sal')).not.toBe(pseudonymize('user-2', 'sal'));
    expect(pseudonymize('user-1', 'sal')).not.toContain('user-1');
  });
});

describe('password (scrypt)', () => {
  it('verifica la correcta y rechaza la incorrecta', () => {
    const hash = hashPassword('clave-secreta1');
    expect(verifyPassword('clave-secreta1', hash)).toBe(true);
    expect(verifyPassword('otra-clave1', hash)).toBe(false);
  });

  it('salt distinto por hash', () => {
    expect(hashPassword('clave-secreta1')).not.toBe(hashPassword('clave-secreta1'));
  });

  it('hash corrupto → false sin lanzar', () => {
    expect(verifyPassword('x', 'esto-no-es-un-hash')).toBe(false);
  });
});
