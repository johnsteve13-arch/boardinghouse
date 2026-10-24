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

// Clean production data: Only primary Administrator retained
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
  }
];

// Pre-hashed "Password123!" using bcryptjs
const initialPasswords: Record<string, string> = {
  'user-admin-1': '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WVExv4v17Oaa.'
};

const initialBoardingHouses: BoardingHouse[] = [];
const initialReviews: Review[] = [];
const initialInquiries: Inquiry[] = [];
const initialNotifications: Notification[] = [];
const initialVerifications: OwnerVerification[] = [];

const initialReports: PropertyReport[] = [];

const initialSystemSettings: SystemSettings = {
  seaitLatitude: 6.3648,
  seaitLongitude: 124.9222,
  defaultSearchRadiusKm: 2.0,
  maxSearchRadiusKm: 3.0,
  enableExactLocationToPublic: true,
  staleAvailabilityThresholdDays: 14
};

const initialAuditLogs: AuditLog[] = [];

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
      favorites: {},
      comparisons: {},
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
    const cleanEmail = (email || '').trim().toLowerCase();
    return this.state.users.find((u) => (u.email || '').trim().toLowerCase() === cleanEmail);
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
