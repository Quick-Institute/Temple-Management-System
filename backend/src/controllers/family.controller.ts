import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../config/database.js";
import { logAuditTrail } from "../services/audit.service.js";
import { getOrCreateTemple } from "../services/temple.service.js";

// Helper to format clean alphanumeric phone and NIC
function sanitize(val?: string | null): string {
  return val ? val.trim().toLowerCase() : "";
}

// GET /api/families/check-duplicate - Real-time duplicate check (FR-37)
export async function checkDuplicate(req: Request, res: Response) {
  try {
    const { nic, phone, email } = req.query;

    const cleanNic = sanitize(nic as string);
    const cleanPhone = (phone as string || "").replace(/[^0-9]/g, "");
    const cleanEmail = sanitize(email as string);

    if (!cleanNic && !cleanPhone && !cleanEmail) {
      return res.json({ duplicate: false });
    }

    // 1. Check NIC system-wide (Strict Inter-Temple Barrier FR-37)
    if (cleanNic && cleanNic.length >= 8) {
      const nicMatch = await pool.query(
        `SELECT 
          f."id", f."familyCode", f."name", f."phone", f."email", f."nic", f."village",
          t."name" as "templeName", t."code" as "templeCode"
        FROM families f
        LEFT JOIN temples t ON f."templeId" = t."id"
        WHERE LOWER(f."nic") = $1
        LIMIT 1`,
        [cleanNic]
      );

      if (nicMatch.rows.length > 0) {
        const found = nicMatch.rows[0];
        return res.json({
          duplicate: true,
          matchType: "National ID (NIC)",
          name: found.name,
          familyCode: found.familyCode,
          phone: found.phone,
          templeName: found.templeName || "Affiliated Parish Temple",
          templeCode: found.templeCode,
          village: found.village,
          message: `This National ID (${cleanNic.toUpperCase()}) is already registered under "${found.name}" at "${found.templeName}". Duplicate accounts are not permitted. Please use Temple Transfer instead.`
        });
      }
    }

    // 2. Check Phone
    if (cleanPhone && cleanPhone.length >= 7) {
      const phoneMatch = await pool.query(
        `SELECT 
          f."id", f."familyCode", f."name", f."phone", f."email", f."nic", f."village",
          t."name" as "templeName", t."code" as "templeCode"
        FROM families f
        LEFT JOIN temples t ON f."templeId" = t."id"
        WHERE REGEXP_REPLACE(f."phone", '[^0-9]', '', 'g') LIKE $1
        LIMIT 1`,
        [`%${cleanPhone}%`]
      );

      if (phoneMatch.rows.length > 0) {
        const found = phoneMatch.rows[0];
        return res.json({
          duplicate: true,
          matchType: "Mobile Phone Number",
          name: found.name,
          familyCode: found.familyCode,
          phone: found.phone,
          templeName: found.templeName || "Affiliated Parish Temple",
          templeCode: found.templeCode,
          village: found.village,
          message: `This phone number (${found.phone}) is already associated with "${found.name}" (${found.templeName}).`
        });
      }
    }

    // 3. Check Email
    if (cleanEmail && cleanEmail.includes("@")) {
      const emailMatch = await pool.query(
        `SELECT 
          f."id", f."familyCode", f."name", f."phone", f."email", f."nic", f."village",
          t."name" as "templeName", t."code" as "templeCode"
        FROM families f
        LEFT JOIN temples t ON f."templeId" = t."id"
        WHERE LOWER(COALESCE(f."email", '')) = $1
        LIMIT 1`,
        [cleanEmail]
      );

      if (emailMatch.rows.length > 0) {
        const found = emailMatch.rows[0];
        return res.json({
          duplicate: true,
          matchType: "Email Address",
          name: found.name,
          familyCode: found.familyCode,
          phone: found.phone,
          templeName: found.templeName || "Affiliated Parish Temple",
          templeCode: found.templeCode,
          village: found.village,
          message: `This email address is already linked with family "${found.name}".`
        });
      }
    }

    res.json({ duplicate: false });
  } catch (error) {
    console.error("Duplicate check error:", error);
    res.status(500).json({ duplicate: false, error: "Check failed" });
  }
}

// GET /api/families - List families with dependents (FR-23, FR-09)
export async function getFamilies(req: Request, res: Response) {
  try {
    const { q, ward, status, templeCode } = req.query;

    let queryText = `
      SELECT 
        f."id",
        f."familyCode",
        f."templeId",
        t."name" as "templeName",
        t."code" as "templeCode",
        f."firstName",
        f."lastName",
        f."name",
        f."alias",
        f."nic",
        f."email",
        f."phone",
        f."address",
        f."village",
        f."district",
        f."postalCode",
        f."ward",
        f."status",
        f."enrollmentMode",
        f."enrollmentType",
        f."certificateNumber",
        f."familyQrPass",
        f."deactivateReason",
        f."deactivateNotes",
        f."danaTurnNotes",
        f."clericalNotes",
        f."createdAt",
        f."updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', m."id",
              'name', m."fullName",
              'role', m."relationship",
              'age', m."age",
              'gender', m."gender"
            )
          ) FILTER (WHERE m."id" IS NOT NULL),
          '[]'
        ) as "members"
      FROM families f
      LEFT JOIN temples t ON f."templeId" = t."id"
      LEFT JOIN family_members m ON f."id" = m."familyId"
      WHERE 1=1
    `;

    const queryParams: unknown[] = [];

    // Multi-tenancy temple isolation (FR-09)
    if (templeCode && typeof templeCode === "string" && templeCode.trim() !== "") {
      queryParams.push(templeCode.trim());
      queryText += ` AND (t."code" = $${queryParams.length} OR t."code" IS NULL)`;
    }

    // Ward filter
    if (ward && typeof ward === "string" && ward !== "all") {
      queryParams.push(ward.toLowerCase());
      queryText += ` AND LOWER(f."ward") = $${queryParams.length}`;
    }

    // Status filter
    if (status && typeof status === "string" && status !== "all") {
      queryParams.push(status.toLowerCase());
      queryText += ` AND LOWER(f."status") = $${queryParams.length}`;
    }

    // Search query
    if (q && typeof q === "string" && q.trim() !== "") {
      const term = `%${q.trim().toLowerCase()}%`;
      queryParams.push(term);
      const idx = queryParams.length;
      queryText += ` AND (
        LOWER(f."name") LIKE $${idx} OR
        LOWER(f."familyCode") LIKE $${idx} OR
        LOWER(f."nic") LIKE $${idx} OR
        LOWER(f."phone") LIKE $${idx} OR
        LOWER(COALESCE(f."email", '')) LIKE $${idx} OR
        LOWER(f."village") LIKE $${idx} OR
        LOWER(f."address") LIKE $${idx}
      )`;
    }

    queryText += `
      GROUP BY f."id", t."name", t."code"
      ORDER BY f."createdAt" DESC
    `;

    const result = await pool.query(queryText, queryParams);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching families:", error);
    res.status(500).json({ success: false, message: "Internal server error fetching families" });
  }
}

// GET /api/families/:id - Get single family with members & transfers
export async function getFamilyById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const familyRes = await pool.query(
      `SELECT 
        f.*,
        t."name" as "templeName",
        t."code" as "templeCode"
      FROM families f
      LEFT JOIN temples t ON f."templeId" = t."id"
      WHERE f."id" = $1 OR f."familyCode" = $1
      LIMIT 1`,
      [id]
    );

    if (familyRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Family record not found" });
    }

    const family = familyRes.rows[0];
    delete family.passwordHash;

    // Get members
    const membersRes = await pool.query(
      `SELECT "id", "fullName" as "name", "relationship" as "role", "age", "gender"
       FROM family_members WHERE "familyId" = $1 ORDER BY "createdAt" ASC`,
      [family.id]
    );
    family.members = membersRes.rows;

    // Get transfers
    const transfersRes = await pool.query(
      `SELECT * FROM family_transfers WHERE "familyId" = $1 ORDER BY "effectiveDate" DESC`,
      [family.id]
    );
    family.transfers = transfersRes.rows;

    res.json({ success: true, data: family });
  } catch (error) {
    console.error("Error fetching family by id:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// POST /api/families - Create Dayaka Family (FR-23, FR-31, FR-37, FR-14)
export async function createFamily(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const {
      templeName,
      templeCode,
      firstName,
      lastName,
      nic,
      email,
      phone,
      address,
      village,
      district,
      postalCode,
      ward,
      password,
      clericalNotes,
      members = [],
      enrollmentType = "manual",
      enrollmentMode = "Admin-Assisted Clergy Registration",
      adminName = "Nimal Perera",
      adminRole = "Co-Administrator",
    } = req.body;

    if (!firstName || !lastName || !phone || !address || !village || !district) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, phone, address, village, and district are mandatory.",
      });
    }

    const cleanNic = (nic || "").trim().toUpperCase();
    const cleanPhone = (phone || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const headFullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // 🚨 1. INTER-TEMPLE STRICT DUPLICATE NIC BARRIER (FR-37)
    if (cleanNic) {
      const nicClash = await client.query(
        `SELECT f."id", f."familyCode", f."name", t."name" as "templeName"
         FROM families f
         LEFT JOIN temples t ON f."templeId" = t."id"
         WHERE UPPER(f."nic") = $1
         LIMIT 1`,
        [cleanNic]
      );

      if (nicClash.rows.length > 0) {
        const dup = nicClash.rows[0];
        return res.status(409).json({
          success: false,
          duplicate: true,
          matchType: "NIC",
          message: `National ID (${cleanNic}) is already registered under "${dup.name}" at "${dup.templeName}". Duplicate accounts across temples are prohibited by FR-37. Please use Temple Transfer instead.`,
        });
      }
    }

    // Resolve Temple
    const templeId = await getOrCreateTemple(
      templeCode || "TPL-2026-0482",
      templeName || "Sri Sambodhi Maha Viharaya",
      { address, village, district, postalCode }
    );

    // Generate Unique Family Code & QR Pass
    const familyCode = `FAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const familyId = `fam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const familyQrPass = `PASS-${familyCode}-${Date.now().toString().slice(-4)}`;

    // Optional password hashing
    let passwordHash: string | null = null;
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Ward resolution
    const determinedWard = ward || (village.toLowerCase().includes("north") ? "north-ward" : "temple-road");

    await client.query("BEGIN");

    // Insert family
    const insertFamilyQuery = `
      INSERT INTO families (
        "id", "familyCode", "templeId", "firstName", "lastName", "name", "alias",
        "nic", "email", "phone", "address", "village", "district", "postalCode", "ward",
        "passwordHash", "status", "enrollmentMode", "enrollmentType", "familyQrPass",
        "clericalNotes", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15,
        $16, 'Active', $17, $18, $19,
        $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const familyResult = await client.query(insertFamilyQuery, [
      familyId,
      familyCode,
      templeId,
      firstName.trim(),
      lastName.trim(),
      headFullName,
      `Household of ${headFullName}`,
      cleanNic || `NIC-${Date.now()}`,
      cleanEmail || null,
      cleanPhone,
      address.trim(),
      village.trim(),
      district.trim(),
      postalCode ? postalCode.trim() : null,
      determinedWard,
      passwordHash,
      enrollmentMode,
      enrollmentType,
      familyQrPass,
      clericalNotes || null,
    ]);

    const createdFamily = familyResult.rows[0];
    delete createdFamily.passwordHash;

    // Insert family members
    const memberRecords: any[] = [];
    if (Array.isArray(members) && members.length > 0) {
      for (const m of members) {
        if (!m.fullName && !m.name) continue;
        const mId = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const mName = (m.fullName || m.name || "").trim();
        const mRole = m.relationship || m.role || "Dependent";
        const mAge = Number(m.age) || null;
        const mGender = m.gender || "Male";

        await client.query(
          `INSERT INTO family_members ("id", "familyId", "fullName", "relationship", "age", "gender", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [mId, familyId, mName, mRole, mAge, mGender]
        );

        memberRecords.push({ id: mId, name: mName, role: mRole, age: mAge, gender: mGender });
      }
    } else {
      // Default head member
      const mId = `mem-${Date.now()}`;
      await client.query(
        `INSERT INTO family_members ("id", "familyId", "fullName", "relationship", "age", "gender", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [mId, familyId, headFullName, "Head of Household", 45, "Male"]
      );
      memberRecords.push({ id: mId, name: headFullName, role: "Head of Household", age: 45, gender: "Male" });
    }

    await client.query("COMMIT");

    createdFamily.members = memberRecords;

    // Log Audit Trail (FR-14)
    await logAuditTrail({
      templeId,
      adminName,
      adminRole,
      targetType: "Family",
      targetName: headFullName,
      targetId: familyCode,
      action: "Created",
      reason: `New Dayaka family enrollment (${village}) - ${memberRecords.length} dependents`,
      statusBadge: "active",
    });

    res.status(201).json({
      success: true,
      message: `Family "${headFullName}" (${familyCode}) registered successfully!`,
      data: createdFamily,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error creating family:", error);
    if (error.code === "23505" && error.constraint?.includes("nic")) {
      return res.status(409).json({
        success: false,
        message: "This National ID (NIC) is already registered in the system.",
      });
    }
    res.status(500).json({ success: false, message: "Internal server error registering family" });
  } finally {
    client.release();
  }
}

// PUT /api/families/:id - Edit Family (FR-23, FR-31, FR-14)
export async function updateFamily(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      village,
      district,
      postalCode,
      ward,
      status,
      danaTurnNotes,
      clericalNotes,
      members,
      adminName = "Nimal Perera",
      adminRole = "Co-Administrator",
    } = req.body;

    const existingRes = await client.query(
      `SELECT * FROM families WHERE "id" = $1 OR "familyCode" = $1 LIMIT 1`,
      [id]
    );

    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }

    const current = existingRes.rows[0];
    const familyDbId = current.id;
    const fullName = `${(firstName || current.firstName).trim()} ${(lastName || current.lastName).trim()}`.trim();

    await client.query("BEGIN");

    await client.query(
      `UPDATE families SET
        "firstName" = COALESCE($1, "firstName"),
        "lastName" = COALESCE($2, "lastName"),
        "name" = $3,
        "phone" = COALESCE($4, "phone"),
        "email" = COALESCE($5, "email"),
        "address" = COALESCE($6, "address"),
        "village" = COALESCE($7, "village"),
        "district" = COALESCE($8, "district"),
        "postalCode" = COALESCE($9, "postalCode"),
        "ward" = COALESCE($10, "ward"),
        "status" = COALESCE($11, "status"),
        "danaTurnNotes" = COALESCE($12, "danaTurnNotes"),
        "clericalNotes" = COALESCE($13, "clericalNotes"),
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $14`,
      [
        firstName ? firstName.trim() : null,
        lastName ? lastName.trim() : null,
        fullName,
        phone ? phone.trim() : null,
        email ? email.trim().toLowerCase() : null,
        address ? address.trim() : null,
        village ? village.trim() : null,
        district ? district.trim() : null,
        postalCode ? postalCode.trim() : null,
        ward || null,
        status || null,
        danaTurnNotes || null,
        clericalNotes || null,
        familyDbId,
      ]
    );

    // If members array provided, update them
    if (Array.isArray(members)) {
      await client.query(`DELETE FROM family_members WHERE "familyId" = $1`, [familyDbId]);
      for (const m of members) {
        if (!m.fullName && !m.name) continue;
        const mId = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await client.query(
          `INSERT INTO family_members ("id", "familyId", "fullName", "relationship", "age", "gender", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [mId, familyDbId, (m.fullName || m.name).trim(), m.relationship || m.role || "Dependent", Number(m.age) || null, m.gender || "Male"]
        );
      }
    }

    await client.query("COMMIT");

    // Audit log
    await logAuditTrail({
      templeId: current.templeId,
      adminName,
      adminRole,
      targetType: "Family",
      targetName: fullName,
      targetId: current.familyCode,
      action: "Updated",
      reason: `Household profile & parish records updated`,
      statusBadge: status || current.status,
    });

    res.json({
      success: true,
      message: `Family "${fullName}" updated successfully!`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating family:", error);
    res.status(500).json({ success: false, message: "Internal server error updating family" });
  } finally {
    client.release();
  }
}

// PATCH /api/families/:id/status - Deactivate / Reactivate Family (FR-16, FR-14)
export async function updateFamilyStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, deactivateReason, deactivateNotes, adminName = "Nimal Perera", adminRole = "Co-Administrator" } = req.body;

    if (!["Active", "Deactivated", "Transferred"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Active, Deactivated, or Transferred." });
    }

    const checkRes = await pool.query(
      `SELECT * FROM families WHERE "id" = $1 OR "familyCode" = $1 LIMIT 1`,
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }

    const family = checkRes.rows[0];
    const isDeactivating = status === "Deactivated";
    if (isDeactivating) {
      if (!deactivateReason || typeof deactivateReason !== "string" || !deactivateReason.trim()) {
        return res.status(400).json({ success: false, message: "Deactivation reason is required." });
      }
      if (!deactivateNotes || typeof deactivateNotes !== "string" || deactivateNotes.trim().length < 5) {
        return res.status(400).json({ success: false, message: "Deactivation notes / clergy reference is required (minimum 5 characters)." });
      }
    }

    await pool.query(
      `UPDATE families SET
        "status" = $1,
        "deactivateReason" = $2,
        "deactivateNotes" = $3,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $4`,
      [status, isDeactivating ? deactivateReason.trim() : null, isDeactivating ? deactivateNotes.trim() : null, family.id]
    );

    // Audit log
    await logAuditTrail({
      templeId: family.templeId,
      adminName,
      adminRole,
      targetType: "Family",
      targetName: family.name,
      targetId: family.familyCode,
      action: isDeactivating ? "Deactivated" : "Reactivated",
      reason: isDeactivating ? deactivateReason : "Re-enrolled into parish records",
      statusBadge: status.toLowerCase(),
    });

    res.json({
      success: true,
      message: `Family "${family.name}" status changed to ${status}.`,
    });
  } catch (error) {
    console.error("Error updating family status:", error);
    res.status(500).json({ success: false, message: "Internal server error updating status" });
  }
}

// POST /api/families/:id/transfer - Inter-Temple Family Transfer (FR-35, FR-36, FR-16)
export async function transferFamily(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      destinationDistrict,
      destinationTemple,
      destinationTempleCode,
      transferReason = "Permanent Residence Relocation",
      effectiveDate = new Date().toISOString(),
      authorizedBy = "Ven. Dhammarakkhitha Nayaka Thero",
      clergyRemarks = "",
      issueCertificate = true,
      transferDanaHistory = true,
      notifyReceivingTemple = true,
      adminName = "Nimal Perera",
      adminRole = "Co-Administrator",
    } = req.body;

    const checkRes = await pool.query(
      `SELECT * FROM families WHERE "id" = $1 OR "familyCode" = $1 LIMIT 1`,
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }

    const family = checkRes.rows[0];
    const transferId = `trf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const certificateNumber = `TRF-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert Transfer Record
    await pool.query(
      `INSERT INTO family_transfers (
        "id", "familyId", "sourceTempleId", "destinationTemple", "destinationTempleCode",
        "destinationDistrict", "transferReason", "effectiveDate", "authorizedBy", "clergyRemarks",
        "issueCertificate", "transferDanaHistory", "notifyReceivingTemple", "certificateNumber", "status",
        "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        transferId,
        family.id,
        family.templeId,
        destinationTemple,
        destinationTempleCode || null,
        destinationDistrict,
        transferReason,
        effectiveDate,
        authorizedBy,
        clergyRemarks,
        issueCertificate,
        transferDanaHistory,
        notifyReceivingTemple,
        certificateNumber,
      ]
    );

    // CRITICAL FR-16 & FR-36: Relocation MUST NOT auto-deactivate the family account!
    // We update certificateNumber and clerical notes, status updated to 'Transferred'
    await pool.query(
      `UPDATE families SET
        "status" = 'Transferred',
        "certificateNumber" = $1,
        "clericalNotes" = CONCAT(COALESCE("clericalNotes", ''), ' [Transferred to ', $2::text, ' on ', CURRENT_DATE::text, ']'),
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $3`,
      [certificateNumber, destinationTemple, family.id]
    );

    // Audit log (FR-14)
    await logAuditTrail({
      templeId: family.templeId,
      adminName,
      adminRole,
      targetType: "Transfer",
      targetName: family.name,
      targetId: family.familyCode,
      action: "Transferred",
      reason: `Parish clearance issued to ${destinationTemple} (${destinationDistrict}) - Cert #${certificateNumber}`,
      statusBadge: "transferred",
    });

    res.json({
      success: true,
      message: `Transfer certificate #${certificateNumber} issued. Family transferred successfully!`,
      certificateNumber,
      transferId,
    });
  } catch (error) {
    console.error("Error processing family transfer:", error);
    res.status(500).json({ success: false, message: "Internal server error transferring family" });
  }
}

// DELETE /api/families/:id - Delete Family (FR-14)
export async function deleteFamily(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { adminName = "Nimal Perera", adminRole = "Co-Administrator" } = req.body || {};

    const checkRes = await pool.query(
      `SELECT * FROM families WHERE "id" = $1 OR "familyCode" = $1 LIMIT 1`,
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }

    const family = checkRes.rows[0];

    // Cascade delete handles members and transfers
    await pool.query(`DELETE FROM families WHERE "id" = $1`, [family.id]);

    // Audit log
    await logAuditTrail({
      templeId: family.templeId,
      adminName,
      adminRole,
      targetType: "Family",
      targetName: family.name,
      targetId: family.familyCode,
      action: "Deleted",
      reason: "Family removed from active temple parish registry",
      statusBadge: "deactivated",
    });

    res.json({
      success: true,
      message: `Family "${family.name}" (${family.familyCode}) has been deleted.`,
    });
  } catch (error) {
    console.error("Error deleting family:", error);
    res.status(500).json({ success: false, message: "Internal server error deleting family" });
  }
}

// GET /api/families/temple-qr/:code - Get Temple Onboarding QR data (FR-33, FR-34)
export async function getTempleQr(req: Request, res: Response) {
  try {
    const { code } = req.params;
    const templeRes = await pool.query(
      `SELECT "id", "code", "name", "address", "village", "district", "qrCodeUrl" FROM temples WHERE LOWER("code") = LOWER($1) LIMIT 1`,
      [code]
    );

    if (templeRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Temple code not found" });
    }

    const temple = templeRes.rows[0];
    const directUrl = temple.qrCodeUrl || `temple.lk/join/${temple.code}`;

    res.json({
      success: true,
      templeCode: temple.code,
      templeName: temple.name,
      qrUrl: directUrl,
      flyerTitle: `${temple.name} - Official Devotee Registration Pass`,
    });
  } catch (error) {
    console.error("Error getting temple QR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

