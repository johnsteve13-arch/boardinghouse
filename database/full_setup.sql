-- ====================================================================
-- SEAIT STAY — ALL-IN-ONE SUPABASE DATABASE SETUP (SCHEMA + SEED)
-- South East Asian Institute of Technology (SEAIT), Tupi, South Cotabato
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS & DOMAIN TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_policy AS ENUM ('all', 'male_only', 'female_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE room_category AS ENUM ('single', 'double', 'quad', 'bedspace', 'studio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability_status AS ENUM ('available', 'few_slots', 'fully_occupied');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'unverified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    phone VARCHAR(30),
    avatar_url TEXT,
    student_id VARCHAR(50),
    department VARCHAR(100),
    year_level VARCHAR(30),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. OWNER VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS owner_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    government_id_type VARCHAR(100) NOT NULL,
    government_id_number VARCHAR(100) NOT NULL,
    document_url TEXT NOT NULL,
    permit_number VARCHAR(100),
    status verification_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_owner_verifications_owner ON owner_verifications(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_verifications_status ON owner_verifications(status);

-- 4. BOARDING HOUSES TABLE
CREATE TABLE IF NOT EXISTS boarding_houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    purok VARCHAR(100) NOT NULL DEFAULT 'Purok 7, Crossing Rubber',
    barangay VARCHAR(100) NOT NULL DEFAULT 'Crossing Rubber',
    municipality VARCHAR(100) NOT NULL DEFAULT 'Tupi',
    province VARCHAR(100) NOT NULL DEFAULT 'South Cotabato',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    distance_from_seait_meters INTEGER NOT NULL DEFAULT 0,
    walking_time_minutes INTEGER NOT NULL DEFAULT 0,
    gender_policy gender_policy NOT NULL DEFAULT 'all',
    curfew_time VARCHAR(50) DEFAULT '10:00 PM',
    has_curfew BOOLEAN NOT NULL DEFAULT TRUE,
    is_gated BOOLEAN NOT NULL DEFAULT TRUE,
    has_cctv BOOLEAN NOT NULL DEFAULT FALSE,
    has_warden BOOLEAN NOT NULL DEFAULT FALSE,
    cooking_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    visitors_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    pets_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    water_included BOOLEAN NOT NULL DEFAULT TRUE,
    electricity_included BOOLEAN NOT NULL DEFAULT FALSE,
    internet_included BOOLEAN NOT NULL DEFAULT TRUE,
    verification_status verification_status NOT NULL DEFAULT 'unverified',
    availability_status availability_status NOT NULL DEFAULT 'available',
    total_rooms INTEGER NOT NULL DEFAULT 1,
    available_rooms INTEGER NOT NULL DEFAULT 1,
    lowest_price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    highest_price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    rating_average NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    cover_image TEXT NOT NULL,
    safety_notes TEXT,
    last_availability_confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_boarding_houses_owner ON boarding_houses(owner_id);
CREATE INDEX IF NOT EXISTS idx_boarding_houses_distance ON boarding_houses(distance_from_seait_meters);
CREATE INDEX IF NOT EXISTS idx_boarding_houses_price ON boarding_houses(lowest_price_monthly);
CREATE INDEX IF NOT EXISTS idx_boarding_houses_availability ON boarding_houses(availability_status);
CREATE INDEX IF NOT EXISTS idx_boarding_houses_verification ON boarding_houses(verification_status);
CREATE INDEX IF NOT EXISTS idx_boarding_houses_coords ON boarding_houses(latitude, longitude);

-- 5. BOARDING HOUSE PHOTOS TABLE
CREATE TABLE IF NOT EXISTS boarding_house_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_house_id UUID NOT NULL REFERENCES boarding_houses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption VARCHAR(255),
    category VARCHAR(50) NOT NULL DEFAULT 'room',
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_house ON boarding_house_photos(boarding_house_id);

-- 6. ROOMS TABLE
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_house_id UUID NOT NULL REFERENCES boarding_houses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category room_category NOT NULL DEFAULT 'single',
    capacity INTEGER NOT NULL DEFAULT 1,
    available_slots INTEGER NOT NULL DEFAULT 1,
    monthly_rate NUMERIC(10, 2) NOT NULL,
    rate_type VARCHAR(20) NOT NULL DEFAULT 'per_room',
    deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    advance_months INTEGER NOT NULL DEFAULT 1,
    is_airconditioned BOOLEAN NOT NULL DEFAULT FALSE,
    has_private_bathroom BOOLEAN NOT NULL DEFAULT FALSE,
    has_window BOOLEAN NOT NULL DEFAULT TRUE,
    is_furnished BOOLEAN NOT NULL DEFAULT TRUE,
    photos TEXT[] DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rooms_house ON rooms(boarding_house_id);
CREATE INDEX IF NOT EXISTS idx_rooms_rate ON rooms(monthly_rate);

-- 7. AMENITIES TABLE
CREATE TABLE IF NOT EXISTS amenities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS boarding_house_amenities (
    boarding_house_id UUID NOT NULL REFERENCES boarding_houses(id) ON DELETE CASCADE,
    amenity_id VARCHAR(50) NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (boarding_house_id, amenity_id)
);

-- 8. INQUIRIES & MESSAGES TABLE
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_house_id UUID NOT NULL REFERENCES boarding_houses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_interest VARCHAR(100),
    target_move_in_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_student ON inquiries(student_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_owner ON inquiries(owner_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_house ON inquiries(boarding_house_id);

CREATE TABLE IF NOT EXISTS inquiry_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_inquiry ON inquiry_messages(inquiry_id);

-- 9. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_house_id UUID NOT NULL REFERENCES boarding_houses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_stay_verified BOOLEAN NOT NULL DEFAULT TRUE,
    overall_rating NUMERIC(2, 1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
    cleanliness_rating NUMERIC(2, 1) NOT NULL,
    location_rating NUMERIC(2, 1) NOT NULL,
    value_rating NUMERIC(2, 1) NOT NULL,
    safety_rating NUMERIC(2, 1) NOT NULL,
    owner_responsiveness_rating NUMERIC(2, 1) NOT NULL,
    comment TEXT NOT NULL,
    owner_reply TEXT,
    owner_replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_house ON reviews(boarding_house_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student ON reviews(student_id);

-- 10. FAVORITES & REPORTS
CREATE TABLE IF NOT EXISTS favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    boarding_house_id UUID NOT NULL REFERENCES boarding_houses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, boarding_house_id)
);

CREATE TABLE IF NOT EXISTS property_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_house_id UUID NOT NULL REFERENCES boarding_houses(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 12. AUDIT LOGS & SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (key, value)
VALUES (
    'seait_geo_config',
    json_build_object(
        'seaitLatitude', 6.3648,
        'seaitLongitude', 124.9222,
        'campusName', 'South East Asian Institute of Technology (SEAIT)',
        'campusAddress', 'National Highway, Purok 7, Crossing Rubber, Tupi, South Cotabato 9505',
        'defaultSearchRadiusKm', 2.0,
        'maxSearchRadiusKm', 5.0,
        'staleAvailabilityThresholdDays', 14
    )
) ON CONFLICT (key) DO NOTHING;

-- 13. HAVERSINE DISTANCE FUNCTION
CREATE OR REPLACE FUNCTION calculate_distance_meters(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371000;
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ====================================================================
-- SEED DATA SECTION
-- ====================================================================

-- 14. Insert Amenities
INSERT INTO amenities (id, name, category, icon, description) VALUES
('wifi', 'Fiber / Starlink Wi-Fi', 'connectivity', 'Wifi', 'High-speed internet suitable for research and online classes'),
('aircon', 'Air Conditioning', 'comfort', 'AirVent', 'Air conditioned rooms or provision for unit'),
('private_bathroom', 'Private Bathroom', 'comfort', 'Bath', 'En-suite toilet and shower inside the room'),
('cctv', '24/7 CCTV Security', 'security', 'ShieldCheck', 'Security surveillance cameras covering entrances and hallways'),
('gated', 'Gated Perimeter & Lock', 'security', 'KeyRound', 'Perimeter fence with secure gate locked at night'),
('cooking_allowed', 'Cooking Allowed', 'utilities', 'UtensilsCrossed', 'Access to kitchen gas stove or electric cooker space'),
('laundry_area', 'Laundry / Drying Area', 'utilities', 'Shirt', 'Dedicated wash sinks and outdoor/covered drying lines'),
('study_area', 'Quiet Study Lounge', 'comfort', 'BookOpen', 'Well-lit communal study tables with power sockets'),
('drinking_water', 'Free Purified Water', 'utilities', 'GlassWater', 'Continuous supply of mineral / alkaline drinking water'),
('generator', 'Generator / Solar Backup', 'utilities', 'Zap', 'Power backup for lighting and charging during brownouts'),
('curfew_strict', 'Curfew Monitored', 'rules', 'Clock', 'Strict night curfew for student safety'),
('refrigerator', 'Shared Refrigerator', 'utilities', 'Refrigerator', 'Community fridge for tenant food storage')
ON CONFLICT (id) DO NOTHING;

-- 15. Insert Users
INSERT INTO users (id, email, password_hash, full_name, role, phone, avatar_url, student_id, department, year_level, is_verified) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@seaitstay.edu.ph', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Engr. Danica Flores (Admin)', 'admin', '+63 917 888 1234', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', NULL, 'SEAIT Student Affairs Office', NULL, TRUE),
('b0000000-0000-0000-0000-000000000001', 'nanay.rosa@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Rosa Mae Magbanua', 'owner', '+63 928 412 8765', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', NULL, NULL, NULL, TRUE),
('b0000000-0000-0000-0000-000000000002', 'tatay.ramon@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Ramon Hernandez', 'owner', '+63 945 221 9901', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NULL, NULL, NULL, TRUE),
('b0000000-0000-0000-0000-000000000003', 'elena.torres@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Elena Torres-Yap', 'owner', '+63 919 773 4512', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', NULL, NULL, NULL, TRUE),
('c0000000-0000-0000-0000-000000000001', 'kristine.bsit@seait.edu.ph', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Kristine Joy Alcantara', 'student', '+63 930 112 3456', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'SEAIT-2022-0491', 'College of Computer Studies (BSIT)', '3rd Year', TRUE),
('c0000000-0000-0000-0000-000000000002', 'mark.crim@seait.edu.ph', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Mark Angelo Bautista', 'student', '+63 908 998 7654', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'SEAIT-2023-0182', 'College of Criminology', '2nd Year', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 16. Insert Owner Verifications
INSERT INTO owner_verifications (id, owner_id, government_id_type, government_id_number, document_url, permit_number, status, admin_notes, submitted_at, reviewed_at, reviewed_by) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Philippine Passport', 'P8921820A', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600', 'TUPI-BRGY-2024-0891', 'verified', 'Verified on-site visit by SEAIT student accommodation desk. Complete barangay clearance and valid passport.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'a0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Unified Multi-Purpose ID (UMID)', 'CRN-0111-9281729-1', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600', 'TUPI-MP-2024-1102', 'verified', 'Legitimate homeowner in Purok 5 Crossing Rubber. Excellent safety compliance with fire extinguishers.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 17. Insert Boarding Houses
INSERT INTO boarding_houses (
    id, owner_id, name, slug, description, address, purok, barangay, municipality, province,
    latitude, longitude, distance_from_seait_meters, walking_time_minutes, gender_policy,
    curfew_time, has_curfew, is_gated, has_cctv, has_warden, cooking_allowed, visitors_allowed, pets_allowed,
    water_included, electricity_included, internet_included, verification_status, availability_status,
    total_rooms, available_rooms, lowest_price_monthly, highest_price_monthly, rating_average, rating_count,
    cover_image, safety_notes, last_availability_confirmed_at
) VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Green Ville Student Dormitory',
    'green-ville-student-dormitory',
    'Quiet, safe, and modern student dorm located just a 4-minute walk from SEAIT campus gate. Equipped with Starlink fiber internet, dedicated study room, and spacious individual desks. Quiet study environment strictly maintained after 9:00 PM.',
    'Purok 7, Crossing Rubber, National Highway, Tupi, South Cotabato (Behind Crossing Rubber Barangay Chapel)',
    'Purok 7, Crossing Rubber', 'Crossing Rubber', 'Tupi', 'South Cotabato',
    6.3662000, 124.9238000, 350, 4, 'all',
    '10:00 PM', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE,
    TRUE, FALSE, TRUE, 'verified', 'available',
    12, 3, 1800.00, 4200.00, 4.9, 18,
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'Gated perimeter with locked gate at 10 PM. CCTV installed at main gate, entrance hallways, and bike rack. Fire extinguishers on every floor.',
    CURRENT_TIMESTAMP
),
(
    'e0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Acacia Ladies Hall & Dormitory',
    'acacia-ladies-hall-dormitory',
    'Exclusively for female students of SEAIT (Nursing, Education, IT, Agriculture). Safe, homely atmosphere with resident female house mother (Nanay Rosa). Clean shared kitchen, free filtered alkaline drinking water, and backup solar generator.',
    'Purok 6, Crossing Rubber, Tupi, South Cotabato (Near Acacia Tree intersection)',
    'Purok 6, Crossing Rubber', 'Crossing Rubber', 'Tupi', 'South Cotabato',
    6.3631000, 124.9205000, 550, 7, 'female_only',
    '9:30 PM', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE,
    TRUE, FALSE, TRUE, 'verified', 'few_slots',
    8, 1, 1500.00, 3500.00, 4.8, 14,
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
    'Female-only access. Visitors permitted only in the open reception porch until 6:00 PM. First aid kit and emergency transport contact available.',
    CURRENT_TIMESTAMP
),
(
    'e0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000002',
    'Rubber Crossing Scholar Haven',
    'rubber-crossing-scholar-haven',
    'Closest boarding house to SEAIT! Situated directly along the National Highway access lane, barely 280 meters from the SEAIT front entrance. Ideal for students who prefer quick walking access between morning and afternoon lectures.',
    'Purok 5, National Highway, Crossing Rubber, Tupi, South Cotabato',
    'Purok 5, Crossing Rubber', 'Crossing Rubber', 'Tupi', 'South Cotabato',
    6.3655000, 124.9212000, 280, 3, 'all',
    '10:30 PM', TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE,
    TRUE, FALSE, TRUE, 'verified', 'available',
    10, 4, 1600.00, 3800.00, 4.7, 21,
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    'Sturdy steel gate with biometric digital keypad lock. Well-lighted pedestrian pathway leading straight to the highway.',
    CURRENT_TIMESTAMP
),
(
    'e0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'St. Jude Student Residence & Bedspace',
    'st-jude-student-residence-bedspace',
    'Budget-friendly and welcoming accommodation popular among SEAIT Criminology and Agriculture students. Large shared study area, wide laundry yard, and motorcycle parking inside the fenced yard.',
    'Purok 4, Crossing Rubber, Tupi, South Cotabato',
    'Purok 4, Crossing Rubber', 'Crossing Rubber', 'Tupi', 'South Cotabato',
    6.3685000, 124.9255000, 750, 9, 'all',
    '10:00 PM', TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, FALSE,
    TRUE, TRUE, TRUE, 'verified', 'available',
    14, 5, 1200.00, 2800.00, 4.6, 12,
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'Fenced compound, bright night security floodlights, clear exit pathways.',
    CURRENT_TIMESTAMP
),
(
    'e0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000003',
    'Golden Palm Dormitory for Men',
    'golden-palm-dormitory-for-men',
    'All-male boarding house designed for discipline and focused study. Spacious 2-person and 4-person rooms with study desks, private lockers, and strong Wi-Fi. Motorcycle parking available.',
    'Purok 7, Crossing Rubber, Tupi, South Cotabato (East boundary)',
    'Purok 7, Crossing Rubber', 'Crossing Rubber', 'Tupi', 'South Cotabato',
    6.3640000, 124.9258000, 420, 5, 'male_only',
    '10:00 PM', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE,
    TRUE, FALSE, TRUE, 'verified', 'few_slots',
    6, 1, 1400.00, 3200.00, 4.7, 9,
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    'Strict curfew and sign-in logbook. Security cameras monitor parking and lobby.',
    CURRENT_TIMESTAMP
),
(
    'e0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000003',
    'Dole Road Scholar Inn',
    'dole-road-scholar-inn',
    'Modern studio units and deluxe rooms with private bathrooms and optional inverter air conditioning. Quiet, breezy neighborhood with fresh fruit stalls nearby along the Dole bypass route.',
    'Purok 2, Crossing Rubber near Dole Bypass, Tupi, South Cotabato',
    'Purok 2, Crossing Rubber', 'Crossing Rubber', 'Tupi', 'South Cotabato',
    6.3720000, 124.9180000, 1200, 15, 'all',
    '11:00 PM', TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE,
    TRUE, FALSE, TRUE, 'verified', 'available',
    8, 2, 2200.00, 4500.00, 4.8, 8,
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
    'Solar streetlights outside property, gated perimeter, 24/7 caretaker on site.',
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- 18. Insert Photos
INSERT INTO boarding_house_photos (boarding_house_id, url, caption, category, is_cover, sort_order) VALUES
('e0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'Front Facade & Secure Gate', 'exterior', TRUE, 1),
('e0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', 'Deluxe Single Room with Study Desk', 'room', FALSE, 2),
('e0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', 'Clean Ceramic Tiled Bathroom', 'bathroom', FALSE, 3),
('e0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800', 'Tenant Shared Kitchen Area', 'kitchen', FALSE, 4),
('e0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', 'Cozy Ladies Bedroom with Natural Light', 'room', TRUE, 1),
('e0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800', 'Quiet Study Room for Exam Weeks', 'study_area', FALSE, 2),
('e0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', 'Bright Bedspace Room with Storage', 'room', TRUE, 1),
('e0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'Common Lounge & Receiving Area', 'common_area', FALSE, 2)
ON CONFLICT DO NOTHING;

-- 19. Insert Amenities Link
INSERT INTO boarding_house_amenities (boarding_house_id, amenity_id) VALUES
('e0000000-0000-0000-0000-000000000001', 'wifi'),
('e0000000-0000-0000-0000-000000000001', 'aircon'),
('e0000000-0000-0000-0000-000000000001', 'private_bathroom'),
('e0000000-0000-0000-0000-000000000001', 'cctv'),
('e0000000-0000-0000-0000-000000000001', 'gated'),
('e0000000-0000-0000-0000-000000000001', 'cooking_allowed'),
('e0000000-0000-0000-0000-000000000001', 'study_area'),
('e0000000-0000-0000-0000-000000000001', 'drinking_water'),
('e0000000-0000-0000-0000-000000000002', 'wifi'),
('e0000000-0000-0000-0000-000000000002', 'cctv'),
('e0000000-0000-0000-0000-000000000002', 'gated'),
('e0000000-0000-0000-0000-000000000002', 'cooking_allowed'),
('e0000000-0000-0000-0000-000000000002', 'study_area'),
('e0000000-0000-0000-0000-000000000002', 'curfew_strict'),
('e0000000-0000-0000-0000-000000000003', 'wifi'),
('e0000000-0000-0000-0000-000000000003', 'gated'),
('e0000000-0000-0000-0000-000000000003', 'cooking_allowed'),
('e0000000-0000-0000-0000-000000000003', 'laundry_area')
ON CONFLICT DO NOTHING;

-- 20. Insert Rooms
INSERT INTO rooms (
    id, boarding_house_id, name, category, capacity, available_slots, monthly_rate,
    rate_type, deposit_amount, advance_months, is_airconditioned, has_private_bathroom,
    has_window, is_furnished, description
) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Single Deluxe Aircon', 'single', 1, 1, 4200.00, 'per_room', 4200.00, 1, TRUE, TRUE, TRUE, TRUE, 'Private solo room with split-type inverter aircon, private toilet and bath, study table and wardrobe cabinet.'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Double Sharing Fan Room', 'double', 2, 2, 2100.00, 'per_person', 2100.00, 1, FALSE, FALSE, TRUE, TRUE, 'Spacious 2-bed room with large screened windows, individual study desks, and ceiling fan.'),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'Quad Economy Bedspace', 'quad', 4, 0, 1800.00, 'per_person', 1800.00, 1, FALSE, FALSE, TRUE, TRUE, 'Double-deck bunks with uratex foam, private lockable drawers under each bed.'),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'Solo Ladies Room', 'single', 1, 0, 3500.00, 'per_room', 3500.00, 1, FALSE, TRUE, TRUE, TRUE, 'Quiet solo room with private bath and reading lamp.'),
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', '2-Bed Ladies Room', 'double', 2, 1, 1900.00, 'per_person', 1900.00, 1, FALSE, FALSE, TRUE, TRUE, 'Well-ventilated sharing room with private closets and mirror.'),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003', 'Solo Highway View Room', 'single', 1, 1, 3800.00, 'per_room', 3800.00, 1, TRUE, TRUE, TRUE, TRUE, 'Private room with highway access view and private bathroom.'),
('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003', '4-Person Budget Bedspace', 'bedspace', 4, 3, 1600.00, 'per_person', 1600.00, 1, FALSE, FALSE, TRUE, TRUE, 'Affordable bedspace with water included and fast internet.')
ON CONFLICT (id) DO NOTHING;

-- 21. Insert Verified Reviews
INSERT INTO reviews (
    id, boarding_house_id, student_id, is_stay_verified, overall_rating, cleanliness_rating,
    location_rating, value_rating, safety_rating, owner_responsiveness_rating, comment,
    owner_reply, owner_replied_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    TRUE, 5.0, 5.0, 5.0, 4.8, 5.0, 5.0,
    'Super convenient for BSIT students like me who have late capstone projects! The Starlink connection is very reliable even when it rains, and walking to SEAIT takes less than 5 minutes. Nanay Rosa and the caretakers are very kind and approachable.',
    'Salamat Kristine Joy! We always make sure student needs come first. Good luck on your thesis defense!',
    CURRENT_TIMESTAMP
),
(
    '00000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    TRUE, 4.8, 4.9, 5.0, 4.7, 5.0, 4.8,
    'Tahimik at safe. Solid ang gate and CCTV. Never nagkaroon ng issue sa gamit. Best boarding house near SEAIT Crossing Rubber.',
    NULL,
    NULL
)
ON CONFLICT (id) DO NOTHING;
