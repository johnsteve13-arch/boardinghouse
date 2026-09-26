import {
  BoardingHouse,
  Review,
  Inquiry,
  Notification,
  OwnerVerification,
  PropertyReport,
  SystemSettings,
  AuditLog,
  User,
  ApiResponse
} from '@seait-stay/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api-backend' : 'http://localhost:4000/api');

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('seait_stay_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('seait_stay_token', token);
      } else {
        localStorage.removeItem('seait_stay_token');
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      return data;
    } catch (err: any) {
      console.warn(`[API] ${endpoint} request failed:`, err.message);
      throw err;
    }
  }

  // Auth
  async login(email: string, password: string) {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async register(data: any) {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async getMe() {
    const res = await this.request<User>('/auth/me');
    return res.data;
  }

  async updateProfile(updates: any) {
    const res = await this.request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return res.data;
  }

  logout() {
    this.setToken(null);
  }

  // Boarding Houses
  async getBoardingHouses(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const endpoint = `/boarding-houses${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await this.request<BoardingHouse[]>(endpoint);
    return res.data || [];
  }

  async getBoardingHouseById(id: string) {
    const res = await this.request<BoardingHouse>(`/boarding-houses/${id}`);
    return res.data;
  }

  async getMyListings() {
    const res = await this.request<BoardingHouse[]>('/boarding-houses/my/listings');
    return res.data || [];
  }

  async createBoardingHouse(data: any) {
    const res = await this.request<BoardingHouse>('/boarding-houses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async updateBoardingHouse(id: string, updates: any) {
    const res = await this.request<BoardingHouse>(`/boarding-houses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return res.data;
  }

  async deleteBoardingHouse(id: string) {
    return this.request(`/boarding-houses/${id}`, { method: 'DELETE' });
  }

  // Rooms
  async addRoom(boardingHouseId: string, roomData: any) {
    const res = await this.request(`/boarding-houses/${boardingHouseId}/rooms`, {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
    return res.data;
  }

  async updateRoom(boardingHouseId: string, roomId: string, roomData: any) {
    const res = await this.request(`/boarding-houses/${boardingHouseId}/rooms/${roomId}`, {
      method: 'PATCH',
      body: JSON.stringify(roomData)
    });
    return res.data;
  }

  async deleteRoom(boardingHouseId: string, roomId: string) {
    return this.request(`/boarding-houses/${boardingHouseId}/rooms/${roomId}`, {
      method: 'DELETE'
    });
  }

  // Availability
  async updateAvailability(boardingHouseId: string, status: string, availableRooms?: number) {
    const res = await this.request<BoardingHouse>(`/boarding-houses/${boardingHouseId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ availabilityStatus: status, availableRooms })
    });
    return res.data;
  }

  async confirmAvailability(boardingHouseId: string) {
    const res = await this.request<BoardingHouse>(`/boarding-houses/${boardingHouseId}/confirm-availability`, {
      method: 'POST'
    });
    return res.data;
  }

  // Reviews
  async getReviewsForHouse(boardingHouseId: string) {
    const res = await this.request<Review[]>(`/reviews/house/${boardingHouseId}`);
    return res.data || [];
  }

  async submitReview(data: any) {
    const res = await this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async replyToReview(reviewId: string, reply: string) {
    const res = await this.request<Review>(`/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply })
    });
    return res.data;
  }

  // Inquiries
  async createInquiry(data: any) {
    const res = await this.request<Inquiry>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async getMyInquiries() {
    const res = await this.request<Inquiry[]>('/inquiries');
    return res.data || [];
  }

  async getInquiryById(id: string) {
    const res = await this.request<Inquiry>(`/inquiries/${id}`);
    return res.data;
  }

  async sendInquiryMessage(inquiryId: string, message: string) {
    const res = await this.request<Inquiry>(`/inquiries/${inquiryId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return res.data;
  }

  // Comparison
  async getComparison(ids: string[]) {
    const res = await this.request<{ properties: any[] }>(`/compare?ids=${ids.join(',')}`);
    return res.data?.properties || [];
  }

  // Recommendations
  async getRecommendations(params: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request<any[]>(`/recommendations?${query}`);
    return res.data || [];
  }

  // Favorites
  async getFavorites() {
    const res = await this.request<BoardingHouse[]>('/favorites');
    return res.data || [];
  }

  async toggleFavorite(boardingHouseId: string) {
    const res = await this.request<{ isFavorited: boolean }>(`/favorites/${boardingHouseId}/toggle`, {
      method: 'POST'
    });
    return res.data;
  }

  // Notifications
  async getNotifications() {
    const res = await this.request<Notification[]>('/notifications');
    return res.data || [];
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  // Admin
  async getAdminStats() {
    const res = await this.request<any>('/admin/stats');
    return res.data;
  }

  async getAdminUsers() {
    const res = await this.request<User[]>('/admin/users');
    return res.data || [];
  }

  async getVerifications() {
    const res = await this.request<OwnerVerification[]>('/admin/verifications');
    return res.data || [];
  }

  async reviewVerification(id: string, status: 'verified' | 'rejected', adminNotes?: string) {
    const res = await this.request<OwnerVerification>(`/admin/verifications/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes })
    });
    return res.data;
  }

  async submitOwnerVerification(data: any) {
    const res = await this.request<OwnerVerification>('/admin/verifications/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async getSystemSettings() {
    const res = await this.request<SystemSettings>('/admin/settings');
    return res.data;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>) {
    const res = await this.request<SystemSettings>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
    return res.data;
  }

  async getAuditLogs() {
    const res = await this.request<AuditLog[]>('/admin/audit-logs');
    return res.data || [];
  }

  // Reports
  async submitReport(data: any) {
    const res = await this.request<PropertyReport>('/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async getReports() {
    const res = await this.request<PropertyReport[]>('/reports');
    return res.data || [];
  }
}

export const api = new ApiClient();
