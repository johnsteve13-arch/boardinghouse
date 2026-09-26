-- ====================================================================
-- SEAIT STAY — REALISTIC SEED DATA FOR SEAIT, TUPI, SOUTH COTABATO
-- ====================================================================

-- 1. Insert Amenities
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

-- 2. Insert Users (Password hash is bcrypt of "Password123!")
-- $2a$10$w8u3Lq9M6gK8Q9m3Z0.yeeLdYvN0j0yC2/jQ1vB4N4h8qj6i7w7p.
INSERT INTO users (id, email, password_hash, full_name, role, phone, avatar_url, student_id, department, year_level, is_verified) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@seaitstay.edu.ph', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Engr. Danica Flores (Admin)', 'admin', '+63 917 888 1234', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', NULL, 'SEAIT Student Affairs Office', NULL, TRUE),
('b0000000-0000-0000-0000-000000000001', 'nanay.rosa@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Rosa Mae Magbanua', 'owner', '+63 928 412 8765', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', NULL, NULL, NULL, TRUE),
('b0000000-0000-0000-0000-000000000002', 'tatay.ramon@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Ramon Hernandez', 'owner', '+63 945 221 9901', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NULL, NULL, NULL, TRUE),
('b0000000-0000-0000-0000-000000000003', 'elena.torres@gmail.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Elena Torres-Yap', 'owner', '+63 919 773 4512', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', NULL, NULL, NULL, TRUE),
('c0000000-0000-0000-0000-000000000001', 'kristine.bsit@seait.edu.ph', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Kristine Joy Alcantara', 'student', '+63 930 112 3456', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'SEAIT-2022-0491', 'College of Computer Studies (BSIT)', '3rd Year', TRUE),
('c0000000-0000-0000-0000-000000000002', 'mark.crim@seait.edu.ph', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.', 'Mark Angelo Bautista', 'student', '+63 908 998 7654', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'SEAIT-2023-0182', 'College of Criminology', '2nd Year', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Owner Verifications
INSERT INTO owner_verifications (id, owner_id, government_id_type, government_id_number, document_url, permit_number, status, admin_notes, submitted_at, reviewed_at, reviewed_by) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Philippine Passport', 'P8921820A', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600', 'TUPI-BRGY-2024-0891', 'verified', 'Verified on-site visit by SEAIT student accommodation desk. Complete barangay clearance and valid passport.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'a0000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Unified Multi-Purpose ID (UMID)', 'CRN-0111-9281729-1', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600', 'TUPI-MP-2024-1102', 'verified', 'Legitimate homeowner in Purok 5 Crossing Rubber. Excellent safety compliance with fire extinguishers.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Boarding Houses
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

-- 5. Insert Photos
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

-- 6. Insert Amenities Link
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

-- 7. Insert Rooms
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

-- 8. Insert Verified Reviews
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
