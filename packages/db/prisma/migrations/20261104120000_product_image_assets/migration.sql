-- Imagens enviadas pelo painel ficam no banco para funcionar sem
-- configuração extra de bucket/Storage no Supabase.
CREATE TABLE "ImageAsset" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageAsset_pkey" PRIMARY KEY ("id")
);
