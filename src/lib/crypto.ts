import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';

// Cifrado autenticado (AES-256-GCM) para tokens de la IPS y refresh_token de Google.
// Formato: v1.<iv b64url>.<tag b64url>.<ciphertext b64url>
export function encryptSecret(plain: string, keyHex: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64url'), tag.toString('base64url'), enc.toString('base64url')].join('.');
}

export function decryptSecret(payload: string, keyHex: string): string {
  const [version, ivB64, tagB64, dataB64] = payload.split('.');
  if (version !== 'v1' || !ivB64 || !tagB64 || !dataB64) {
    throw new Error('Token IPS con formato inválido');
  }
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), Buffer.from(ivB64, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64url')), decipher.final()]).toString('utf8');
}

export function sha256hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

// Seudónimo estable: HMAC(userId, APP_SECRET). Sin la clave no se revierte → prueba de consentimiento.
export function pseudonymize(userId: string, secret: string): string {
  return createHmac('sha256', secret).update(userId).digest('hex');
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}
