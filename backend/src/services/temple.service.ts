import { randomBytes } from "crypto";
import pool from "../config/database.js";

export async function getOrCreateTemple(
  code: string,
  name: string,
  extra?: { address?: string; village?: string; district?: string; postalCode?: string }
): Promise<string> {
  const cleanCode = (code || "").trim();
  const cleanName = (name || "").trim();

  // 1. Check if temple already exists by code or by name
  if (cleanCode || cleanName) {
    const existing = await pool.query(
      `SELECT "id", "code", "name" FROM temples 
       WHERE (LOWER("code") = LOWER($1) AND $1 <> '') 
          OR (LOWER("name") = LOWER($2) AND $2 <> '') 
       LIMIT 1`,
      [cleanCode, cleanName]
    );

    if (existing.rows.length > 0) {
      const found = existing.rows[0];
      // Keep code in sync if a new valid code is provided
      if (cleanCode && found.code !== cleanCode) {
        await pool.query(
          `UPDATE temples SET "code" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2`,
          [cleanCode, found.id]
        );
      }
      return found.id;
    }
  }

  // 2. Otherwise insert new temple record with QR Code URL
  const templeId = `tpl-${Date.now()}-${randomBytes(3).toString("hex")}`;
  const effectiveCode = cleanCode || `TPL-${Date.now().toString().slice(-4)}`;
  const effectiveName = cleanName || "Buddhist Temple";
  const qrCodeUrl = `temple.lk/join/${effectiveCode}`;

  const insertRes = await pool.query(
    `INSERT INTO temples (
      "id", "code", "name", "address", "village", "district", "postalCode", "qrCodeUrl", "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING "id"`,
    [
      templeId,
      effectiveCode,
      effectiveName,
      extra?.address || "Temple Premises",
      extra?.village || "Parish",
      extra?.district || "Colombo",
      extra?.postalCode || "00100",
      qrCodeUrl
    ]
  );

  return insertRes.rows[0].id;
}
