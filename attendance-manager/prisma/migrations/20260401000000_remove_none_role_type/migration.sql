-- Convert any NONE role types to MEMBER
UPDATE "User" SET "roleType" = 'MEMBER' WHERE "roleType"::text = 'NONE';
UPDATE "Role" SET "roleType" = 'MEMBER' WHERE "roleType"::text = 'NONE';
