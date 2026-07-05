-- Migrate from NextAuth (Auth.js) to Better Auth.
-- Existing users and their Google account links are preserved.
-- Active sessions are dropped; users will need to sign in again.

-- User: name becomes required, emailVerified becomes a boolean
UPDATE "User" SET "name" = split_part("email", '@', 1) WHERE "name" IS NULL;
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "User"
  ALTER COLUMN "emailVerified" TYPE BOOLEAN USING ("emailVerified" IS NOT NULL),
  ALTER COLUMN "emailVerified" SET DEFAULT false,
  ALTER COLUMN "emailVerified" SET NOT NULL;

-- Account: rebuild in Better Auth's shape, carrying over existing rows
ALTER TABLE "Account" RENAME TO "Account_nextauth";
ALTER TABLE "Account_nextauth" RENAME CONSTRAINT "Account_pkey" TO "Account_nextauth_pkey";
ALTER TABLE "Account_nextauth" RENAME CONSTRAINT "Account_userId_fkey" TO "Account_nextauth_userId_fkey";

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Account" (
    "id",
    "accountId",
    "providerId",
    "userId",
    "accessToken",
    "refreshToken",
    "idToken",
    "accessTokenExpiresAt",
    "scope",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    "providerAccountId",
    "provider",
    "userId",
    "access_token",
    "refresh_token",
    "id_token",
    to_timestamp("expires_at"),
    "scope",
    "createdAt",
    "updatedAt"
FROM "Account_nextauth";

DROP TABLE "Account_nextauth";

CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Session: rebuild in Better Auth's shape (existing sessions are discarded)
DROP TABLE "Session";

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- VerificationToken is replaced by Better Auth's Verification table
DROP TABLE "VerificationToken";

CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);
