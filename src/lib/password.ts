import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Hash de contraseñas con scrypt (NIST SP 800-63B): built-in de Node, sin nativos.
const PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, KEYLEN, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), hash.toString('base64')].join('$');
}

export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const [alg, n, r, p, saltB64, hashB64] = stored.split('$');
    if (alg !== 'scrypt' || !saltB64 || !hashB64) return false;
    const expected = Buffer.from(hashB64, 'base64');
    const actual = scryptSync(plain, Buffer.from(saltB64, 'base64'), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
