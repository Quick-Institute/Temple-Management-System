import { Request, Response } from "express";
import pool from "../config/database.js";

// GET /api/audit-logs - List audit trail records (FR-14)
export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { targetType, action, templeId, limit = 50 } = req.query;

    let queryText = `
      SELECT 
        a."id",
        a."auditCode",
        a."templeId",
        t."name" as "templeName",
        a."adminName",
        a."adminRole",
        a."targetType",
        a."targetName",
        a."targetId",
        a."action",
        a."reason",
        a."statusBadge",
        a."timestamp"
      FROM audit_logs a
      LEFT JOIN temples t ON a."templeId" = t."id"
      WHERE 1=1
    `;

    const queryParams: unknown[] = [];

    if (targetType && typeof targetType === "string" && targetType !== "all") {
      queryParams.push(targetType);
      queryText += ` AND a."targetType" = $${queryParams.length}`;
    }

    if (action && typeof action === "string" && action !== "all") {
      queryParams.push(action);
      queryText += ` AND a."action" = $${queryParams.length}`;
    }

    if (templeId && typeof templeId === "string") {
      queryParams.push(templeId);
      queryText += ` AND a."templeId" = $${queryParams.length}`;
    }

    queryText += ` ORDER BY a."timestamp" DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(Number(limit) || 50);

    const result = await pool.query(queryText, queryParams);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ success: false, message: "Internal server error fetching audit logs" });
  }
}

