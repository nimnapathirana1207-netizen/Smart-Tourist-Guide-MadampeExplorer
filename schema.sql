-- ============================================================
--  Madampe Explorer – Database Schema & Seed Data
--  Database: madampe_explorer
-- ============================================================

CREATE DATABASE IF NOT EXISTS madampe_explorer
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE madampe_explorer;

-- ── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL UNIQUE,
  icon       VARCHAR(10)  NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── PLACES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS places (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)   NOT NULL,
  category_id   INT            NOT NULL,
  distance_km   DECIMAL(5,1)   NOT NULL,
  description   TEXT           NOT NULL,
  image_url     VARCHAR(300)   DEFAULT NULL,
  latitude      DECIMAL(10,7)  DEFAULT NULL,
  longitude     DECIMAL(10,7)  DEFAULT NULL,
  is_active     TINYINT(1)     DEFAULT 1,
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- ── TRIP PLANS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_plans (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  plan_name  VARCHAR(100) DEFAULT 'My Day Trip',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── TRIP PLAN ITEMS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_plan_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  plan_id    INT NOT NULL,
  place_id   INT NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (plan_id)  REFERENCES trip_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (place_id) REFERENCES places(id)     ON DELETE CASCADE
);

-- ── CONTACT MESSAGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  message    TEXT         NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  SEED DATA
-- ============================================================

INSERT INTO categories (name, icon) VALUES
  ('Sightseeing', '🏖️'),
  ('Religious',   '🛕'),
  ('Nature',      '🌿'),
  ('Cultural',    '🏛️'),
  ('Leisure',     '🌊'),
  ('Hotel',       '🏨');

INSERT INTO places (name, category_id, distance_km, description, latitude, longitude) VALUES
  ('Marawila Beach',          1, 8.0,  'A popular sandy beach ideal for relaxation, swimming, and watching breathtaking sunsets over the Indian Ocean.',        7.5100, 79.8800),
  ('Munneswaram Temple',      2, 15.0, 'A historic and revered Hindu temple that has attracted pilgrims for centuries. The annual festival draws thousands.',   7.6050, 79.9200),
  ('Chilaw Beach Park',       5, 18.0, 'A public coastal recreation area offering a relaxed environment for picnics, walks along the shore.',                   7.5750, 79.7950),
  ('Senanayake Aramaya',      2,  6.0, 'A peaceful and beautifully maintained Buddhist temple offering a serene atmosphere for meditation and reflection.',    7.6200, 79.8850),
  ('Madampe Market',          4,  1.0, 'The vibrant local marketplace at the heart of Madampe town, showcasing authentic daily community life.',               7.6136, 79.8703),
  ('Deduru Oya River',        3, 12.0, 'A scenic river environment offering stunning views, birdwatching, and a tranquil escape into nature.',                 7.6400, 79.9400),
  ('Thoduwawa Beach',         1, 10.0, 'A charming fishing village beach with natural scenery and a glimpse into authentic coastal life.',                     7.5400, 79.8600),
  ('St. Anne\'s Church Talawila', 2, 22.0, 'A famous Catholic pilgrimage destination. The annual feast of St. Anne draws hundreds of thousands of pilgrims.', 7.7200, 79.8200),
  ('Club Palm Bay Hotel',     6,  9.0, 'A beautiful beachfront resort offering comfortable accommodation, dining, and leisure facilities.',                    7.5200, 79.8750),
  ('Amagi Beach Hotel',       6, 11.0, 'A coastal hotel in Marawila offering excellent dining, swimming pools, and a relaxed beachside atmosphere.',           7.5050, 79.8820);
