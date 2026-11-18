import pool from "../config/database.js";

export async function getOrCreateTemple(
  code: string,
  name: string,
  extra?: { address?: string; village?: string; district?: string; postalCode?: string }
): Promise<string> {
  const cleanCode = (code || "TPL-2026-0482").trim();
  const cleanName = (name || "Sri Sambodhi Maha Viharaya").trim();

  // 1. Check if temple already exists by code
  const existing = await pool.query(
    `SELECT "id" FROM temples WHERE LOWER("code") = LOWER($1) LIMIT 1`,
    [cleanCode]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  // 2. Otherwise insert new temple record with QR Code URL
  const templeId = `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const qrCodeUrl = `temple.lk/join/${cleanCode}`;

  const insertRes = await pool.query(
    `INSERT INTO temples (
      "id", "code", "name", "address", "village", "district", "postalCode", "qrCodeUrl", "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING "id"`,
    [
      templeId,
      cleanCode,
      cleanName,
      extra?.address || "Kadokkele, Gampaha",
      extra?.village || "Temple Road",
      extra?.district || "Gampaha",
      extra?.postalCode || "82200",
      qrCodeUrl
    ]
  );

  return insertRes.rows[0].id;
}

