-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_domain_key" ON "University"("domain");

-- Seed the universities that were previously hardcoded in the application.
INSERT INTO "University" ("id", "domain", "name", "city", "active", "updatedAt") VALUES
    ('uni_eafit',      'eafit.edu.co',      'EAFIT',      'Medellín', true, CURRENT_TIMESTAMP),
    ('uni_upb',        'upb.edu.co',        'UPB',        'Medellín', true, CURRENT_TIMESTAMP),
    ('uni_ces',        'ces.edu.co',        'CES',        'Medellín', true, CURRENT_TIMESTAMP),
    ('uni_eia',        'eia.edu.co',        'EIA',        'Medellín', true, CURRENT_TIMESTAMP),
    ('uni_javeriana',  'javeriana.edu.co',  'Javeriana',  'Bogotá',   true, CURRENT_TIMESTAMP),
    ('uni_uniandes',   'uniandes.edu.co',   'Uniandes',   'Bogotá',   true, CURRENT_TIMESTAMP),
    ('uni_urosario',   'urosario.edu.co',   'Rosario',    'Bogotá',   true, CURRENT_TIMESTAMP),
    ('uni_externado',  'externado.edu.co',  'Externado',  'Bogotá',   true, CURRENT_TIMESTAMP);
