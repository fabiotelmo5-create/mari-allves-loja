-- Marca products que participam da Black Friday (seção temporária).
ALTER TABLE "Product" ADD COLUMN "blackFriday" BOOLEAN NOT NULL DEFAULT false;
