'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Heart,
  Scale,
  MessageSquare,
  Share2,
  AlertTriangle,
  Wifi,
  AirVent,
  UtensilsCrossed,
  Bath,
  CheckCircle2,
  XCircle,
  Building,
  UserCheck,
  ChevronLeft,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  Phone
} from 'lucide-react';
import { BoardingHouse, Review, Room } from '@seait-stay/types';
import { formatCurrency, formatDistance, getAvailabilityInfo, getGenderPolicyInfo } from '../../../lib/utils';
import { useCompare } from '../../../lib/compareContext';
import { useAuth } from '../../../lib/authContext';
import { api } from '../../../lib/api';
import PhotoGalleryModal from '../../../components/PhotoGalleryModal';
import InquiryModal from '../../../components/InquiryModal';
import ReviewModal from '../../../components/ReviewModal';
import MapView from '../../../components/MapView';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const propertyId = params.id as string;

  const [property, setProperty] = useState<BoardingHouse | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // Modals
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const houseData = await api.getBoardingHouseById(propertyId);
        if (houseData) {
          setProperty(houseData);
          const reviewData = await api.getReviewsForHouse(houseData.id);
          setReviews(reviewData);
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading boarding house details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Building className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Boarding House Not Found</h2>
        <p className="text-xs text-slate-500">
          The property you are looking for may have been unlisted or the URL is incorrect.
        </p>
        <Link
          href="/browse"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700"
        >
          Return to Browse
        </Link>
      </div>
    );
  }

  const compared = isInCompare(property.id);
  const availability = getAvailabilityInfo(property.availabilityStatus);
  const gender = getGenderPolicyInfo(property.genderPolicy);

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please sign in to save boarding houses to your favorites.');
      return;
    }
    try {
      const res = await api.toggleFavorite(property.id);
      if (res) {
        setIsFavorited(res.isFavorited);
      }
    } catch {
      setIsFavorited(!isFavorited);
    }
  };

  const handleReportListing = async () => {
    const reason = prompt('Please describe the issue or reason for reporting this listing:');
    if (!reason) return;
    try {
      await api.submitReport({
        boardingHouseId: property.id,
        reason: 'inaccurate_location',
        details: reason
      });
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 5000);
    } catch {
      alert('Report submitted for admin review.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Back to Search Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/browse"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Boarding Houses</span>
        </Link>

        {reportSuccess && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ✓ Report received. Thank you for keeping SEAIT Stay accurate.
          </span>
        )}
      </div>

      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {property.name}
            </h1>
            {property.verificationStatus === 'verified' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified by SEAIT Admin</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{property.address}</span>
            </span>
            <span className="flex items-center space-x-1 font-semibold text-emerald-700">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {property.walkingTimeMinutes} min walk to SEAIT ({property.distanceFromSeaitMeters}m)
              </span>
            </span>
            {property.ratingAverage > 0 && (
              <span className="flex items-center space-x-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{property.ratingAverage}</span>
                <span className="text-slate-400 font-normal">({property.ratingCount} student reviews)</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Favorite, Compare, Share, Report */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleFavoriteToggle}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isFavorited
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorited ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => (compared ? removeFromCompare(property.id) : addToCompare(property.id))}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              compared
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>{compared ? 'Comparing' : 'Compare'}</span>
          </button>

          <button
            onClick={handleReportListing}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 border border-slate-200 hover:bg-rose-50 transition-colors"
            title="Report inaccurate listing"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[350px] sm:h-[450px]">
          {/* Main Cover Image (2 cols) */}
          <div
            onClick={() => setGalleryOpen(true)}
            className="md:col-span-2 relative h-full overflow-hidden cursor-pointer group"
          >
            <img
              src={property.coverImage}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Secondary Photos (2 cols) */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 h-full">
            {property.photos.slice(1, 5).map((photo, i) => (
              <div
                key={photo.id || i}
                onClick={() => setGalleryOpen(true)}
                className="relative overflow-hidden cursor-pointer group bg-slate-200"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Boarding house photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* View All Photos Button */}
        <button
          onClick={() => setGalleryOpen(true)}
          className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold hover:bg-slate-900 shadow-md transition-all"
        >
          View all photos ({property.photos.length > 0 ? property.photos.length : 1})
        </button>
      </div>

      {/* Main Content Layout: Left Details, Right Booking / Inquire Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Status & Freshness Banner */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${availability.color}`}>
                {availability.badge}
              </span>
              <span className="text-xs text-slate-500">
                {property.availableRooms} of {property.totalRooms} rooms available
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Availability confirmed: {new Date(property.lastAvailabilityConfirmedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Overview & Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">About this Boarding House</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Room Inventory & Pricing Table (Requirement 18) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Room Types & Monthly Rates</h2>
              <span className="text-xs text-slate-500">Deposit: 1 Month Advance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{room.name}</h3>
                        <span className="text-[11px] text-slate-400 capitalize">{room.category} room</span>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-base text-slate-900">
                          {formatCurrency(room.monthlyRate)}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {room.rateType === 'per_person' ? 'per person / mo' : 'per room / mo'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-600">
                      {room.isAirconditioned && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Airconditioned
                        </span>
                      )}
                      {room.hasPrivateBathroom && (
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          Private Bath
                        </span>
                      )}
                      {room.isFurnished && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Furnished
                        </span>
                      )}
                    </div>

                    {room.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{room.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold ${
                        room.availableSlots > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {room.availableSlots > 0 ? `${room.availableSlots} slot(s) open` : 'Fully Occupied'}
                    </span>
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors"
                    >
                      Inquire Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities & Utilities (Requirement 13) */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Amenities & Living Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'wifi', label: 'Fiber / Starlink Wi-Fi', icon: Wifi, has: property.amenities.includes('wifi') },
                { id: 'aircon', label: 'Air Conditioning', icon: AirVent, has: property.amenities.includes('aircon') },
                { id: 'cooking', label: 'Cooking Permitted', icon: UtensilsCrossed, has: property.cookingAllowed },
                { id: 'cctv', label: '24/7 CCTV Cameras', icon: Lock, has: property.hasCctv },
                { id: 'gated', label: 'Gated Perimeter', icon: ShieldCheck, has: property.isGated },
                { id: 'water', label: 'Water Included', icon: CheckCircle2, has: property.waterIncluded },
                { id: 'electricity', label: 'Electricity Included', icon: CheckCircle2, has: property.electricityIncluded }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl border text-xs ${
                      item.has
                        ? 'bg-white border-slate-200 text-slate-800 font-medium'
                        : 'bg-slate-50/70 border-slate-100 text-slate-400 opacity-60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.has ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety & House Rules (Requirement 22) */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3>Safety & House Guidelines</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">Night Curfew:</span>
                <p>{property.hasCurfew ? `Gate closed at ${property.curfewTime}` : 'No strict curfew'}</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">Visitor Policy:</span>
                <p>{property.visitorsAllowed ? 'Visitors allowed in common areas until 6 PM' : 'Strictly tenants only'}</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">Emergency & Safety:</span>
                <p>{property.safetyNotes || 'CCTV surveillance, gated perimeter, fire emergency pathway.'}</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">Gender Policy:</span>
                <p className="capitalize">{property.genderPolicy.replace('_', ' ')} accommodation</p>
              </div>
            </div>
          </div>

          {/* Interactive Map & Nearby Surroundings (Requirement 14 & 26) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Location & Nearby Establishments</h2>
              <span className="text-xs font-medium text-emerald-700">
                📍 {property.purok}, {property.barangay}
              </span>
            </div>

            <div className="h-72 rounded-2xl overflow-hidden border border-slate-200">
              <MapView
                properties={[property]}
                selectedPropertyId={property.id}
                centerCoordinates={[property.latitude, property.longitude]}
                zoom={16}
                radiusMeters={property.distanceFromSeaitMeters + 200}
                className="h-full w-full"
              />
            </div>

            {/* Nearby POIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">SEAIT Campus Gate</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{property.walkingTimeMinutes} min walk</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">Crossing Eateries</p>
                <p className="text-[11px] text-slate-500 mt-0.5">2-3 mins away</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">Tricycle Terminal</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Along Highway</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">Pharmacy & Store</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Crossing Rubber</p>
              </div>
            </div>
          </div>

          {/* Student Reviews & Ratings Section (Requirement 20) */}
          <div className="space-y-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Student Reviews</h2>
                <p className="text-xs text-slate-500">
                  Reviews from verified SEAIT students who stayed at this boarding house.
                </p>
              </div>

              <button
                onClick={() => setReviewOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 shadow-xs"
              >
                Write a Review
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-slate-600">No student reviews yet for this listing.</p>
                <p className="text-[11px] text-slate-400">Be the first SEAIT tenant to leave your feedback.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={rev.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={rev.studentName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{rev.studentName}</p>
                          <p className="text-[10px] text-slate-400">
                            {rev.studentDepartment || 'SEAIT Scholar'} • {new Date(rev.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-900">{rev.overallRating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                    {/* Owner Reply */}
                    {rev.ownerReply && (
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                        <span className="font-bold text-emerald-900">Owner Response:</span>
                        <p className="text-slate-600">{rev.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Column: Inquire & Owner Contact Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Monthly Rent
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(property.lowestPriceMonthly)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {property.lowestPriceMonthly !== property.highestPriceMonthly
                    ? `- ${formatCurrency(property.highestPriceMonthly)} / mo`
                    : '/ mo'}
                </span>
              </div>
            </div>

            {/* Inquire CTA Button */}
            <button
              onClick={() => setInquiryOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Owner About Availability</span>
            </button>

            {/* Owner Info Box */}
            <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
              <img
                src={property.ownerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                alt={property.ownerName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-slate-900 truncate">{property.ownerName}</p>
                <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium mt-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Verified House Owner</span>
                </div>
              </div>
            </div>

            {/* Quick Summary Highlights */}
            <div className="space-y-2 pt-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Distance to SEAIT:</span>
                <span className="font-semibold text-slate-900">{property.distanceFromSeaitMeters}m</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Walk:</span>
                <span className="font-semibold text-slate-900">{property.walkingTimeMinutes} mins</span>
              </div>
              <div className="flex justify-between">
                <span>Gender Policy:</span>
                <span className="font-semibold text-slate-900 capitalize">{property.genderPolicy.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Water Supply:</span>
                <span className="font-semibold text-slate-900">{property.waterIncluded ? 'Included' : 'Submetered'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PhotoGalleryModal
        photos={property.photos}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />

      <InquiryModal
        property={property}
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />

      <ReviewModal
        property={property}
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onReviewSubmitted={() => {
          api.getReviewsForHouse(property.id).then((revs) => setReviews(revs));
        }}
      />
    </div>
  );
}
