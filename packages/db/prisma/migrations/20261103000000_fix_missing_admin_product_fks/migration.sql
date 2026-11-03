-- Alinha o banco ao schema Prisma.
--
-- Estas três colunas existem no schema (relações com AdminUser e Product), mas
-- ficaram de fora da migração inicial. Todas são opcionais, então a aplicação
-- não perde dados existentes.

ALTER TABLE "StockMovement" ADD COLUMN "adminUserId" TEXT;
ALTER TABLE "Order" ADD COLUMN "adminUserId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "productId" TEXT;

ALTER TABLE "StockMovement"
  ADD CONSTRAINT "StockMovement_adminUserId_fkey"
  FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_adminUserId_fkey"
  FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
