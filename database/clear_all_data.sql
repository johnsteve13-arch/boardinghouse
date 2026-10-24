-- =========================================================================
-- SEAIT STAY: CLEAR ALL SYSTEM DATA
-- Retains ONLY the primary Administrator account and standard amenities.
-- Wipes all boarding houses, rooms, reviews, inquiries, verifications,
-- reports, favorites, notifications, and student/owner accounts.
-- =========================================================================

-- 1. Truncate dependent relational tables
TRUNCATE TABLE inquiry_messages CASCADE;
TRUNCATE TABLE inquiries CASCADE;
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE favorites CASCADE;
TRUNCATE TABLE property_reports CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE boarding_house_photos CASCADE;
TRUNCATE TABLE boarding_house_amenities CASCADE;
TRUNCATE TABLE rooms CASCADE;
TRUNCATE TABLE owner_verifications CASCADE;
TRUNCATE TABLE boarding_houses CASCADE;

-- 2. Clear all non-admin users
DELETE FROM users WHERE role != 'admin';

-- 3. Ensure the primary administrator account exists
INSERT INTO users (
  id,
  email,
  password_hash,
  full_name,
  role,
  phone,
  avatar_url,
  department,
  is_verified,
  created_at,
  updated_at
) VALUES (
  'user-admin-1',
  'admin@seaitstay.edu.ph',
  '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.',
  'Engr. Danica Flores (Admin)',
  'admin',
  '+63 917 888 1234',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'SEAIT Student Affairs Office',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_verified = true,
  updated_at = NOW();

-- 4. Reset system settings to default SEAIT Crossing Rubber coordinates
INSERT INTO system_settings (
  id,
  seait_latitude,
  seait_longitude,
  default_search_radius_km,
  max_search_radius_km,
  enable_exact_location_to_public,
  stale_availability_threshold_days,
  updated_at
) VALUES (
  'settings-1',
  6.3648,
  124.9222,
  2.0,
  5.0,
  true,
  14,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  seait_latitude = 6.3648,
  seait_longitude = 124.9222,
  updated_at = NOW();
