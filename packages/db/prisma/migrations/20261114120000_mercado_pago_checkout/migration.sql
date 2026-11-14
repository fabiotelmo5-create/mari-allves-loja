-- Checkout Pro (Mercado Pago): preferência, URL de pagamento e idempotência de eventos.
ALTER TABLE "Payment" ADD COLUMN "providerPreferenceId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "checkoutUrl" TEXT;

ALTER TABLE "PaymentEvent" ADD COLUMN "providerEventId" TEXT;

CREATE UNIQUE INDEX "Payment_providerPreferenceId_key" ON "Payment"("providerPreferenceId");
CREATE UNIQUE INDEX "PaymentEvent_providerEventId_key" ON "PaymentEvent"("providerEventId");
