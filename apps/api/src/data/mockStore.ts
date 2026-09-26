import {
  User,
  BoardingHouse,
  Room,
  Review,
  Inquiry,
  Notification,
  OwnerVerification,
  PropertyReport,
  SystemSettings,
  AuditLog
} from '@seait-stay/types';
import { calculateDistanceToSeaitMeters, calculateWalkingTimeMinutes } from '../config/seait';

export interface StoreState {
  users: User[];
  passwords: Record<string, string>; // userId -> password hash
  boardingHouses: BoardingHouse[];
  reviews: Review[];
  inquiries: Inquiry[];
  notifications: Notification[];
  ownerVerifications: OwnerVerification[];
  propertyReports: PropertyReport[];
  favorites: Record<string, string[]>; // userId -> boardingHouseId[]
  comparisons: Record<string, string[]>; // userId -> boardingHouseId[]
  systemSettings: SystemSettings;
  auditLogs: AuditLog[];
}

// Initial realistic seed data for SEAIT
const initialUsers: User[] = [
  {
    id: 'user-admin-1',
    email: 'admin@seaitstay.edu.ph',
    fullName: 'Engr. Danica Flores (Admin)',
    role: 'admin',
    phone: '+63 917 888 1234',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    department: 'SEAIT Student Affairs Office',
    isVerified: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-01-15T08:00:00.000Z'
  },
  {
    id: 'user-owner-1',
    email: 'nanay.rosa@gmail.com',
    fullName: 'Rosa Mae Magbanua (Nanay Rosa)',
    role: 'owner',
    phone: '+63 928 412 8765',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    isVerified: true,
    createdAt: '2024-01-20T08:00:00.000Z',
    updatedAt: '2024-01-20T08:00:00.000Z'
  },
  {
    id: 'user-owner-2',
    email: 'tatay.ramon@gmail.com',
    fullName: 'Ramon Hernandez (Tatay Ramon)',
    role: 'owner',
    phone: '+63 945 221 9901',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isVerified: true,
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-02-01T08:00:00.000Z'
  },
  {
    id: 'user-owner-3',
    email: 'elena.torres@gmail.com',
    fullName: 'Elena Torres-Yap',
    role: 'owner',
    phone: '+63 919 773 4512',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    isVerified: true,
    createdAt: '2024-02-10T08:00:00.000Z',
    updatedAt: '2024-02-10T08:00:00.000Z'
  },
  {
    id: 'user-student-1',
    email: 'kristine.bsit@seait.edu.ph',
    fullName: 'Kristine Joy Alcantara',
    role: 'student',
    phone: '+63 930 112 3456',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    studentId: 'SEAIT-2022-0491',
    department: 'College of Computer Studies (BSIT)',
    yearLevel: '3rd Year',
    isVerified: true,
    createdAt: '2024-03-01T08:00:00.000Z',
    updatedAt: '2024-03-01T08:00:00.000Z'
  },
  {
    id: 'user-student-2',
    email: 'mark.crim@seait.edu.ph',
    fullName: 'Mark Angelo Bautista',
    role: 'student',
    phone: '+63 908 998 7654',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    studentId: 'SEAIT-2023-0182',
    department: 'College of Criminology',
    yearLevel: '2nd Year',
    isVerified: true,
    createdAt: '2024-03-05T08:00:00.000Z',
    updatedAt: '2024-03-05T08:00:00.000Z'
  }
];

// Pre-hashed "Password123!" using bcryptjs
const initialPasswords: Record<string, string> = {
  'user-admin-1': '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.',
  'user-owner-1': '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.',
  'user-owner-2': '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.',
  'user-owner-3': '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.',
  'user-student-1': '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.',
  'user-student-2': '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.'
};

const initialBoardingHouses: BoardingHouse[] = [
  {
    id: 'bh-1',
    ownerId: 'user-owner-1',
    ownerName: 'Rosa Mae Magbanua (Nanay Rosa)',
    ownerPhone: '+63 928 412 8765',
    ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    ownerVerified: true,
    name: 'Green Ville Student Dormitory',
    slug: 'green-ville-student-dormitory',
    description:
      'Premier student residence just 4 minutes walking distance from SEAIT main campus gate. Built specifically for serious scholars, featuring ultra-fast Starlink Wi-Fi, individual study desks, secure biometric gate lock, and dedicated quiet study lounge after 9:00 PM. Clean water refilling station and shared kitchen with gas stoves provided for tenants.',
    address: 'Purok 7, Crossing Rubber, National Highway, Tupi, South Cotabato (Behind Crossing Rubber Barangay Chapel)',
    purok: 'Purok 7',
    barangay: 'Crossing Rubber',
    municipality: 'Tupi',
    province: 'South Cotabato',
    latitude: 6.3662,
    longitude: 124.9238,
    distanceFromSeaitMeters: calculateDistanceToSeaitMeters(6.3662, 124.9238),
    walkingTimeMinutes: calculateWalkingTimeMinutes(calculateDistanceToSeaitMeters(6.3662, 124.9238)),
    genderPolicy: 'all',
    curfewTime: '10:00 PM',
    hasCurfew: true,
    isGated: true,
    hasCctv: true,
    hasWarden: true,
    cookingAllowed: true,
    visitorsAllowed: true,
    petsAllowed: false,
    waterIncluded: true,
    electricityIncluded: false,
    internetIncluded: true,
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    totalRooms: 12,
    availableRooms: 3,
    lowestPriceMonthly: 1800,
    highestPriceMonthly: 4200,
    ratingAverage: 4.9,
    ratingCount: 18,
    coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    safetyNotes:
      'Full perimeter wall with steel gate locked automatically at 10 PM. 8 HD CCTV cameras monitoring entrance, courtyard, study area, and bike rack. Certified fire extinguishers and first aid kit available.',
    lastAvailabilityConfirmedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: '2024-01-22T08:00:00.000Z',
    updatedAt: '2024-03-20T08:00:00.000Z',
    photos: [
      {
        id: 'p-1',
        boardingHouseId: 'bh-1',
        url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        caption: 'Front facade and secure compound',
        category: 'exterior',
        isCover: true,
        sortOrder: 1
      },
      {
        id: 'p-2',
        boardingHouseId: 'bh-1',
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        caption: 'Deluxe private room with work desk',
        category: 'room',
        isCover: false,
        sortOrder: 2
      },
      {
        id: 'p-3',
        boardingHouseId: 'bh-1',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
        caption: 'En-suite private tiled bathroom',
        category: 'bathroom',
        isCover: false,
        sortOrder: 3
      },
      {
        id: 'p-4',
        boardingHouseId: 'bh-1',
        url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
        caption: 'Quiet communal study lounge',
        category: 'study_area',
        isCover: false,
        sortOrder: 4
      }
    ],
    rooms: [
      {
        id: 'r-1',
        boardingHouseId: 'bh-1',
        name: 'Single Solo Deluxe (Aircon)',
        category: 'single',
        capacity: 1,
        availableSlots: 1,
        monthlyRate: 4200,
        rateType: 'per_room',
        depositAmount: 4200,
        advanceMonths: 1,
        isAirconditioned: true,
        hasPrivateBathroom: true,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'],
        description: 'Private single room with split-type inverter aircon, private bath, sturdy study desk and chair.'
      },
      {
        id: 'r-2',
        boardingHouseId: 'bh-1',
        name: 'Double Sharing Fan Room',
        category: 'double',
        capacity: 2,
        availableSlots: 2,
        monthlyRate: 2100,
        rateType: 'per_person',
        depositAmount: 2100,
        advanceMonths: 1,
        isAirconditioned: false,
        hasPrivateBathroom: false,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
        description: '2 single beds with uratex mattress, individual closets, screened windows.'
      },
      {
        id: 'r-3',
        boardingHouseId: 'bh-1',
        name: 'Quad Economy Bedspace',
        category: 'quad',
        capacity: 4,
        availableSlots: 0,
        monthlyRate: 1800,
        rateType: 'per_person',
        depositAmount: 1800,
        advanceMonths: 1,
        isAirconditioned: false,
        hasPrivateBathroom: false,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        description: 'Bunk beds with privacy curtains and personal locked storage bins.'
      }
    ],
    amenities: [
      'wifi',
      'aircon',
      'private_bathroom',
      'cctv',
      'gated',
      'cooking_allowed',
      'study_area',
      'drinking_water',
      'generator'
    ]
  },
  {
    id: 'bh-2',
    ownerId: 'user-owner-1',
    ownerName: 'Rosa Mae Magbanua (Nanay Rosa)',
    ownerPhone: '+63 928 412 8765',
    ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    ownerVerified: true,
    name: 'Acacia Ladies Hall & Dormitory',
    slug: 'acacia-ladies-hall-dormitory',
    description:
      'Warm and protective female-only dormitory catering exclusively to SEAIT women students (Nursing, Education, IT, Criminology). Managed on-site by resident house mother Nanay Rosa. Peaceful environment with strict visitor policies, evening rosary/fellowship space, clean shared kitchen, and complimentary filtered drinking water.',
    address: 'Purok 6, Crossing Rubber, Tupi, South Cotabato (Near Acacia Tree intersection)',
    purok: 'Purok 6',
    barangay: 'Crossing Rubber',
    municipality: 'Tupi',
    province: 'South Cotabato',
    latitude: 6.3631,
    longitude: 124.9205,
    distanceFromSeaitMeters: calculateDistanceToSeaitMeters(6.3631, 124.9205),
    walkingTimeMinutes: calculateWalkingTimeMinutes(calculateDistanceToSeaitMeters(6.3631, 124.9205)),
    genderPolicy: 'female_only',
    curfewTime: '9:30 PM',
    hasCurfew: true,
    isGated: true,
    hasCctv: true,
    hasWarden: true,
    cookingAllowed: true,
    visitorsAllowed: false,
    petsAllowed: false,
    waterIncluded: true,
    electricityIncluded: false,
    internetIncluded: true,
    verificationStatus: 'verified',
    availabilityStatus: 'few_slots',
    totalRooms: 8,
    availableRooms: 1,
    lowestPriceMonthly: 1500,
    highestPriceMonthly: 3500,
    ratingAverage: 4.8,
    ratingCount: 14,
    coverImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
    safetyNotes:
      'Strict female-only policy. Male visitors are strictly restricted to the outdoor reception veranda. 24/7 security lighting, emergency alert bell, and verified caretaker living on ground floor.',
    lastAvailabilityConfirmedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: '2024-01-25T08:00:00.000Z',
    updatedAt: '2024-03-21T08:00:00.000Z',
    photos: [
      {
        id: 'p-201',
        boardingHouseId: 'bh-2',
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        caption: 'Cozy and well-ventilated ladies room',
        category: 'room',
        isCover: true,
        sortOrder: 1
      },
      {
        id: 'p-202',
        boardingHouseId: 'bh-2',
        url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
        caption: 'Study desk corner with natural light',
        category: 'study_area',
        isCover: false,
        sortOrder: 2
      }
    ],
    rooms: [
      {
        id: 'r-201',
        boardingHouseId: 'bh-2',
        name: 'Private Solo Ladies Room',
        category: 'single',
        capacity: 1,
        availableSlots: 0,
        monthlyRate: 3500,
        rateType: 'per_room',
        depositAmount: 3500,
        advanceMonths: 1,
        isAirconditioned: false,
        hasPrivateBathroom: true,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800']
      },
      {
        id: 'r-202',
        boardingHouseId: 'bh-2',
        name: '2-Bed Shared Room',
        category: 'double',
        capacity: 2,
        availableSlots: 1,
        monthlyRate: 1900,
        rateType: 'per_person',
        depositAmount: 1900,
        advanceMonths: 1,
        isAirconditioned: false,
        hasPrivateBathroom: false,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800']
      }
    ],
    amenities: ['wifi', 'cctv', 'gated', 'cooking_allowed', 'study_area', 'drinking_water', 'curfew_strict']
  },
  {
    id: 'bh-3',
    ownerId: 'user-owner-2',
    ownerName: 'Ramon Hernandez (Tatay Ramon)',
    ownerPhone: '+63 945 221 9901',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    ownerVerified: true,
    name: 'Rubber Crossing Scholar Haven',
    slug: 'rubber-crossing-scholar-haven',
    description:
      'Closest boarding house to SEAIT! Located right along the National Highway access lane, barely 280 meters from the SEAIT front gates. Perfect for students who want to go home for lunch between morning and afternoon classes. High-speed PLDT Fiber internet, spacious motorcycle parking, and gated fence.',
    address: 'Purok 5, National Highway, Crossing Rubber, Tupi, South Cotabato',
    purok: 'Purok 5',
    barangay: 'Crossing Rubber',
    municipality: 'Tupi',
    province: 'South Cotabato',
    latitude: 6.3655,
    longitude: 124.9212,
    distanceFromSeaitMeters: calculateDistanceToSeaitMeters(6.3655, 124.9212),
    walkingTimeMinutes: calculateWalkingTimeMinutes(calculateDistanceToSeaitMeters(6.3655, 124.9212)),
    genderPolicy: 'all',
    curfewTime: '10:30 PM',
    hasCurfew: true,
    isGated: true,
    hasCctv: true,
    hasWarden: false,
    cookingAllowed: true,
    visitorsAllowed: true,
    petsAllowed: false,
    waterIncluded: true,
    electricityIncluded: false,
    internetIncluded: true,
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    totalRooms: 10,
    availableRooms: 4,
    lowestPriceMonthly: 1600,
    highestPriceMonthly: 3800,
    ratingAverage: 4.7,
    ratingCount: 21,
    coverImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    safetyNotes: 'Steel gate with digital keypad code, floodlights at night, wide concrete walkway to highway.',
    lastAvailabilityConfirmedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: '2024-02-02T08:00:00.000Z',
    updatedAt: '2024-03-22T08:00:00.000Z',
    photos: [
      {
        id: 'p-301',
        boardingHouseId: 'bh-3',
        url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
        caption: 'Clean, airy student room',
        category: 'room',
        isCover: true,
        sortOrder: 1
      },
      {
        id: 'p-302',
        boardingHouseId: 'bh-3',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        caption: 'Common courtyard and bike parking',
        category: 'common_area',
        isCover: false,
        sortOrder: 2
      }
    ],
    rooms: [
      {
        id: 'r-301',
        boardingHouseId: 'bh-3',
        name: 'Highway Solo Room (Private Bath)',
        category: 'single',
        capacity: 1,
        availableSlots: 1,
        monthlyRate: 3800,
        rateType: 'per_room',
        depositAmount: 3800,
        advanceMonths: 1,
        isAirconditioned: true,
        hasPrivateBathroom: true,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800']
      },
      {
        id: 'r-302',
        boardingHouseId: 'bh-3',
        name: 'Budget Bedspace Room',
        category: 'bedspace',
        capacity: 4,
        availableSlots: 3,
        monthlyRate: 1600,
        rateType: 'per_person',
        depositAmount: 1600,
        advanceMonths: 1,
        isAirconditioned: false,
        hasPrivateBathroom: false,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']
      }
    ],
    amenities: ['wifi', 'aircon', 'private_bathroom', 'gated', 'cctv', 'cooking_allowed', 'laundry_area']
  },
  {
    id: 'bh-4',
    ownerId: 'user-owner-2',
    ownerName: 'Ramon Hernandez (Tatay Ramon)',
    ownerPhone: '+63 945 221 9901',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    ownerVerified: true,
    name: 'St. Jude Student Residence & Bedspace',
    slug: 'st-jude-student-residence-bedspace',
    description:
      'Economical, honest boarding house situated in Purok 4 Crossing Rubber. Very popular among SEAIT Criminology and Agriculture cadets. Large laundry yard with wash sinks, wide parking for motorcycles, free water, and strong neighborhood camaraderie.',
    address: 'Purok 4, Crossing Rubber, Tupi, South Cotabato',
    purok: 'Purok 4',
    barangay: 'Crossing Rubber',
    municipality: 'Tupi',
    province: 'South Cotabato',
    latitude: 6.3685,
    longitude: 124.9255,
    distanceFromSeaitMeters: calculateDistanceToSeaitMeters(6.3685, 124.9255),
    walkingTimeMinutes: calculateWalkingTimeMinutes(calculateDistanceToSeaitMeters(6.3685, 124.9255)),
    genderPolicy: 'all',
    curfewTime: '10:00 PM',
    hasCurfew: true,
    isGated: true,
    hasCctv: false,
    hasWarden: false,
    cookingAllowed: true,
    visitorsAllowed: true,
    petsAllowed: false,
    waterIncluded: true,
    electricityIncluded: true,
    internetIncluded: true,
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    totalRooms: 14,
    availableRooms: 5,
    lowestPriceMonthly: 1200,
    highestPriceMonthly: 2800,
    ratingAverage: 4.6,
    ratingCount: 12,
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    safetyNotes: 'Fenced compound, strong perimeter lighting, clear fire emergency exit path.',
    lastAvailabilityConfirmedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    createdAt: '2024-02-05T08:00:00.000Z',
    updatedAt: '2024-03-18T08:00:00.000Z',
    photos: [
      {
        id: 'p-401',
        boardingHouseId: 'bh-4',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        caption: 'Compound grounds and student residence',
        category: 'exterior',
        isCover: true,
        sortOrder: 1
      }
    ],
    rooms: [
      {
        id: 'r-401',
        boardingHouseId: 'bh-4',
        name: 'Shared 4-Person Room',
        category: 'quad',
        capacity: 4,
        availableSlots: 4,
        monthlyRate: 1200,
        rateType: 'per_person',
        depositAmount: 1200,
        advanceMonths: 1,
        isAirconditioned: false,
        hasPrivateBathroom: false,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']
      }
    ],
    amenities: ['wifi', 'gated', 'cooking_allowed', 'laundry_area', 'drinking_water']
  },
  {
    id: 'bh-5',
    ownerId: 'user-owner-3',
    ownerName: 'Elena Torres-Yap',
    ownerPhone: '+63 919 773 4512',
    ownerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    ownerVerified: true,
    name: 'Golden Palm Dormitory for Men',
    slug: 'golden-palm-dormitory-for-men',
    description:
      'All-male boarding facility fostering camaraderie and high academic performance. Strictly quiet study hours, gym/calisthenics bar in courtyard, secure gated parking for motorcycles, and high-speed Wi-Fi.',
    address: 'Purok 7, Crossing Rubber, Tupi, South Cotabato (East boundary)',
    purok: 'Purok 7',
    barangay: 'Crossing Rubber',
    municipality: 'Tupi',
    province: 'South Cotabato',
    latitude: 6.364,
    longitude: 124.9258,
    distanceFromSeaitMeters: calculateDistanceToSeaitMeters(6.364, 124.9258),
    walkingTimeMinutes: calculateWalkingTimeMinutes(calculateDistanceToSeaitMeters(6.364, 124.9258)),
    genderPolicy: 'male_only',
    curfewTime: '10:00 PM',
    hasCurfew: true,
    isGated: true,
    hasCctv: true,
    hasWarden: true,
    cookingAllowed: true,
    visitorsAllowed: false,
    petsAllowed: false,
    waterIncluded: true,
    electricityIncluded: false,
    internetIncluded: true,
    verificationStatus: 'verified',
    availabilityStatus: 'few_slots',
    totalRooms: 6,
    availableRooms: 1,
    lowestPriceMonthly: 1400,
    highestPriceMonthly: 3200,
    ratingAverage: 4.7,
    ratingCount: 9,
    coverImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    safetyNotes: 'Strict visitor logbook, security CCTV camera covering gate and bike racks.',
    lastAvailabilityConfirmedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: '2024-02-12T08:00:00.000Z',
    updatedAt: '2024-03-15T08:00:00.000Z',
    photos: [
      {
        id: 'p-501',
        boardingHouseId: 'bh-5',
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        caption: 'Men dorm room layout',
        category: 'room',
        isCover: true,
        sortOrder: 1
      }
    ],
    rooms: [
      {
        id: 'r-501',
        boardingHouseId: 'bh-5',
        name: 'Twin Men Room',
        category: 'double',
        capacity: 2,
        availableSlots: 1,
        monthlyRate: 1800,
        rateType: 'per_person',
        depositAmount: 1800,
        advanceMonths: 1,
        isAirconditioned: false,
        hasPrivateBathroom: false,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800']
      }
    ],
    amenities: ['wifi', 'cctv', 'gated', 'cooking_allowed', 'study_area']
  },
  {
    id: 'bh-6',
    ownerId: 'user-owner-3',
    ownerName: 'Elena Torres-Yap',
    ownerPhone: '+63 919 773 4512',
    ownerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    ownerVerified: true,
    name: 'Dole Road Scholar Inn',
    slug: 'dole-road-scholar-inn',
    description:
      'Modern, tranquil studio units with private tiled bathrooms and optional split-type inverter aircon. Located along the scenic bypass road near Purok 2, offering cooler mountain air from Mt. Matutum and peaceful surroundings away from highway noise.',
    address: 'Purok 2, Crossing Rubber near Dole Bypass, Tupi, South Cotabato',
    purok: 'Purok 2',
    barangay: 'Crossing Rubber',
    municipality: 'Tupi',
    province: 'South Cotabato',
    latitude: 6.372,
    longitude: 124.918,
    distanceFromSeaitMeters: calculateDistanceToSeaitMeters(6.372, 124.918),
    walkingTimeMinutes: calculateWalkingTimeMinutes(calculateDistanceToSeaitMeters(6.372, 124.918)),
    genderPolicy: 'all',
    curfewTime: '11:00 PM',
    hasCurfew: true,
    isGated: true,
    hasCctv: true,
    hasWarden: false,
    cookingAllowed: true,
    visitorsAllowed: true,
    petsAllowed: true,
    waterIncluded: true,
    electricityIncluded: false,
    internetIncluded: true,
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    totalRooms: 8,
    availableRooms: 2,
    lowestPriceMonthly: 2200,
    highestPriceMonthly: 4500,
    ratingAverage: 4.8,
    ratingCount: 8,
    coverImage: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
    safetyNotes: 'Well lit concrete street, gated perimeter wall, 24/7 caretaker.',
    lastAvailabilityConfirmedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: '2024-02-15T08:00:00.000Z',
    updatedAt: '2024-03-24T08:00:00.000Z',
    photos: [
      {
        id: 'p-601',
        boardingHouseId: 'bh-6',
        url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
        caption: 'Studio exterior and grounds',
        category: 'exterior',
        isCover: true,
        sortOrder: 1
      }
    ],
    rooms: [
      {
        id: 'r-601',
        boardingHouseId: 'bh-6',
        name: 'Deluxe Studio Unit with Aircon',
        category: 'studio',
        capacity: 2,
        availableSlots: 2,
        monthlyRate: 4500,
        rateType: 'per_room',
        depositAmount: 4500,
        advanceMonths: 1,
        isAirconditioned: true,
        hasPrivateBathroom: true,
        hasWindow: true,
        isFurnished: true,
        photos: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800']
      }
    ],
    amenities: ['wifi', 'aircon', 'private_bathroom', 'cctv', 'gated', 'cooking_allowed', 'drinking_water']
  }
];

const initialReviews: Review[] = [
  {
    id: 'rev-1',
    boardingHouseId: 'bh-1',
    studentId: 'user-student-1',
    studentName: 'Kristine Joy Alcantara',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    studentDepartment: 'College of Computer Studies (BSIT)',
    isStayVerified: true,
    overallRating: 5.0,
    cleanlinessRating: 5.0,
    locationRating: 5.0,
    valueRating: 4.8,
    safetyRating: 5.0,
    ownerResponsivenessRating: 5.0,
    comment:
      'Super convenient for BSIT students like me who have late capstone projects! The Starlink connection is very reliable even when it rains, and walking to SEAIT takes less than 4 minutes. Nanay Rosa and the caretakers are very kind and approachable.',
    ownerReply:
      'Salamat Kristine Joy! We always make sure student study needs come first. Good luck on your thesis defense!',
    ownerRepliedAt: '2024-03-21T09:30:00.000Z',
    createdAt: '2024-03-20T14:15:00.000Z'
  },
  {
    id: 'rev-2',
    boardingHouseId: 'bh-1',
    studentId: 'user-student-2',
    studentName: 'Mark Angelo Bautista',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    studentDepartment: 'College of Criminology',
    isStayVerified: true,
    overallRating: 4.8,
    cleanlinessRating: 4.9,
    locationRating: 5.0,
    valueRating: 4.7,
    safetyRating: 5.0,
    ownerResponsivenessRating: 4.8,
    comment:
      'Tahimik at safe. Solid ang gate and CCTV. Never nagkaroon ng issue sa gamit. Best boarding house near SEAIT Crossing Rubber.',
    createdAt: '2024-03-12T11:00:00.000Z'
  }
];

const initialInquiries: Inquiry[] = [
  {
    id: 'inq-1',
    boardingHouseId: 'bh-1',
    boardingHouseName: 'Green Ville Student Dormitory',
    boardingHouseCover: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    studentId: 'user-student-1',
    studentName: 'Kristine Joy Alcantara',
    studentEmail: 'kristine.bsit@seait.edu.ph',
    studentPhone: '+63 930 112 3456',
    ownerId: 'user-owner-1',
    roomInterest: 'Single Solo Deluxe (Aircon)',
    targetMoveInDate: '2024-04-01',
    lastMessage: 'Good afternoon Nanay Rosa, is the single room still available for reservation next week?',
    lastMessageAt: '2024-03-25T10:15:00.000Z',
    status: 'responded',
    messages: [
      {
        id: 'msg-1',
        inquiryId: 'inq-1',
        senderId: 'user-student-1',
        senderName: 'Kristine Joy Alcantara',
        senderRole: 'student',
        message: 'Good afternoon Nanay Rosa, is the single room still available for reservation next week?',
        createdAt: '2024-03-25T10:15:00.000Z'
      },
      {
        id: 'msg-2',
        inquiryId: 'inq-1',
        senderId: 'user-owner-1',
        senderName: 'Rosa Mae Magbanua (Nanay Rosa)',
        senderRole: 'owner',
        message: 'Hello Kristine! Yes, we have 1 unit left on the second floor. You are welcome to view it tomorrow after 2 PM.',
        createdAt: '2024-03-25T10:45:00.000Z'
      }
    ],
    createdAt: '2024-03-25T10:15:00.000Z'
  }
];

const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-student-1',
    title: 'Nanay Rosa replied to your inquiry',
    message: 'Hello Kristine! Yes, we have 1 unit left on the second floor. You are welcome to view it tomorrow after 2 PM.',
    type: 'inquiry',
    linkUrl: '/inquiries',
    isRead: false,
    createdAt: '2024-03-25T10:45:00.000Z'
  }
];

const initialVerifications: OwnerVerification[] = [
  {
    id: 'ver-1',
    ownerId: 'user-owner-1',
    ownerName: 'Rosa Mae Magbanua (Nanay Rosa)',
    governmentIdType: 'Philippine Passport',
    governmentIdNumber: 'P8921820A',
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
    permitNumber: 'TUPI-BRGY-2024-0891',
    status: 'verified',
    adminNotes: 'Verified on-site visit by SEAIT student accommodation desk. Complete barangay clearance and valid passport.',
    submittedAt: '2024-01-21T08:00:00.000Z',
    reviewedAt: '2024-01-22T08:00:00.000Z',
    reviewedBy: 'user-admin-1'
  },
  {
    id: 'ver-2',
    ownerId: 'user-owner-2',
    ownerName: 'Ramon Hernandez (Tatay Ramon)',
    governmentIdType: 'UMID',
    governmentIdNumber: 'CRN-0111-9281729-1',
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
    permitNumber: 'TUPI-MP-2024-1102',
    status: 'verified',
    adminNotes: 'Legitimate homeowner in Purok 5 Crossing Rubber. Excellent safety compliance with fire extinguishers.',
    submittedAt: '2024-02-01T08:00:00.000Z',
    reviewedAt: '2024-02-02T08:00:00.000Z',
    reviewedBy: 'user-admin-1'
  }
];

const initialReports: PropertyReport[] = [];

const initialSystemSettings: SystemSettings = {
  seaitLatitude: 6.3648,
  seaitLongitude: 124.9222,
  defaultSearchRadiusKm: 2.0,
  maxSearchRadiusKm: 5.0,
  enableExactLocationToPublic: true,
  staleAvailabilityThresholdDays: 14
};

const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    actorId: 'user-admin-1',
    actorEmail: 'admin@seaitstay.edu.ph',
    actorRole: 'admin',
    action: 'VERIFIED_OWNER',
    entityType: 'owner_verification',
    entityId: 'ver-1',
    details: { owner: 'Rosa Mae Magbanua', status: 'verified' },
    createdAt: '2024-01-22T08:00:00.000Z'
  }
];

class MemoryStore {
  private state: StoreState;

  constructor() {
    this.state = {
      users: [...initialUsers],
      passwords: { ...initialPasswords },
      boardingHouses: [...initialBoardingHouses],
      reviews: [...initialReviews],
      inquiries: [...initialInquiries],
      notifications: [...initialNotifications],
      ownerVerifications: [...initialVerifications],
      propertyReports: [...initialReports],
      favorites: {
        'user-student-1': ['bh-1', 'bh-2']
      },
      comparisons: {
        'user-student-1': ['bh-1', 'bh-3']
      },
      systemSettings: { ...initialSystemSettings },
      auditLogs: [...initialAuditLogs]
    };
  }

  // Users
  getUsers(): User[] {
    return this.state.users;
  }

  findUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  findUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User, passwordHash: string): User {
    this.state.users.push(user);
    this.state.passwords[user.id] = passwordHash;
    return user;
  }

  getUserPasswordHash(userId: string): string | undefined {
    return this.state.passwords[userId];
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.state.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    this.state.users[index] = { ...this.state.users[index], ...updates, updatedAt: new Date().toISOString() };
    return this.state.users[index];
  }

  // Boarding Houses
  getBoardingHouses(): BoardingHouse[] {
    return this.state.boardingHouses;
  }

  findBoardingHouseById(id: string): BoardingHouse | undefined {
    return this.state.boardingHouses.find((bh) => bh.id === id || bh.slug === id);
  }

  addBoardingHouse(house: BoardingHouse): BoardingHouse {
    this.state.boardingHouses.unshift(house);
    return house;
  }

  updateBoardingHouse(id: string, updates: Partial<BoardingHouse>): BoardingHouse | undefined {
    const index = this.state.boardingHouses.findIndex((bh) => bh.id === id);
    if (index === -1) return undefined;
    this.state.boardingHouses[index] = {
      ...this.state.boardingHouses[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.state.boardingHouses[index];
  }

  deleteBoardingHouse(id: string): boolean {
    const index = this.state.boardingHouses.findIndex((bh) => bh.id === id);
    if (index === -1) return false;
    this.state.boardingHouses.splice(index, 1);
    return true;
  }

  // Reviews
  getReviews(boardingHouseId?: string): Review[] {
    if (boardingHouseId) {
      return this.state.reviews.filter((r) => r.boardingHouseId === boardingHouseId);
    }
    return this.state.reviews;
  }

  addReview(review: Review): Review {
    this.state.reviews.unshift(review);
    // recalculate house rating average
    const houseReviews = this.state.reviews.filter((r) => r.boardingHouseId === review.boardingHouseId);
    const avg = houseReviews.reduce((sum, r) => sum + r.overallRating, 0) / houseReviews.length;
    this.updateBoardingHouse(review.boardingHouseId, {
      ratingAverage: Number(avg.toFixed(1)),
      ratingCount: houseReviews.length
    });
    return review;
  }

  updateReview(id: string, updates: Partial<Review>): Review | undefined {
    const index = this.state.reviews.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    this.state.reviews[index] = { ...this.state.reviews[index], ...updates };
    return this.state.reviews[index];
  }

  // Inquiries
  getInquiries(userId: string, role: string): Inquiry[] {
    if (role === 'owner') {
      return this.state.inquiries.filter((inq) => inq.ownerId === userId);
    }
    return this.state.inquiries.filter((inq) => inq.studentId === userId);
  }

  findInquiryById(id: string): Inquiry | undefined {
    return this.state.inquiries.find((inq) => inq.id === id);
  }

  addInquiry(inquiry: Inquiry): Inquiry {
    this.state.inquiries.unshift(inquiry);
    return inquiry;
  }

  addInquiryMessage(inquiryId: string, message: { senderId: string; senderName: string; senderRole: any; message: string }): Inquiry | undefined {
    const inq = this.findInquiryById(inquiryId);
    if (!inq) return undefined;
    const newMsg = {
      id: `msg-${Date.now()}`,
      inquiryId,
      ...message,
      createdAt: new Date().toISOString()
    };
    inq.messages.push(newMsg);
    inq.lastMessage = message.message;
    inq.lastMessageAt = newMsg.createdAt;
    inq.status = 'responded';
    return inq;
  }

  // Favorites
  getFavorites(userId: string): string[] {
    return this.state.favorites[userId] || [];
  }

  toggleFavorite(userId: string, boardingHouseId: string): boolean {
    if (!this.state.favorites[userId]) {
      this.state.favorites[userId] = [];
    }
    const idx = this.state.favorites[userId].indexOf(boardingHouseId);
    if (idx > -1) {
      this.state.favorites[userId].splice(idx, 1);
      return false; // removed
    } else {
      this.state.favorites[userId].push(boardingHouseId);
      return true; // added
    }
  }

  // Comparisons
  getComparisons(userId: string): string[] {
    return this.state.comparisons[userId] || [];
  }

  setComparisons(userId: string, ids: string[]): string[] {
    this.state.comparisons[userId] = ids.slice(0, 4); // max 4
    return this.state.comparisons[userId];
  }

  // Notifications
  getNotifications(userId: string): Notification[] {
    return this.state.notifications.filter((n) => n.userId === userId);
  }

  addNotification(notif: Notification): Notification {
    this.state.notifications.unshift(notif);
    return notif;
  }

  markNotificationRead(id: string): boolean {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
  }

  // Verifications
  getOwnerVerifications(): OwnerVerification[] {
    return this.state.ownerVerifications;
  }

  findVerificationById(id: string): OwnerVerification | undefined {
    return this.state.ownerVerifications.find((v) => v.id === id);
  }

  addOwnerVerification(ver: OwnerVerification): OwnerVerification {
    this.state.ownerVerifications.unshift(ver);
    return ver;
  }

  updateOwnerVerification(id: string, updates: Partial<OwnerVerification>): OwnerVerification | undefined {
    const idx = this.state.ownerVerifications.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    this.state.ownerVerifications[idx] = { ...this.state.ownerVerifications[idx], ...updates };
    return this.state.ownerVerifications[idx];
  }

  // Property Reports
  getPropertyReports(): PropertyReport[] {
    return this.state.propertyReports;
  }

  addPropertyReport(report: PropertyReport): PropertyReport {
    this.state.propertyReports.unshift(report);
    return report;
  }

  updatePropertyReport(id: string, updates: Partial<PropertyReport>): PropertyReport | undefined {
    const idx = this.state.propertyReports.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.state.propertyReports[idx] = { ...this.state.propertyReports[idx], ...updates };
    return this.state.propertyReports[idx];
  }

  // System Settings & Audit Logs
  getSystemSettings(): SystemSettings {
    return this.state.systemSettings;
  }

  updateSystemSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.state.systemSettings = { ...this.state.systemSettings, ...updates };
    return this.state.systemSettings;
  }

  getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  addAuditLog(log: AuditLog): void {
    this.state.auditLogs.unshift(log);
  }
}

export const store = new MemoryStore();
