'use client';

import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  ShieldCheck,
  MapPin,
  CircleDollarSign,
  Users
} from 'lucide-react';
import { GenderPolicy, RoomCategory, AvailabilityStatus } from '@seait-stay/types';

export interface FilterState {
  query: string;
  radiusMeters: number;
  minPrice: number;
  maxPrice: number;
  genderPolicy: string;
  roomCategory: string;
  availability: string;
  verifiedOnly: boolean;
  amenities: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'Fiber / Starlink Wi-Fi' },
  { id: 'aircon', label: 'Air Conditioning' },
  { id: 'private_bathroom', label: 'Private Bathroom' },
  { id: 'cctv', label: '24/7 CCTV Security' },
  { id: 'gated', label: 'Gated Perimeter' },
  { id: 'cooking_allowed', label: 'Cooking Allowed' },
  { id: 'study_area', label: 'Quiet Study Area' },
  { id: 'drinking_water', label: 'Free Filtered Water' },
  { id: 'generator', label: 'Power Backup / Solar' },
  { id: 'laundry_area', label: 'Laundry Drying Yard' }
];

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  totalResults
}: FilterSidebarProps) {
  const handleRadiusChange = (radius: number) => {
    onChange({ ...filters, radiusMeters: radius });
  };

  const handleGenderChange = (policy: string) => {
    onChange({ ...filters, genderPolicy: policy });
  };

  const handleRoomCategoryChange = (cat: string) => {
    onChange({ ...filters, roomCategory: cat });
  };

  const handleAvailabilityChange = (avail: string) => {
    onChange({ ...filters, availability: avail });
  };

  const handleAmenityToggle = (amenityId: string) => {
    const exists = filters.amenities.includes(amenityId);
    const updated = exists
      ? filters.amenities.filter((id) => id !== amenityId)
      : [...filters.amenities, amenityId];
    onChange({ ...filters, amenities: updated });
  };

  return (
    <aside className="w-full lg:w-72 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <h2 className="font-bold text-sm text-slate-900">Search Filters</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Distance From SEAIT Campus */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Distance from SEAIT</span>
          </span>
          <span className="font-mono text-emerald-700 font-extrabold">
            {filters.radiusMeters >= 1000
              ? `${(filters.radiusMeters / 1000).toFixed(1)} km`
              : `${filters.radiusMeters} m`}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1 pt-1">
          {[500, 1000, 2000, 3000, 5000].map((radius) => (
            <button
              key={radius}
              onClick={() => handleRadiusChange(radius)}
              className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                filters.radiusMeters === radius
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Monthly Budget Range */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center space-x-1.5">
            <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Monthly Budget (PHP)</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Min
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onChange({ ...filters, minPrice: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Max
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="5000"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: '< ₱1.5k', min: 0, max: 1500 },
            { label: '₱1.5k - ₱3k', min: 1500, max: 3000 },
            { label: '₱3k+', min: 3000, max: 10000 }
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => onChange({ ...filters, minPrice: preset.min, maxPrice: preset.max })}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-medium text-slate-700"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Gender Policy */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gender Policy</span>
        </label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'all', label: 'Co-ed / All' },
            { id: 'female_only', label: 'Female' },
            { id: 'male_only', label: 'Male' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleGenderChange(item.id)}
              className={`py-1.5 px-1 text-[11px] font-medium rounded-lg border transition-all text-center ${
                filters.genderPolicy === item.id
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Room Category */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">Room Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: '', label: 'Any Room' },
            { id: 'single', label: 'Single / Solo' },
            { id: 'double', label: '2-Person Sharing' },
            { id: 'quad', label: '4-Person Quad' },
            { id: 'bedspace', label: 'Bedspace' },
            { id: 'studio', label: 'Studio' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleRoomCategoryChange(cat.id)}
              className={`py-1.5 px-2 text-[11px] rounded-lg border text-left transition-all ${
                filters.roomCategory === cat.id
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Verified Accommodation Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-semibold text-emerald-950">Verified Accommodations</span>
          </div>
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
          />
        </label>
      </div>

      {/* 6. Amenities Checklist */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">Amenities & Facilities</label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {AMENITY_OPTIONS.map((amenity) => {
            const checked = filters.amenities.includes(amenity.id);
            return (
              <label
                key={amenity.id}
                onClick={() => handleAmenityToggle(amenity.id)}
                className="flex items-center space-x-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900 py-0.5"
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    checked
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {checked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{amenity.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Footer result counter */}
      <div className="pt-3 border-t border-slate-100 text-center">
        <p className="text-xs font-semibold text-slate-500">
          Showing <span className="text-emerald-700 font-bold">{totalResults}</span> boarding houses
        </p>
      </div>
    </aside>
  );
}
