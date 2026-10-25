'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Bed,
  MessageSquare,
  AlertCircle,
  FileCheck,
  Users,
  ChevronRight,
  TrendingUp,
  X,
  LogOut,
  Star,
  Trash2,
  Send,
  Filter,
  Check,
  ExternalLink,
  AlertTriangle,
  MapPin,
  Sparkles,
  MessageCircle,
  CornerDownRight,
  ArrowRight,
  Navigation,
  Compass,
  Upload,
  Image as ImageIcon,
  Camera,
  FileImage,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { BoardingHouse, AvailabilityStatus, Room, Review } from '@seait-stay/types';
import { api } from '../../../lib/api';
import { formatCurrency, getAvailabilityInfo } from '../../../lib/utils';

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  const [properties, setProperties] = useState<BoardingHouse[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'verification' | 'add_house' | 'reviews'>('listings');

  // Review Filter & Interaction State
  const [selectedReviewHouseId, setSelectedReviewHouseId] = useState<string>('all');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [isSubmittingReply, setIsSubmittingReply] = useState<Record<string, boolean>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

// Key Purok anchors in Crossing Rubber, Tupi around SEAIT
const PUROK_LOCATIONS: Record<
  string,
  {
    name: string;
    lat: number;
    lng: number;
    distance: number;
    walkingMins: number;
    desc: string;
  }
> = {
  'Purok 7, Crossing Rubber': {
    name: 'Purok 7 (Closest to SEAIT Campus Gate)',
    lat: 6.3652,
    lng: 124.9216,
    distance: 120,
    walkingMins: 2,
    desc: 'Direct SEAIT Gate access across the National Highway'
  },
  'Purok 6, Crossing Rubber': {
    name: 'Purok 6 (Crossing Rubber East & Terminal)',
    lat: 6.3665,
    lng: 124.9238,
    distance: 280,
    walkingMins: 4,
    desc: 'Near 24/7 tricycle terminal & convenience stores'
  },
  'Purok 5, Crossing Rubber': {
    name: 'Purok 5 (National Highway Junction)',
    lat: 6.3636,
    lng: 124.9208,
    distance: 240,
    walkingMins: 3,
    desc: 'National Highway corridor with express transit stop'
  },
  'Purok 4, Crossing Rubber': {
    name: 'Purok 4 (Crossing Rubber North & Chapel)',
    lat: 6.3678,
    lng: 124.9232,
    distance: 420,
    walkingMins: 5,
    desc: 'Quiet residential neighborhood behind Catholic Chapel'
  },
  'Purok 3, Crossing Rubber': {
    name: 'Purok 3 (Crossing Rubber Market & Food Hub)',
    lat: 6.3622,
    lng: 124.9192,
    distance: 510,
    walkingMins: 6,
    desc: 'Near public market, carinderias, bakeries & refillers'
  },
  'Purok 2, Crossing Rubber': {
    name: 'Purok 2 (Dole Bypass Road)',
    lat: 6.3698,
    lng: 124.9255,
    distance: 740,
    walkingMins: 9,
    desc: 'Spacious area with breeze along Dole bypass road'
  },
  'Purok 1, Crossing Rubber': {
    name: 'Purok 1 (Barangay Hall & Tanod Post)',
    lat: 6.3605,
    lng: 124.9175,
    distance: 850,
    walkingMins: 11,
    desc: 'Close to Barangay Crossing Rubber Hall and Tanod station'
  }
};

function calculateDistanceToCampus(lat: number, lng: number): number {
  const R = 6371000;
  const dLat = ((lat - 6.3648) * Math.PI) / 180;
  const dLon = ((lng - 124.9222) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((6.3648 * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

  // Property Deletion Modal State
  const [deleteModalHouse, setDeleteModalHouse] = useState<BoardingHouse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New House Form State
  const [newHouseName, setNewHouseName] = useState('');
  const [newHouseDesc, setNewHouseDesc] = useState('');
  const [newHouseAddress, setNewHouseAddress] = useState('');
  const [newHousePurok, setNewHousePurok] = useState('Purok 7, Crossing Rubber');
  const [newHouseLat, setNewHouseLat] = useState(6.3652);
  const [newHouseLng, setNewHouseLng] = useState(124.9216);
  const [justPublishedHouse, setJustPublishedHouse] = useState<BoardingHouse | null>(null);
  const [newHouseGender, setNewHouseGender] = useState<'all' | 'female_only' | 'male_only'>('all');
  const [newHousePrice, setNewHousePrice] = useState(2000);
  const [newHouseHighPrice, setNewHouseHighPrice] = useState(3500);
  const [newHouseTotalRooms, setNewHouseTotalRooms] = useState(6);
  const [newHouseAvailRooms, setNewHouseAvailRooms] = useState(2);
  const [newHouseAmenities, setNewHouseAmenities] = useState<string[]>([
    'wifi',
    'cooking_allowed',
    'drinking_water',
    'cctv_security'
  ]);
  const [newHouseCover, setNewHouseCover] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800');
  const [photoUploadMethod, setPhotoUploadMethod] = useState<'upload' | 'url' | 'presets'>('upload');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isSubmittingHouse, setIsSubmittingHouse] = useState(false);

  // Process and compress image file via canvas to high-quality lightweight JPEG (~100-250KB)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setUploadingPhoto(true);
    setPhotoFileName(file.name);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale to maximum 1280px on longest side for optimal speed & quality
        const MAX_DIM = 1280;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setNewHouseCover(optimizedDataUrl);
        } else {
          setNewHouseCover(readerEvent.target?.result as string);
        }
        setUploadingPhoto(false);
      };
      img.onerror = () => {
        alert('Could not decode image file.');
        setUploadingPhoto(false);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      alert('Failed to read file.');
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handlePurokSelect = (purokKey: string) => {
    setNewHousePurok(purokKey);
    const loc = PUROK_LOCATIONS[purokKey];
    if (loc) {
      setNewHouseLat(loc.lat);
      setNewHouseLng(loc.lng);
    }
  };

  const handleNudgeLocation = (dLat: number, dLng: number) => {
    const newLat = Number((newHouseLat + dLat).toFixed(4));
    const newLng = Number((newHouseLng + dLng).toFixed(4));
    const dist = calculateDistanceToCampus(newLat, newLng);
    if (dist <= 3000) {
      setNewHouseLat(newLat);
      setNewHouseLng(newLng);
    } else {
      alert('Location would exceed the 3.0 km SEAIT maximum service radius.');
    }
  };

  // Verification Form State
  const [idType, setIdType] = useState('Philippine Passport');
  const [idNumber, setIdNumber] = useState('');
  const [docUrl, setDocUrl] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600');
  const [permitNumber, setPermitNumber] = useState('');
  const [verSubmitted, setVerSubmitted] = useState(false);

  // Quick Notification Banner
  const [notice, setNotice] = useState<string | null>(null);

  const availableAmenitiesList = [
    { id: 'wifi', label: 'Wi-Fi / Starlink' },
    { id: 'cooking_allowed', label: 'Cooking Allowed / Kitchen' },
    { id: 'drinking_water', label: 'Free Filtered Water' },
    { id: 'cctv_security', label: '24/7 CCTV & Security' },
    { id: 'aircon', label: 'Air Conditioning' },
    { id: 'study_area', label: 'Quiet Study Lounge' },
    { id: 'generator', label: 'Generator Back-up' },
    { id: 'no_curfew', label: 'No Curfew for Working Tenants' }
  ];

  const imagePresets = [
    { label: 'Modern Dorm Exterior', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800' },
    { label: 'Cozy Compound Garden', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800' },
    { label: 'Clean Tenant Residence', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800' },
    { label: 'Townhouse Style Residence', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800' }
  ];

  const loadOwnerData = async () => {
    try {
      const [listingsData, reviewsData] = await Promise.all([
        api.getMyListings(),
        api.getOwnerReviews().catch(() => [])
      ]);
      setProperties(listingsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOwnerData();
    }
  }, [user]);

  // 1-Click Fast Availability Status Changer
  const handleUpdateAvailabilityStatus = async (houseId: string, status: AvailabilityStatus) => {
    try {
      const updated = await api.updateAvailability(houseId, status);
      if (updated) {
        setProperties((prev) => prev.map((h) => (h.id === houseId ? (updated as BoardingHouse) : h)));
        setNotice('Availability status updated and confirmed fresh!');
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err: any) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  // 1-Click "Confirm Availability Today"
  const handleConfirmToday = async (houseId: string) => {
    try {
      const updated = await api.confirmAvailability(houseId);
      if (updated) {
        setProperties((prev) => prev.map((h) => (h.id === houseId ? (updated as BoardingHouse) : h)));
        setNotice('Availability confirmed fresh as of today.');
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err: any) {
      alert('Error confirming availability');
    }
  };

  // Submit Verification Documents
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitOwnerVerification({
        governmentIdType: idType,
        governmentIdNumber: idNumber || 'ID-TUPI-2024-88',
        documentUrl: docUrl,
        permitNumber: permitNumber || 'TUPI-BRGY-2024-CLR'
      });
      setVerSubmitted(true);
      setNotice('Verification documents submitted. Admin will review within 24 hours.');
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert('Failed to submit verification: ' + err.message);
    }
  };

  // Create New House Submission
  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseName.trim()) {
      alert('Please enter a boarding house name.');
      return;
    }
    setIsSubmittingHouse(true);
    try {
      const price = Number(String(newHousePrice).replace(/[^0-9.]/g, '')) || 2000;
      const highPrice = Number(String(newHouseHighPrice).replace(/[^0-9.]/g, '')) || Math.max(price, 3500);
      const totalR = Number(newHouseTotalRooms) || 6;
      const availR = Math.min(Number(newHouseAvailRooms) || 2, totalR);

      const created = await api.createBoardingHouse({
        name: newHouseName.trim(),
        description:
          newHouseDesc.trim() ||
          'Clean, safe, and comfortable student & tenant boarding house near SEAIT campus in Crossing Rubber, Tupi.',
        address: newHouseAddress.trim() || `${newHousePurok}, Tupi, South Cotabato`,
        purok: newHousePurok || 'Purok 7, Crossing Rubber',
        latitude: Number(newHouseLat) || 6.3652,
        longitude: Number(newHouseLng) || 124.9216,
        genderPolicy: newHouseGender || 'all',
        lowestPriceMonthly: price,
        highestPriceMonthly: highPrice >= price ? highPrice : price + 1000,
        totalRooms: totalR,
        availableRooms: availR,
        coverImage: newHouseCover.trim() || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        amenities:
          newHouseAmenities.length > 0
            ? newHouseAmenities
            : ['wifi', 'cooking_allowed', 'drinking_water', 'cctv_security']
      });

      if (created) {
        setProperties((prev) => [created, ...prev]);
        setActiveTab('listings');
        setJustPublishedHouse(created);
        // Reset form
        setNewHouseName('');
        setNewHouseDesc('');
        setNewHouseAddress('');
        setNotice(`Boarding house "${created.name}" published successfully! Its location is directly live and visible on the map.`);
        setTimeout(() => setNotice(null), 6000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to list boarding house');
    } finally {
      setIsSubmittingHouse(false);
    }
  };

  // Delete / Remove Property Handler
  const handleDeleteProperty = async (houseId: string) => {
    setIsDeleting(true);
    try {
      await api.deleteBoardingHouse(houseId);
      setProperties((prev) => prev.filter((h) => h.id !== houseId));
      setDeleteModalHouse(null);
      setNotice('Boarding house listing removed permanently.');
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete boarding house');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle amenity selection
  const toggleAmenity = (amenityId: string) => {
    setNewHouseAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  // Reply to Tenant Review Handler
  const handleReplySubmit = async (reviewId: string) => {
    const text = replyTextMap[reviewId]?.trim();
    if (!text) return;
    setIsSubmittingReply((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const updated = await api.replyToReview(reviewId, text);
      if (updated) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
        setEditingReplyId(null);
        setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
        setNotice('Reply posted to tenant review.');
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit reply');
    } finally {
      setIsSubmittingReply((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <Building className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Owner Access Required</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Sign in or create an owner account to list and manage your boarding houses in Crossing Rubber, Tupi.
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <Link href="/login/owner" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-700 transition-colors">
            Owner Sign In
          </Link>
          <Link href="/register" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors">
            Register as Owner
          </Link>
        </div>
      </div>
    );
  }

  const totalSlots = properties.reduce((sum, p) => sum + p.availableRooms, 0);
  const avgRating = properties.length > 0
    ? (properties.reduce((sum, p) => sum + (p.ratingAverage || 0), 0) / properties.length).toFixed(1)
    : '5.0';

  const displayedReviews = selectedReviewHouseId === 'all'
    ? reviews
    : reviews.filter((r) => r.boardingHouseId === selectedReviewHouseId);

  const calcCategoryAvg = (field: keyof Review) => {
    if (displayedReviews.length === 0) return '5.0';
    const sum = displayedReviews.reduce((acc, r) => acc + (typeof r[field] === 'number' ? (r[field] as number) : 5), 0);
    return (sum / displayedReviews.length).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Toast Notice */}
      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold text-xs rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </span>
          <button onClick={() => setNotice(null)} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Profile Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
            alt={user.fullName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shrink-0 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white">{user.fullName}</h1>
              {user.isVerified ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Owner</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Boarding House Manager • Crossing Rubber, Tupi, South Cotabato</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'listings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            My Listings ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('add_house')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              activeTab === 'add_house'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add House</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              activeTab === 'reviews'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Ratings & Reviews</span>
            {reviews.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-extrabold">
                {reviews.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'verification'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            ID Verification
          </button>
          <Link
            href="/logout"
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold backdrop-blur-md transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Houses</span>
          <p className="text-2xl font-black text-slate-900">{properties.length}</p>
          <p className="text-[11px] text-slate-500">Crossing Rubber, Tupi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Slots</span>
          <p className="text-2xl font-black text-emerald-600">{totalSlots} open</p>
          <p className="text-[11px] text-slate-500">Ready for SEAIT tenants</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-amber-300 transition-all" onClick={() => setActiveTab('reviews')}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Rating</span>
            <span className="text-xs text-amber-600 font-bold">View Tab →</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <p className="text-2xl font-black text-slate-900">{avgRating}</p>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-500">{reviews.length} verified reviews</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tenant Messages</span>
          <Link href="/inquiries" className="text-sm font-extrabold text-emerald-700 hover:underline block mt-1">
            Open Tenant Inbox →
          </Link>
          <p className="text-[11px] text-slate-500">Live inquiry messenger</p>
        </div>
      </div>

      {/* TAB 1: LISTINGS MANAGEMENT */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          {/* Newly Published Property Live Map Hero Card */}
          {justPublishedHouse && (
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-500 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setJustPublishedHouse(null)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                  title="Dismiss celebration card"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black tracking-wide uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Listing Live & Directly Visible on 3km Map</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    🎉 &quot;{justPublishedHouse.name}&quot; is Now Live on the Map!
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Your boarding house pin has been anchored at <strong className="text-white">{justPublishedHouse.purok}</strong>, precisely <strong className="text-emerald-400">{justPublishedHouse.distanceFromSeaitMeters}m</strong> (~{justPublishedHouse.walkingTimeMinutes} min walk) from the SEAIT Campus Gate. Tenants browsing the map can now click your pin, view room rates, and inquire directly!
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
                    <span className="bg-white/10 px-2.5 py-1 rounded-lg">📍 {justPublishedHouse.address}</span>
                    <span className="bg-white/10 px-2.5 py-1 rounded-lg">⏱️ {justPublishedHouse.walkingTimeMinutes} mins to SEAIT</span>
                    <span className="bg-white/10 px-2.5 py-1 rounded-lg">💰 ₱{justPublishedHouse.lowestPriceMonthly.toLocaleString()} / mo</span>
                    <span className="bg-white/10 px-2.5 py-1 rounded-lg">🛏️ {justPublishedHouse.availableRooms} slots available</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <Link
                    href={`/browse?highlight=${justPublishedHouse.id}&view=map`}
                    className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
                  >
                    <MapPin className="w-4 h-4 text-slate-950" />
                    <span>View Location on Live Map</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </Link>
                  <Link
                    href={`/boarding-houses/${justPublishedHouse.slug}`}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Public Listing</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900">Your Boarding Houses</h2>
              <p className="text-xs text-slate-500">
                Manage your properties, real-time availability slots, and tenant visibility around SEAIT.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('add_house')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Boarding House</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your properties...</div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Building className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No properties listed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your boarding house in Crossing Rubber, Tupi to start receiving tenant inquiries.
              </p>
              <button
                onClick={() => setActiveTab('add_house')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700"
              >
                Add Your First Property
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {properties.map((prop) => {
                const avail = getAvailabilityInfo(prop.availabilityStatus);
                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 hover:shadow-card transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* House Info */}
                      <div className="flex items-start space-x-4">
                        <img
                          src={prop.coverImage}
                          alt={prop.name}
                          className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-xs"
                        />
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">{prop.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${avail.color}`}>
                              {avail.badge}
                            </span>
                            {/* Star Rating Badge on Card */}
                            <button
                              onClick={() => {
                                setSelectedReviewHouseId(prop.id);
                                setActiveTab('reviews');
                              }}
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center space-x-1 hover:bg-amber-100 transition-colors"
                              title="Click to view ratings & tenant reviews"
                            >
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>{prop.ratingAverage ? prop.ratingAverage.toFixed(1) : '5.0'}</span>
                              <span className="text-amber-600 font-medium">({prop.ratingCount || 0} reviews)</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">📍 {prop.purok}, {prop.barangay}, Tupi</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px]">
                            <span className="text-emerald-700 font-semibold">
                              ⏱️ {prop.walkingTimeMinutes || 4} min walk to SEAIT ({prop.distanceFromSeaitMeters || 320}m)
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 font-medium">
                              ₱{prop.lowestPriceMonthly.toLocaleString()} - ₱{prop.highestPriceMonthly.toLocaleString()} / mo
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/browse?highlight=${prop.id}&view=map`}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                          title="View this property pin on the live 3km SEAIT map"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View on Live Map</span>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedReviewHouseId(prop.id);
                            setActiveTab('reviews');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          <span>View Ratings</span>
                        </button>
                        <Link
                          href={`/boarding-houses/${prop.slug}`}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center space-x-1 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>Public Page</span>
                        </Link>
                        <button
                          onClick={() => setDeleteModalHouse(prop)}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                          title="Remove this boarding house listing"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Remove Listing</span>
                        </button>
                      </div>
                    </div>

                    {/* Real-Time Availability Controls */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 block">
                          Instant Availability Switcher
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Last confirmed: {new Date(prop.lastAvailabilityConfirmedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleUpdateAvailabilityStatus(prop.id, 'available')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            prop.availabilityStatus === 'available'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          🟢 Available
                        </button>

                        <button
                          onClick={() => handleUpdateAvailabilityStatus(prop.id, 'few_slots')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            prop.availabilityStatus === 'few_slots'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          🟡 Few Slots
                        </button>

                        <button
                          onClick={() => handleUpdateAvailabilityStatus(prop.id, 'fully_occupied')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            prop.availabilityStatus === 'fully_occupied'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                          }`}
                        >
                          🔴 Fully Occupied
                        </button>

                        <button
                          onClick={() => handleConfirmToday(prop.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                          ✓ Confirm Today
                        </button>
                      </div>
                    </div>

                    {/* Room Inventory List */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Configured Rooms:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {prop.rooms && prop.rooms.length > 0 ? (
                          prop.rooms.map((r) => (
                            <div key={r.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>{r.name}</span>
                                <span className="text-emerald-700">{formatCurrency(r.monthlyRate)}</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {r.availableSlots} of {r.capacity} slots free
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                            Standard rooms available ({prop.availableRooms} open slots)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADD BOARDING HOUSE FORM */}
      {activeTab === 'add_house' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600 mb-1">
                <Building className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">New Property Listing</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">Add Boarding House</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted for SEAIT tenants in Crossing Rubber, Tupi, South Cotabato.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('listings')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
            >
              Back to Listings
            </button>
          </div>

          <form onSubmit={handleCreateHouse} className="space-y-5 text-xs">
            {/* Property Name */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Boarding House Name *</label>
              <input
                type="text"
                required
                value={newHouseName}
                onChange={(e) => setNewHouseName(e.target.value)}
                placeholder="e.g. Purok 7 Pine Dormitory"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Description & Rules */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Description & House Rules *</label>
              <textarea
                rows={4}
                required
                value={newHouseDesc}
                onChange={(e) => setNewHouseDesc(e.target.value)}
                placeholder="Describe rooms, Wi-Fi speed, study desks, quiet hours, curfew policies, laundry area, and proximity to SEAIT gate..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Location & Map Pin Anchoring Section */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Purok Location & Map Coordinates (Crossing Rubber) *</span>
                  </label>
                  <span className="text-[11px] text-emerald-700 font-extrabold bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <span>SEAIT 3.0 KM Scope</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select your Purok to automatically anchor your pin. Once published, your boarding house location will be directly visible and clickable on the interactive map.
                </p>
              </div>

              {/* Purok Interactive Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(PUROK_LOCATIONS).map(([purokKey, loc]) => {
                  const isSelected = newHousePurok === purokKey;
                  return (
                    <button
                      type="button"
                      key={purokKey}
                      onClick={() => handlePurokSelect(purokKey)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500/30'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="font-bold">{loc.name.split(' (')[0]}</span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          ~{loc.distance}m
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 line-clamp-1">{loc.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Live Distance & Pin Fine-Tuning Bar */}
              {(() => {
                const liveDist = calculateDistanceToCampus(newHouseLat, newHouseLng);
                const liveMins = Math.max(1, Math.round(liveDist / 80));
                return (
                  <div className="pt-3 border-t border-slate-200/80 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-extrabold text-slate-800">
                          ⏱️ ~{liveMins} min walk ({liveDist}m from SEAIT Main Gate)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                        ✅ Within 3.0 KM Scope &bull; Directly Visible on Map
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
                      <span className="text-slate-600 font-mono">
                        📍 Pin: {newHouseLat.toFixed(4)}° N, {newHouseLng.toFixed(4)}° E
                      </span>
                      {/* Micro-nudge buttons */}
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-slate-400 font-medium mr-1">Fine-tune:</span>
                        <button
                          type="button"
                          onClick={() => handleNudgeLocation(0.0005, 0)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                          title="Nudge North 50m"
                        >
                          ▲ North
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeLocation(-0.0005, 0)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                          title="Nudge South 50m"
                        >
                          ▼ South
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeLocation(0, -0.0005)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                          title="Nudge West 50m"
                        >
                          ◀ West
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeLocation(0, 0.0005)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                          title="Nudge East 50m"
                        >
                          ▶ East
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Gender Policy */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Gender Policy *</label>
              <select
                value={newHouseGender}
                onChange={(e) => setNewHouseGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">Co-ed / All Welcome</option>
                <option value="female_only">Female Only (All Ladies)</option>
                <option value="male_only">Male Only</option>
              </select>
            </div>

            {/* Detailed Street Address */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Street Address & Landmark *</label>
              <input
                type="text"
                required
                value={newHouseAddress}
                onChange={(e) => setNewHouseAddress(e.target.value)}
                placeholder="e.g. Purok 7, Crossing Rubber, National Highway, Tupi, South Cotabato (Behind Chapel)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Pricing & Capacity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lowest Rent (₱/mo)</label>
                <input
                  type="number"
                  required
                  min={500}
                  step={100}
                  value={newHousePrice}
                  onChange={(e) => setNewHousePrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Highest Rent (₱/mo)</label>
                <input
                  type="number"
                  required
                  min={500}
                  step={100}
                  value={newHouseHighPrice}
                  onChange={(e) => setNewHouseHighPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Rooms</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newHouseTotalRooms}
                  onChange={(e) => setNewHouseTotalRooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Available Slots</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newHouseAvailRooms}
                  onChange={(e) => setNewHouseAvailRooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Amenities Checklist */}
            <div>
              <label className="font-bold text-slate-700 block mb-2">Amenities & Facilities Included</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableAmenitiesList.map((amenity) => {
                  const isChecked = newHouseAmenities.includes(amenity.id);
                  return (
                    <button
                      type="button"
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </span>
                      <span className="truncate">{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boarding House Photo Insertion (Device Upload, URL, or Gallery) */}
            <div className="space-y-3 p-5 bg-slate-50 border border-slate-200/90 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Boarding House Cover Photo *</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Insert a photo of your boarding house exterior or room to show on the interactive map and search results.
                  </p>
                </div>

                {/* Upload Method Switcher Tabs */}
                <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPhotoUploadMethod('upload')}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                      photoUploadMethod === 'upload'
                        ? 'bg-white text-emerald-800 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUploadMethod('url')}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                      photoUploadMethod === 'url'
                        ? 'bg-white text-emerald-800 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Web URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUploadMethod('presets')}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                      photoUploadMethod === 'presets'
                        ? 'bg-white text-emerald-800 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Presets</span>
                  </button>
                </div>
              </div>

              {/* METHOD 1: Device File Upload / Drag & Drop */}
              {photoUploadMethod === 'upload' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingPhoto(true);
                  }}
                  onDragLeave={() => setIsDraggingPhoto(false)}
                  onDrop={handlePhotoDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-white ${
                    isDraggingPhoto
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                      : 'border-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <input
                    type="file"
                    id="house-photo-file-input"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />

                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
                      {uploadingPhoto ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                      ) : (
                        <Upload className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">
                        {uploadingPhoto
                          ? 'Processing & optimizing photo...'
                          : 'Choose a photo from your computer or phone'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Drag and drop your photo here, or click to browse files (JPEG, PNG, WebP)
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="house-photo-file-input"
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Insert Photo from Device</span>
                      </label>
                    </div>

                    {photoFileName && (
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Loaded file: {photoFileName}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* METHOD 2: Web URL Input */}
              {photoUploadMethod === 'url' && (
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Paste Image Link (Unsplash, Google Drive, Direct URL)
                  </label>
                  <input
                    type="url"
                    value={newHouseCover}
                    onChange={(e) => {
                      setNewHouseCover(e.target.value);
                      setPhotoFileName(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* METHOD 3: Preset Preview Photos */}
              {photoUploadMethod === 'presets' && (
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">
                    Select a ready-to-use modern boarding house preview:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {imagePresets.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setNewHouseCover(preset.url);
                          setPhotoFileName(null);
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all ${
                          newHouseCover === preset.url
                            ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-transparent hover:border-slate-200'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-[10px] text-white p-1 truncate block font-medium">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* LIVE PHOTO PREVIEW BOX */}
              {newHouseCover && (
                <div className="bg-white rounded-2xl p-3 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-3.5 shadow-xs">
                  <img
                    src={newHouseCover}
                    alt="Cover preview"
                    className="w-full sm:w-32 h-24 object-cover rounded-xl border border-slate-200 shadow-inner shrink-0"
                  />
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Ready to Publish</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Cover Photo
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {photoFileName ? photoFileName : 'Cover photo loaded'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      This photo will appear on the SEAIT 3.0 km map popup, search cards, and details page.
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-1.5 shrink-0">
                    <label
                      htmlFor="house-photo-file-input"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors text-center"
                    >
                      Change Photo
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingHouse}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmittingHouse ? 'Publishing Property...' : 'Publish Boarding House'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RATINGS & REVIEWS PORTAL */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>Ratings & Tenant Feedback</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {reviews.length} Verified Reviews
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                View tenant evaluations across all criteria and reply as a verified property owner.
              </p>
            </div>

            {/* Filter by Property Dropdown */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedReviewHouseId}
                onChange={(e) => setSelectedReviewHouseId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Properties ({reviews.length} reviews)</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Summary Scorecard */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Big Overall Rating Score */}
            <div className="space-y-2 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-700/80 pb-6 md:pb-0 md:pr-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Overall Tenant Score
              </span>
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <span className="text-5xl font-black text-white">{avgRating}</span>
                <div className="space-y-1">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 block font-medium">out of 5.0 stars</span>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                ⭐ 100% Recommended by SEAIT tenant scholars in Crossing Rubber, Tupi
              </p>
            </div>

            {/* Category Sub-Ratings Progress Bars */}
            <div className="md:col-span-2 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block mb-1">Score Breakdown by Category</span>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-300 mb-0.5">
                    <span>Cleanliness & Sanitation</span>
                    <span className="text-emerald-400 font-bold">{calcCategoryAvg('cleanlinessRating')} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${(Number(calcCategoryAvg('cleanlinessRating')) / 5) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-300 mb-0.5">
                    <span>Proximity & Walking Distance to SEAIT</span>
                    <span className="text-emerald-400 font-bold">{calcCategoryAvg('locationRating')} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${(Number(calcCategoryAvg('locationRating')) / 5) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-300 mb-0.5">
                    <span>Value for Monthly Rent</span>
                    <span className="text-emerald-400 font-bold">{calcCategoryAvg('valueRating')} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${(Number(calcCategoryAvg('valueRating')) / 5) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-300 mb-0.5">
                    <span>Safety, CCTV & Security Gate</span>
                    <span className="text-emerald-400 font-bold">{calcCategoryAvg('safetyRating')} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${(Number(calcCategoryAvg('safetyRating')) / 5) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-300 mb-0.5">
                    <span>Owner Caretaker Responsiveness</span>
                    <span className="text-emerald-400 font-bold">{calcCategoryAvg('ownerResponsivenessRating')} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${(Number(calcCategoryAvg('ownerResponsivenessRating')) / 5) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-sm">
              Tenant Reviews ({displayedReviews.length})
            </h3>

            {displayedReviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
                <Star className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No reviews yet for this filter</h4>
                <p className="text-xs text-slate-400">
                  Reviews submitted by verified SEAIT tenants will appear here automatically.
                </p>
              </div>
            ) : (
              displayedReviews.map((rev) => {
                const targetHouse = properties.find((p) => p.id === rev.boardingHouseId);
                const isReplying = editingReplyId === rev.id;

                return (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:shadow-sm transition-shadow"
                  >
                    {/* Review Header: Tenant & Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={rev.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={rev.studentName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-900 text-sm">{rev.studentName}</h4>
                            {rev.isStayVerified && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified SEAIT Tenant</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {rev.studentDepartment || 'SEAIT Tenant'} • Reviewed {new Date(rev.createdAt).toLocaleDateString()}
                          </p>
                          {targetHouse && (
                            <span className="text-[11px] font-semibold text-emerald-700">
                              Property: {targetHouse.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stars & Numerical Rating */}
                      <div className="flex items-center space-x-2 self-start sm:self-auto bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= Math.round(rev.overallRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-extrabold text-amber-900 text-xs">
                          {rev.overallRating.toFixed(1)} / 5.0
                        </span>
                      </div>
                    </div>

                    {/* Review Comment Text */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      "{rev.comment}"
                    </p>

                    {/* Criteria Tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        Cleanliness: <strong className="text-slate-800">{rev.cleanlinessRating}★</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        Location: <strong className="text-slate-800">{rev.locationRating}★</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        Value: <strong className="text-slate-800">{rev.valueRating}★</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        Safety: <strong className="text-slate-800">{rev.safetyRating}★</strong>
                      </span>
                    </div>

                    {/* Owner Response Block */}
                    {rev.ownerReply && !isReplying ? (
                      <div className="mt-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-900 flex items-center space-x-1.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Your Response ({user.fullName})</span>
                            {rev.ownerRepliedAt && (
                              <span className="text-emerald-700/70 font-normal">
                                • {new Date(rev.ownerRepliedAt).toLocaleDateString()}
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => {
                              setEditingReplyId(rev.id);
                              setReplyTextMap((prev) => ({ ...prev, [rev.id]: rev.ownerReply || '' }));
                            }}
                            className="text-[10px] font-bold text-emerald-700 hover:underline"
                          >
                            Edit Reply
                          </button>
                        </div>
                        <p className="text-xs text-emerald-950 font-medium pl-5">{rev.ownerReply}</p>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {isReplying ? (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800 block">
                              Write response to {rev.studentName}:
                            </span>
                            <textarea
                              rows={3}
                              value={replyTextMap[rev.id] || ''}
                              onChange={(e) =>
                                setReplyTextMap((prev) => ({ ...prev, [rev.id]: e.target.value }))
                              }
                              placeholder="Thank the tenant or address their feedback directly..."
                              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setEditingReplyId(null)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isSubmittingReply[rev.id] || !replyTextMap[rev.id]?.trim()}
                                onClick={() => handleReplySubmit(rev.id)}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 disabled:opacity-50"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSubmittingReply[rev.id] ? 'Posting...' : 'Post Reply'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingReplyId(rev.id);
                              setReplyTextMap((prev) => ({ ...prev, [rev.id]: '' }));
                            }}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Reply to this tenant review →</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: OWNER ID VERIFICATION */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-emerald-600 mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Trust & Safety</span>
            </div>
            <h2 className="text-lg font-black text-slate-900">Owner Verification Center</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your government ID and barangay permit to earn the verified badge for all your listings.
            </p>
          </div>

          {verSubmitted || user.isVerified ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {user.isVerified ? 'You Are a Verified Owner' : 'Documents Under Review'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {user.isVerified
                  ? 'Your credentials have been checked and approved by the SEAIT Administrator. Your listings display the verified badge.'
                  : 'Your documents have been submitted to the SEAIT Housing Desk for review.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Government ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Philippine Passport">Philippine Passport</option>
                  <option value="UMID">Unified Multi-Purpose ID (UMID)</option>
                  <option value="Driver License">Driver's License</option>
                  <option value="PhilSys National ID">PhilSys National ID</option>
                  <option value="Voter ID">Voter's ID</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ID Number</label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. P1928374A"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document / ID Photo URL</label>
                <input
                  type="url"
                  required
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Barangay Business Clearance / Permit No. (Optional)
                </label>
                <input
                  type="text"
                  value={permitNumber}
                  onChange={(e) => setPermitNumber(e.target.value)}
                  placeholder="e.g. TUPI-BRGY-2024-CLR"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Submit Documents for Review
              </button>
            </form>
          )}
        </div>
      )}

      {/* MODAL: CONFIRM BOARDING HOUSE REMOVAL */}
      {deleteModalHouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setDeleteModalHouse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">Remove Boarding House Listing?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900 font-bold">{deleteModalHouse.name}</strong>?
                This will permanently delist the property and remove all associated room slots from the SEAIT tenant directory.
              </p>
            </div>

            {/* Property Preview Pill */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-3">
              <img
                src={deleteModalHouse.coverImage}
                alt={deleteModalHouse.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-bold text-slate-900 truncate">{deleteModalHouse.name}</p>
                <p className="text-slate-500 text-[11px] truncate">📍 {deleteModalHouse.purok}, Crossing Rubber</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalHouse(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Keep Listing
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProperty(deleteModalHouse.id)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Removing...' : 'Confirm Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
