'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Scale,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  Wifi,
  AirVent,
  UtensilsCrossed,
  Bath,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { BoardingHouse } from '@seait-stay/types';
import { formatCurrency, formatDistance, getAvailabilityInfo, getGenderPolicyInfo } from '../lib/utils';
import { useCompare } from '../lib/compareContext';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';

interface PropertyCardProps {
  property: BoardingHouse;
  onFavoriteChange?: (propertyId: string, isFavorited: boolean) => void;
  isFavoritedInitial?: boolean;
}

export default function PropertyCard({
  property,
  onFavoriteChange,
  isFavoritedInitial = false
}: PropertyCardProps) {
  const { user } = useAuth();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const [isFavorited, setIsFavorited] = useState(isFavoritedInitial);
  const [isHovered, setIsHovered] = useState(false);

  const compared = isInCompare(property.id);
  const availability = getAvailabilityInfo(property.availabilityStatus);
  const gender = getGenderPolicyInfo(property.genderPolicy);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please log in as a student to save favorites.');
      return;
    }

    try {
      const res = await api.toggleFavorite(property.id);
      if (res) {
        setIsFavorited(res.isFavorited);
        if (onFavoriteChange) {
          onFavoriteChange(property.id, res.isFavorited);
        }
      }
    } catch {
      setIsFavorited(!isFavorited);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (compared) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property.id);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-card hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Property Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={property.coverImage}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges: Distance & Availability */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Walking Distance Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-sm">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{property.walkingTimeMinutes} min walk to SEAIT</span>
          </div>

          {/* Action buttons: Favorite & Compare */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleCompareClick}
              title={compared ? 'Remove from compare' : 'Add to compare'}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
                compared
                  ? 'bg-emerald-600 text-white ring-2 ring-white/50'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-emerald-600'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={handleFavoriteClick}
              title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isFavorited
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Image Badges: Gender Policy & Availability Status */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border backdrop-blur-md ${gender.badgeColor}`}
          >
            {gender.label}
          </span>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border backdrop-blur-md ${availability.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${availability.dot} mr-1.5`} />
            {availability.label}
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Header Row: Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <Link href={`/boarding-houses/${property.slug}`} className="hover:text-emerald-700 transition-colors">
              <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-600 transition-colors">
                {property.name}
              </h3>
            </Link>

            {property.ratingAverage > 0 && (
              <div className="flex items-center space-x-1 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-amber-900">{property.ratingAverage}</span>
                <span className="text-[10px] text-slate-400">({property.ratingCount})</span>
              </div>
            )}
          </div>

          {/* Location & Purok */}
          <div className="flex items-center space-x-1 text-slate-500 text-xs mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="line-clamp-1">
              {property.purok}, {property.barangay}
            </span>
          </div>

          {/* Verification Badge */}
          {property.verificationStatus === 'verified' && (
            <div className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 mt-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified SEAIT Accommodation</span>
            </div>
          )}

          {/* Key Feature Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
            {property.amenities.includes('wifi') && (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                <Wifi className="w-3 h-3 text-slate-500" />
                <span>Wi-Fi</span>
              </span>
            )}
            {property.amenities.includes('aircon') && (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                <AirVent className="w-3 h-3 text-slate-500" />
                <span>Aircon</span>
              </span>
            )}
            {property.cookingAllowed && (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                <UtensilsCrossed className="w-3 h-3 text-slate-500" />
                <span>Kitchen</span>
              </span>
            )}
            {property.hasCctv && (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>CCTV</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Row: Price & Details Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block leading-tight">Starting at</span>
            <div className="flex items-baseline space-x-1">
              <span className="font-extrabold text-base text-slate-900">
                {formatCurrency(property.lowestPriceMonthly)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">/mo</span>
            </div>
          </div>

          <Link
            href={`/boarding-houses/${property.slug}`}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
