CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE gender_type AS ENUM ('Male', 'Female');
CREATE TYPE payment_mode AS ENUM ('Cash', 'UPI', 'Bank Transfer');
CREATE TYPE payment_status AS ENUM ('Paid', 'Due', 'Pending');
CREATE TYPE membership_status AS ENUM ('Active', 'Expiring Soon', 'Expired', 'Due');
CREATE TYPE reminder_type AS ENUM ('7-day', '3-day', 'expiry-day', 'expired', 'manual');
CREATE TYPE delivery_status AS ENUM ('Sent', 'Failed');

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL UNIQUE,
  name text NOT NULL,
  price_1_month integer NOT NULL CHECK (price_1_month > 0),
  price_3_month integer NOT NULL CHECK (price_3_month > 0),
  price_6_month integer NOT NULL CHECK (price_6_month > 0),
  price_12_month integer NOT NULL CHECK (price_12_month > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_number text NOT NULL UNIQUE,
  registration_date date NOT NULL,
  full_name text NOT NULL,
  age integer NOT NULL CHECK (age BETWEEN 5 AND 100),
  gender gender_type NOT NULL,
  phone_day text NOT NULL CHECK (phone_day ~ '^[0-9]{10}$'),
  phone_evening text CHECK (phone_evening IS NULL OR phone_evening = '' OR phone_evening ~ '^[0-9]{10}$'),
  emergency_contact text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pin text NOT NULL CHECK (pin ~ '^[0-9]{6}$'),
  trainer_required boolean NOT NULL DEFAULT false,
  health_flags text[] NOT NULL DEFAULT '{}',
  health_notes text NOT NULL DEFAULT '',
  terms_accepted boolean NOT NULL DEFAULT false,
  payment_status payment_status NOT NULL DEFAULT 'Paid',
  photo_url text,
  signature_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id),
  plan_name text NOT NULL,
  duration_label text NOT NULL,
  start_date date NOT NULL,
  expiry_date date NOT NULL,
  membership_amount integer NOT NULL CHECK (membership_amount >= 0),
  registration_fee integer NOT NULL DEFAULT 0 CHECK (registration_fee >= 0),
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  status membership_status NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id),
  membership_id uuid REFERENCES memberships(id),
  amount integer NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL,
  payment_mode payment_mode NOT NULL,
  remarks text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id),
  membership_id uuid REFERENCES memberships(id),
  type reminder_type NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  delivery_status delivery_status NOT NULL,
  provider_message_id text,
  error text NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX reminder_dedupe_daily_idx
  ON reminder_logs (member_id, membership_id, type, ((sent_at AT TIME ZONE 'Asia/Kolkata')::date))
  WHERE type <> 'manual';

CREATE INDEX members_search_idx ON members (full_name, phone_day, member_number);
CREATE INDEX memberships_expiry_idx ON memberships (expiry_date);
CREATE INDEX payments_date_idx ON payments (payment_date);
CREATE INDEX payments_member_idx ON payments (member_id);

CREATE RULE prevent_payment_update AS ON UPDATE TO payments DO INSTEAD NOTHING;
CREATE RULE prevent_payment_delete AS ON DELETE TO payments DO INSTEAD NOTHING;
