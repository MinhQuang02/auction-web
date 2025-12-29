-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reset_token_expires" TIMESTAMP,
ADD COLUMN     "reset_token_hash" VARCHAR;
