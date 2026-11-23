-- ==============================================================================
-- TEMPLE MANAGEMENT SYSTEM - POSTGRESQL DATABASE SCHEMA
-- ==============================================================================
-- INSTRUCTIONS TO INITIALIZE THIS DATABASE:
--
-- METHOD 1: Using pgAdmin 4 (GUI - Recommended)
--   1. Open pgAdmin 4 and connect to your local PostgreSQL server.
--   2. Right-click on your database ('temple_db') -> Select 'Query Tool'.
--   3. Copy and paste the entire contents of this file into the Query Editor.
--   4. Press F5 (or click the Execute ▶ icon) to create all tables and constraints.
--
-- METHOD 2: Using PostgreSQL Command Line (psql)
--   Open terminal/command prompt and run:
--     psql -U postgres -d temple_db -f "backend/db/schema.sql"
-- ==============================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "temples" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "village" TEXT,
    "district" TEXT,
    "postalCode" TEXT,
    "qrCodeUrl" TEXT,
    "qrCodeData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "templeId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "nic" TEXT,
    "passwordHash" TEXT NOT NULL,
    "committeeName" TEXT NOT NULL DEFAULT 'Dayaka Sabhawa',
    "customCommitteeName" TEXT,
    "designation" TEXT NOT NULL DEFAULT 'Committee Member',
    "customDesignation" TEXT,
    "role" TEXT NOT NULL DEFAULT 'official',
    "status" TEXT NOT NULL DEFAULT 'active',
    "isPermanent" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT DEFAULT 'U',
    "avatarBg" TEXT DEFAULT 'bg-emerald-100',
    "avatarColor" TEXT DEFAULT 'text-emerald-800',
    "deactivateReason" TEXT,
    "deactivateNotes" TEXT,
    "deactivateNotifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "permFamily" BOOLEAN NOT NULL DEFAULT true,
    "permDana" BOOLEAN NOT NULL DEFAULT true,
    "permNotices" BOOLEAN NOT NULL DEFAULT true,
    "permFinance" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" TEXT NOT NULL,
    "familyCode" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "nic" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "postalCode" TEXT,
    "ward" TEXT NOT NULL DEFAULT 'temple-road',
    "passwordHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "enrollmentMode" TEXT NOT NULL DEFAULT 'Admin-Assisted Clergy Registration',
    "enrollmentType" TEXT NOT NULL DEFAULT 'manual',
    "certificateNumber" TEXT,
    "familyQrPass" TEXT,
    "deactivateReason" TEXT,
    "deactivateNotes" TEXT,
    "danaTurnNotes" TEXT,
    "clericalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL DEFAULT 'Dependent',
    "age" INTEGER,
    "gender" TEXT DEFAULT 'Male',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_transfers" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "sourceTempleId" TEXT NOT NULL,
    "destinationTempleId" TEXT,
    "destinationTemple" TEXT NOT NULL,
    "destinationTempleCode" TEXT,
    "destinationDistrict" TEXT NOT NULL,
    "transferReason" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorizedBy" TEXT NOT NULL,
    "clergyRemarks" TEXT,
    "issueCertificate" BOOLEAN NOT NULL DEFAULT true,
    "transferDanaHistory" BOOLEAN NOT NULL DEFAULT true,
    "notifyReceivingTemple" BOOLEAN NOT NULL DEFAULT true,
    "certificateNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "auditCode" TEXT NOT NULL,
    "templeId" TEXT,
    "adminName" TEXT NOT NULL,
    "adminRole" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "statusBadge" TEXT NOT NULL DEFAULT 'active',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temples_code_key" ON "temples"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nic_key" ON "users"("nic");

-- CreateIndex
CREATE INDEX "users_templeId_idx" ON "users"("templeId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "families_familyCode_key" ON "families"("familyCode");

-- CreateIndex
CREATE UNIQUE INDEX "families_nic_key" ON "families"("nic");

-- CreateIndex
CREATE INDEX "families_templeId_idx" ON "families"("templeId");

-- CreateIndex
CREATE INDEX "families_phone_idx" ON "families"("phone");

-- CreateIndex
CREATE INDEX "families_ward_idx" ON "families"("ward");

-- CreateIndex
CREATE INDEX "families_status_idx" ON "families"("status");

-- CreateIndex
CREATE INDEX "family_members_familyId_idx" ON "family_members"("familyId");

-- CreateIndex
CREATE INDEX "family_transfers_familyId_idx" ON "family_transfers"("familyId");

-- CreateIndex
CREATE INDEX "family_transfers_sourceTempleId_idx" ON "family_transfers"("sourceTempleId");

-- CreateIndex
CREATE INDEX "family_transfers_destinationTempleId_idx" ON "family_transfers"("destinationTempleId");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_auditCode_key" ON "audit_logs"("auditCode");

-- CreateIndex
CREATE INDEX "audit_logs_templeId_idx" ON "audit_logs"("templeId");

-- CreateIndex
CREATE INDEX "audit_logs_targetType_idx" ON "audit_logs"("targetType");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "temples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "temples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_transfers" ADD CONSTRAINT "family_transfers_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_transfers" ADD CONSTRAINT "family_transfers_sourceTempleId_fkey" FOREIGN KEY ("sourceTempleId") REFERENCES "temples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_transfers" ADD CONSTRAINT "family_transfers_destinationTempleId_fkey" FOREIGN KEY ("destinationTempleId") REFERENCES "temples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "temples"("id") ON DELETE SET NULL ON UPDATE CASCADE;
