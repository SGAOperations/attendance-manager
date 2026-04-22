-- Convert any remaining NONE role types to MEMBER
UPDATE "User" SET "roleType" = 'MEMBER' WHERE "roleType"::text = 'NONE';
UPDATE "Role" SET "roleType" = 'MEMBER' WHERE "roleType"::text = 'NONE';

-- Recreate the RoleType enum without NONE
-- Drop column defaults that reference the enum first
ALTER TABLE "User" ALTER COLUMN "roleType" DROP DEFAULT;

-- Create new enum without NONE
CREATE TYPE "RoleType_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SENATOR', 'EBOARD', 'MEMBER');

-- Migrate columns to new enum type
ALTER TABLE "User" ALTER COLUMN "roleType" TYPE "RoleType_new" USING "roleType"::text::"RoleType_new";
ALTER TABLE "Role" ALTER COLUMN "roleType" TYPE "RoleType_new" USING "roleType"::text::"RoleType_new";

-- Drop old type and rename
DROP TYPE "RoleType";
ALTER TYPE "RoleType_new" RENAME TO "RoleType";

-- Restore default
ALTER TABLE "User" ALTER COLUMN "roleType" SET DEFAULT 'MEMBER';
