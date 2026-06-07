INSERT INTO plans (plan_key, name, price_1_month, price_3_month, price_6_month, price_12_month)
VALUES
  ('strength', 'Strength', 1100, 2500, 4800, 9000),
  ('cardio', 'Strength + Cardio', 1400, 3200, 5700, 11000)
ON CONFLICT (plan_key) DO UPDATE SET
  name = excluded.name,
  price_1_month = excluded.price_1_month,
  price_3_month = excluded.price_3_month,
  price_6_month = excluded.price_6_month,
  price_12_month = excluded.price_12_month,
  updated_at = now();
