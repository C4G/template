-- Add the fields required by Better Auth's admin plugin.
ALTER TABLE "User"
  ADD COLUMN "banned" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "banReason" TEXT,
  ADD COLUMN "banExpires" TIMESTAMP(3);

ALTER TABLE "Session"
  ADD COLUMN "impersonatedBy" TEXT;
