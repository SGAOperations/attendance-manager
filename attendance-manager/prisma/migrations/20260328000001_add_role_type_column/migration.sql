-- Add roleType column with default NONE
ALTER TABLE "User" ADD COLUMN "roleType" "RoleType" NOT NULL DEFAULT 'NONE';

-- Add isVotingMember column with default false
ALTER TABLE "User" ADD COLUMN "isVotingMember" BOOLEAN NOT NULL DEFAULT false;

-- Backfill roleType from existing Role table
UPDATE "User" u
SET "roleType" = r."roleType"
FROM "Role" r
WHERE u."roleId" = r."roleId";

-- Backfill isVotingMember: true for MEMBER role users
UPDATE "User"
SET "isVotingMember" = true
WHERE "roleType" = 'MEMBER';
