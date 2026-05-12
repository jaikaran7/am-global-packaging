-- Optional payment due date on order (drives invoice due date when set; no auto +30 days default)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_due_date date;

COMMENT ON COLUMN orders.payment_due_date IS 'Optional invoice/payment due date; shown on invoice only when set.';

ALTER TABLE invoices ALTER COLUMN due_date DROP NOT NULL;
