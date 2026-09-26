export type UserRole = 'student' | 'owner' | 'admin';

export type GenderPolicy = 'all' | 'male_only' | 'female_only';

export type RoomCategory = 'single' | 'double' | 'quad' | 'bedspace' | 'studio';

export type AvailabilityStatus = 'available' | 'few_slots' | 'fully_occupied';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'unverified';

export type PhotoCategory = 'exterior' | 'room' | 'bathroom' | 'kitchen' | 'common_area' | 'study_area' | 'surroundings';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  studentId?: string; // For SEAIT students
  department?: string; // e.g. "College of Computer Studies", "College of Criminology"
  yearLevel?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerVerification {
  id: string;
  ownerId: string;
  ownerName: string;
  governmentIdType: string;
  governmentIdNumber: string;
  documentUrl?: string;
  permitNumber?: string;
  status: VerificationStatus;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'utilities' | 'comfort' | 'security' | 'rules' | 'connectivity';
  icon: string;
  description?: string;
}

export interface Room {
  id: string;
  boardingHouseId: string;
  name: string; // e.g. "Room 101 - Deluxe Single"
  category: RoomCategory;
  capacity: number;
  availableSlots: number;
  monthlyRate: number; // in PHP
  rateType: 'per_room' | 'per_person';
  depositAmount: number;
  advanceMonths: number;
  isAirconditioned: boolean;
  hasPrivateBathroom: boolean;
  hasWindow: boolean;
  isFurnished: boolean;
  photos: string[];
  description?: string;
}

export interface BoardingHousePhoto {
  id: string;
  boardingHouseId: string;
  url: string;
  caption?: string;
  category: PhotoCategory;
  isCover: boolean;
  sortOrder: number;
}

export interface BoardingHouse {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  ownerAvatar?: string;
  ownerVerified: boolean;
  name: string;
  slug: string;
  description: string;
  address: string;
  purok: string; // e.g. "Purok 7, Crossing Rubber"
  barangay: string; // "Crossing Rubber"
  municipality: string; // "Tupi"
  province: string; // "South Cotabato"
  latitude: number;
  longitude: number;
  distanceFromSeaitMeters: number;
  walkingTimeMinutes: number;
  genderPolicy: GenderPolicy;
  curfewTime?: string; // e.g. "10:00 PM" or "No curfew"
  hasCurfew: boolean;
  isGated: boolean;
  hasCctv: boolean;
  hasWarden: boolean;
  cookingAllowed: boolean;
  visitorsAllowed: boolean;
  petsAllowed: boolean;
  waterIncluded: boolean;
  electricityIncluded: boolean;
  internetIncluded: boolean;
  verificationStatus: VerificationStatus;
  availabilityStatus: AvailabilityStatus;
  totalRooms: number;
  availableRooms: number;
  lowestPriceMonthly: number;
  highestPriceMonthly: number;
  ratingAverage: number;
  ratingCount: number;
  coverImage: string;
  photos: BoardingHousePhoto[];
  rooms: Room[];
  amenities: string[]; // amenity IDs or names
  safetyNotes?: string;
  lastAvailabilityConfirmedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  boardingHouseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentDepartment?: string;
  isStayVerified: boolean;
  overallRating: number;
  cleanlinessRating: number;
  locationRating: number;
  valueRating: number;
  safetyRating: number;
  ownerResponsivenessRating: number;
  comment: string;
  ownerReply?: string;
  ownerRepliedAt?: string;
  createdAt: string;
}

export interface InquiryMessage {
  id: string;
  inquiryId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  boardingHouseId: string;
  boardingHouseName: string;
  boardingHouseCover: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  ownerId: string;
  roomInterest?: string;
  targetMoveInDate?: string;
  lastMessage: string;
  lastMessageAt: string;
  status: 'pending' | 'responded' | 'closed';
  messages: InquiryMessage[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'inquiry' | 'verification' | 'availability' | 'review' | 'system';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PropertyReport {
  id: string;
  boardingHouseId: string;
  reporterId: string;
  reporterName: string;
  reason: 'inaccurate_location' | 'fake_pricing' | 'unavailable_marked_available' | 'safety_hazard' | 'scam' | 'other';
  details: string;
  status: 'pending' | 'investigated' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface SystemSettings {
  seaitLatitude: number;
  seaitLongitude: number;
  defaultSearchRadiusKm: number;
  maxSearchRadiusKm: number;
  enableExactLocationToPublic: boolean;
  staleAvailabilityThresholdDays: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface SearchFilters {
  query?: string;
  radiusMeters?: number;
  minPrice?: number;
  maxPrice?: number;
  genderPolicy?: GenderPolicy | 'all';
  roomCategory?: RoomCategory;
  availability?: AvailabilityStatus;
  amenities?: string[];
  verifiedOnly?: boolean;
  sortBy?: 'distance_asc' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
}

export interface BudgetPlan {
  roomRentMonthly: number;
  electricityMonthly: number;
  waterMonthly: number;
  internetMonthly: number;
  commuteDaily: number;
  commuteDaysPerMonth: number;
  foodMonthly: number;
  laundryMonthly: number;
  miscellaneousMonthly: number;
  totalMonthly: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}
