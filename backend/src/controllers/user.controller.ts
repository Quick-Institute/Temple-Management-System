import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../config/database.js";
import { logAuditTrail } from "../services/audit.service.js";
import { getOrCreateTemple } from "../services/temple.service.js";

// GET /api/users - List users with search & filters (FR-08, FR-09)
export async function getUsers(req: Request, res: Response) {
  try {
    const { q, committee, status, templeCode } = req.query;

    let queryText = `
      SELECT 
        u."id",
        u."templeId",
        t."name" as "templeName",
        t."code" as "templeCode",
        u."firstName",
        u."lastName",
        u."name",
        u."alias",
        u."email",
        u."phone",
        u."nic",
        u."committeeName",
        u."customCommitteeName",
        u."designation",
        u."customDesignation",
        u."role",
        u."status",
        u."isPermanent",
        u."avatar",
        u."avatarBg",
        u."avatarColor",
        u."permFamily",
        u."permDana",
        u."permNotices",
        u."permFinance",
        u."deactivateReason",
        u."deactivateNotes",
        u."deactivateNotifyEmail",
        u."deactivatedAt",
        u."createdAt",
        u."updatedAt"
      FROM users u
      LEFT JOIN temples t ON u."templeId" = t."id"
      WHERE 1=1
    `;

    const queryParams: unknown[] = [];

    // Filter by Temple Code (FR-09 multi-tenancy)
    if (templeCode && typeof templeCode === "string" && templeCode.trim() !== "") {
      queryParams.push(templeCode.trim());
      queryText += ` AND (t."code" = $${queryParams.length} OR t."code" IS NULL)`;
    }

    // Filter by Committee
    if (committee && typeof committee === "string" && committee !== "all") {
      queryParams.push(committee);
      queryText += ` AND u."committeeName" = $${queryParams.length}`;
    }

    // Filter by Status
    if (status && typeof status === "string" && status !== "all") {
      if (status === "active") {
        queryText += ` AND (u."status" = 'active' OR u."status" = 'permanent')`;
      } else if (status === "deactivated") {
        queryText += ` AND u."status" = 'deactivated'`;
      }
    }

    // Search query (name, email, phone, designation, committee)
    if (q && typeof q === "string" && q.trim() !== "") {
      const searchTerm = `%${q.trim().toLowerCase()}%`;
      queryParams.push(searchTerm);
      const idx = queryParams.length;
      queryText += ` AND (
        LOWER(u."name") LIKE $${idx} OR
        LOWER(u."email") LIKE $${idx} OR
        LOWER(COALESCE(u."phone", '')) LIKE $${idx} OR
        LOWER(COALESCE(u."nic", '')) LIKE $${idx} OR
        LOWER(u."designation") LIKE $${idx} OR
        LOWER(u."committeeName") LIKE $${idx}
      )`;
    }

    queryText += ` ORDER BY u."id" ASC`;

    const result = await pool.query(queryText, queryParams);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error fetching users" });
  }
}

// GET /api/users/:id - Get single user
export async function getUserById(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const result = await pool.query(
      `SELECT 
        u.*,
        t."name" as "templeName",
        t."code" as "templeCode"
      FROM users u
      LEFT JOIN temples t ON u."templeId" = t."id"
      WHERE u."id" = $1 LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];
    delete user.passwordHash;

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// POST /api/users - Create User (FR-01, FR-08, FR-14)
export async function createUser(req: Request, res: Response) {
  try {
    const {
      templeName,
      templeCode,
      firstName,
      lastName,
      email,
      phoneNumber,
      phone,
      nic,
      nic_id,
      password,
      committeeName,
      customCommitteeName,
      designation,
      customDesignation,
      role = "official",
      permFamily = true,
      permDana = true,
      permNotices = true,
      permFinance = false,
      adminName = "Nimal Perera",
      adminRole = "Co-Administrator",
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phoneNumber || phone || "").trim();
    const cleanNic = (nic || nic_id || "").trim();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Check duplicate email
    const existingEmail = await pool.query(
      `SELECT "id" FROM users WHERE LOWER("email") = $1 LIMIT 1`,
      [cleanEmail]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `An official with email "${cleanEmail}" already exists in the system.`,
      });
    }

    // Check duplicate NIC if provided
    if (cleanNic) {
      const existingNic = await pool.query(
        `SELECT "id", "name" FROM users WHERE LOWER("nic") = LOWER($1) LIMIT 1`,
        [cleanNic]
      );
      if (existingNic.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: `National ID (${cleanNic}) is already registered under official "${existingNic.rows[0].name}".`,
        });
      }
    }

    // Resolve Temple ID
    const templeId = await getOrCreateTemple(
      templeCode || "TPL-2026-0482",
      templeName || "Sri Sambodhi Maha Viharaya"
    );

    // Hash Password (FR-01)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Initials Avatar
    const avatar = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
    const avatarBg = "bg-emerald-100";
    const avatarColor = "text-emerald-800";

    const insertResult = await pool.query(
      `INSERT INTO users (
        "templeId", "firstName", "lastName", "name", "alias", "email", "phone", "nic",
        "passwordHash", "committeeName", "customCommitteeName", "designation", "customDesignation",
        "role", "status", "isPermanent", "avatar", "avatarBg", "avatarColor",
        "permFamily", "permDana", "permNotices", "permFinance", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, 'active', false, $15, $16, $17,
        $18, $19, $20, $21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *`,
      [
        templeId,
        firstName.trim(),
        lastName.trim(),
        fullName,
        "",
        cleanEmail,
        cleanPhone,
        cleanNic,
        passwordHash,
        committeeName || "Dayaka Sabhawa",
        customCommitteeName || null,
        designation || "Committee Member",
        customDesignation || null,
        role,
        avatar,
        avatarBg,
        avatarColor,
        permFamily,
        permDana,
        permNotices,
        permFinance,
      ]
    );

    const newUser = insertResult.rows[0];
    delete newUser.passwordHash;

    // Log Audit Trail (FR-14)
    await logAuditTrail({
      templeId,
      adminName,
      adminRole,
      targetType: "User",
      targetName: fullName,
      targetId: `USR-${newUser.id}`,
      action: "Created",
      reason: `Assigned as ${newUser.designation} (${newUser.committeeName})`,
      statusBadge: "active",
    });

    res.status(201).json({
      success: true,
      message: `Official "${fullName}" created successfully!`,
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Internal server error creating user" });
  }
}

// PUT /api/users/:id - Edit User & Position/Permissions (FR-08, FR-14)
export async function updateUser(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      nic,
      committeeName,
      customCommitteeName,
      designation,
      customDesignation,
      role,
      permFamily,
      permDana,
      permNotices,
      permFinance,
      newPassword,
      adminName = "Nimal Perera",
      adminRole = "Co-Administrator",
    } = req.body;

    const existingRes = await pool.query(`SELECT * FROM users WHERE "id" = $1 LIMIT 1`, [userId]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const current = existingRes.rows[0];

    const fullName = `${(firstName || current.firstName).trim()} ${(lastName || current.lastName).trim()}`.trim();

    // Check email clash
    if (email && email.trim().toLowerCase() !== current.email.toLowerCase()) {
      const emailClash = await pool.query(
        `SELECT "id" FROM users WHERE LOWER("email") = $1 AND "id" != $2 LIMIT 1`,
        [email.trim().toLowerCase(), userId]
      );
      if (emailClash.rows.length > 0) {
        return res.status(409).json({ success: false, message: "Email is already taken by another user." });
      }
    }

    // Optional password update
    let passwordHash = current.passwordHash;
    if (newPassword && newPassword.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(newPassword.trim(), salt);
    }

    const updatedRes = await pool.query(
      `UPDATE users SET
        "firstName" = COALESCE($1, "firstName"),
        "lastName" = COALESCE($2, "lastName"),
        "name" = $3,
        "email" = COALESCE($4, "email"),
        "phone" = COALESCE($5, "phone"),
        "nic" = COALESCE($6, "nic"),
        "committeeName" = COALESCE($7, "committeeName"),
        "customCommitteeName" = COALESCE($8, "customCommitteeName"),
        "designation" = COALESCE($9, "designation"),
        "customDesignation" = COALESCE($10, "customDesignation"),
        "role" = COALESCE($11, "role"),
        "permFamily" = COALESCE($12, "permFamily"),
        "permDana" = COALESCE($13, "permDana"),
        "permNotices" = COALESCE($14, "permNotices"),
        "permFinance" = COALESCE($15, "permFinance"),
        "passwordHash" = $16,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $17
      RETURNING *`,
      [
        firstName ? firstName.trim() : null,
        lastName ? lastName.trim() : null,
        fullName,
        email ? email.trim().toLowerCase() : null,
        phone ? phone.trim() : null,
        nic ? nic.trim() : null,
        committeeName || null,
        customCommitteeName || null,
        designation || null,
        customDesignation || null,
        role || null,
        permFamily !== undefined ? permFamily : null,
        permDana !== undefined ? permDana : null,
        permNotices !== undefined ? permNotices : null,
        permFinance !== undefined ? permFinance : null,
        passwordHash,
        userId,
      ]
    );

    const updatedUser = updatedRes.rows[0];
    delete updatedUser.passwordHash;

    // Log Audit Trail (FR-14)
    await logAuditTrail({
      templeId: updatedUser.templeId,
      adminName,
      adminRole,
      targetType: "User",
      targetName: fullName,
      targetId: `USR-${userId}`,
      action: "Updated",
      reason: `Updated official profile & permissions (${updatedUser.designation})`,
      statusBadge: updatedUser.status,
    });

    res.json({
      success: true,
      message: `Official "${fullName}" updated successfully!`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Internal server error updating user" });
  }
}

// PATCH /api/users/:id/status - Deactivate / Reactivate User with Reason (FR-16, FR-14)
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const { status, deactivateReason, deactivateNotes, adminName = "Nimal Perera", adminRole = "Co-Administrator" } = req.body;

    if (!["active", "deactivated"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'active' or 'deactivated'." });
    }

    const checkRes = await pool.query(`SELECT * FROM users WHERE "id" = $1 LIMIT 1`, [userId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const current = checkRes.rows[0];

    // Cannot deactivate permanent monastic head
    if (current.isPermanent) {
      return res.status(403).json({
        success: false,
        message: "Permanent Monastic Head records cannot be deactivated.",
      });
    }

    const isDeactivating = status === "deactivated";
    if (isDeactivating) {
      if (!deactivateReason || typeof deactivateReason !== "string" || !deactivateReason.trim()) {
        return res.status(400).json({ success: false, message: "Deactivation reason is required." });
      }
      if (!deactivateNotes || typeof deactivateNotes !== "string" || deactivateNotes.trim().length < 5) {
        return res.status(400).json({ success: false, message: "Deactivation notes / clergy reference is required (minimum 5 characters)." });
      }
    }
    const deactivatedAt = isDeactivating ? new Date() : null;

    const updateRes = await pool.query(
      `UPDATE users SET
        "status" = $1,
        "deactivateReason" = $2,
        "deactivateNotes" = $3,
        "deactivatedAt" = $4,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $5
      RETURNING *`,
      [status, isDeactivating ? deactivateReason.trim() : null, isDeactivating ? deactivateNotes.trim() : null, deactivatedAt, userId]
    );

    const user = updateRes.rows[0];
    delete user.passwordHash;

    // Log Audit (FR-14)
    await logAuditTrail({
      templeId: user.templeId,
      adminName,
      adminRole,
      targetType: "User",
      targetName: user.name,
      targetId: `USR-${userId}`,
      action: isDeactivating ? "Deactivated" : "Reactivated",
      reason: isDeactivating ? deactivateReason : "Official privileges reactivated by temple admin",
      statusBadge: status,
    });

    res.json({
      success: true,
      message: `User "${user.name}" has been ${isDeactivating ? "deactivated" : "reactivated"} successfully.`,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: "Internal server error updating user status" });
  }
}

// DELETE /api/users/:id - Delete User (FR-08, FR-14)
export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const { adminName = "Nimal Perera", adminRole = "Co-Administrator" } = req.body || {};

    const checkRes = await pool.query(`SELECT * FROM users WHERE "id" = $1 LIMIT 1`, [userId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const user = checkRes.rows[0];

    if (user.isPermanent) {
      return res.status(403).json({ success: false, message: "Permanent Monastic Head records cannot be deleted." });
    }

    await pool.query(`DELETE FROM users WHERE "id" = $1`, [userId]);

    // Audit log
    await logAuditTrail({
      templeId: user.templeId,
      adminName,
      adminRole,
      targetType: "User",
      targetName: user.name,
      targetId: `USR-${userId}`,
      action: "Deleted",
      reason: "Account removed from official clergy ledger",
      statusBadge: "deactivated",
    });

    res.json({
      success: true,
      message: `User "${user.name}" (USR-${userId}) was deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal server error deleting user" });
  }
}

