-- ====================================================================
-- SEAIT STAY — PRODUCTION POSTGRESQL / SUPABASE DATABASE SCHEMA
-- South East Asian Institute of Technology (SEAIT), Tupi, South Cotabato
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. ENUMS & DOMAIN TYPES
-- ====================================================================
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

-- ====================================================================
-- 2. USERS & PROFILES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    phone VARCHAR(30),
    avatar_url TEXT,
    student_id VARCHAR(50), -- e.g. "SEAIT-2023-10492"
    department VARCHAR(100), -- e.g. "College of Computer Studies"
    year_level VARCHAR(30),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ====================================================================
-- 3. OWNER VERIFICATIONS TABLE
-- ====================================================================
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

-- ====================================================================
-- 4. BOARDING HOUSES TABLE
-- ====================================================================
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

-- ====================================================================
-- 5. BOARDING HOUSE PHOTOS TABLE
-- ====================================================================
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

-- ====================================================================
-- 6. ROOMS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_house_id UUID NOT NULL REFERENCES boarding_houses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category room_category NOT NULL DEFAULT 'single',
    capacity INTEGER NOT NULL DEFAULT 1,
    available_slots INTEGER NOT NULL DEFAULT 1,
    monthly_rate NUMERIC(10, 2) NOT NULL,
    rate_type VARCHAR(20) NOT NULL DEFAULT 'per_room', -- 'per_room' | 'per_person'
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

-- ====================================================================
-- 7. AMENITIES & LINK TABLE
-- ====================================================================
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

-- ====================================================================
-- 8. INQUIRIES & MESSAGES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boarding_house_id UUID NOT NULL REFERENCES boarding_houses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_interest VARCHAR(100),
    target_move_in_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending' | 'responded' | 'closed'
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

-- ====================================================================
-- 9. REVIEWS & RATINGS TABLE
-- ====================================================================
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

-- ====================================================================
-- 10. FAVORITES & COMPARISONS TABLE
-- ====================================================================
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

-- ====================================================================
-- 11. NOTIFICATIONS TABLE
-- ====================================================================
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

-- ====================================================================
-- 12. AUDIT LOGS & SYSTEM SETTINGS
-- ====================================================================
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

-- Default SEAIT campus configuration
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

-- ====================================================================
-- 13. GEOGRAPHIC HAVERSINE DISTANCE HELPER FUNCTION
-- ====================================================================
CREATE OR REPLACE FUNCTION calculate_distance_meters(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371000; -- Earth radius in meters
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
