-- AlterTable
ALTER TABLE "CommunicationPostRecipient" ADD COLUMN     "teamIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
