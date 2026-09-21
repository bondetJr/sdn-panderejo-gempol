import crypto from "crypto";

/**
 * Modul enkripsi untuk data PII (NIK, No. HP Orang Tua) yang disimpan
 * di database. Menggunakan AES-256-GCM (authenticated encryption) di
 * LEVEL APLIKASI — bukan pgcrypto di level database — supaya key
 * enkripsi tidak pernah dikirim ke Supabase/Postgres.
 *
 * Format string tersimpan: "v1:<iv-base64>:<authTag-base64>:<ciphertext-base64>"
 * Prefix versi ("v1") memudahkan rotasi key nanti tanpa merusak data lama.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // rekomendasi NIST untuk GCM
const VERSION = "v1";

function getEncryptionKey(): Buffer {
  const raw = process.env.PII_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "PII_ENCRYPTION_KEY belum di-set. Generate dengan: openssl rand -base64 32"
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "PII_ENCRYPTION_KEY harus 32 byte (hasil dari: openssl rand -base64 32)."
    );
  }
  return key;
}

function getHashKey(): Buffer {
  const raw = process.env.PII_HASH_KEY;
  if (!raw) {
    throw new Error(
      "PII_HASH_KEY belum di-set. Generate dengan: openssl rand -base64 32"
    );
  }
  return Buffer.from(raw, "base64");
}

/** Enkripsi teks (NIK, no HP) sebelum disimpan ke database. */
export function encryptPii(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/** Dekripsi nilai tersimpan — panggil HANYA saat perlu ditampilkan ke admin. */
export function decryptPii(stored: string): string {
  const [version, ivB64, tagB64, dataB64] = stored.split(":");
  if (version !== VERSION || !ivB64 || !tagB64 || !dataB64) {
    throw new Error(`Format data terenkripsi tidak valid (versi: ${version}).`);
  }
  const key = getEncryptionKey();
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(dataB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Hash deterministik (HMAC-SHA256) untuk PENCARIAN EXACT-MATCH & CEK
 * DUPLIKAT saja (mis. cari siswa via NIK, cek status PPDB). BUKAN
 * untuk menyimpan NIK asli — selalu iringi dengan encryptPii().
 *
 * Key HMAC sengaja terpisah dari key enkripsi (best practice: jangan
 * pakai 1 key untuk 2 tujuan kriptografi berbeda).
 */
export function hashPiiForLookup(plaintext: string): string {
  const key = getHashKey();
  const normalized = plaintext.trim();
  return crypto.createHmac("sha256", key).update(normalized).digest("hex");
}

/** Helper aman untuk tampilan admin — tidak melempar error kalau dekripsi gagal. */
export function safeDecryptPii(stored: string | null | undefined): string {
  if (!stored) return "-";
  try {
    return decryptPii(stored);
  } catch (err) {
    console.error("Gagal dekripsi PII:", err);
    return "(gagal dekripsi)";
  }
}
