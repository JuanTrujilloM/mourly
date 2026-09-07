-- AlterTable
ALTER TABLE "Preferences" ADD COLUMN     "genderInterests" TEXT[];

-- Data: 'Todos' becomes every bucket, any other value becomes its own bucket
UPDATE "Preferences"
SET "genderInterests" = CASE
  WHEN "genderInterest" = 'Todos' THEN ARRAY['Hombres', 'Mujeres', 'No binario']
  ELSE ARRAY["genderInterest"]
END;

-- AlterTable
ALTER TABLE "Preferences" DROP COLUMN "genderInterest",
DROP COLUMN "orientation";
