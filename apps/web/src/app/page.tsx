'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Wifi,
  Users,
  Compass,
  Building,
  HeartHandshake,
  Navigation,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';
import BudgetCalculatorWidget from '../components/BudgetCalculatorWidget';
import { BoardingHouse } from '@seait-stay/types';
import { api } from '../lib/api';

export default function HomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<BoardingHouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(2000);
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [genderPolicy, setGenderPolicy] = useState('all');

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await api.getBoardingHouses();
        setProperties(data);
      } catch (err) {
        console.error('Failed to load boarding houses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('query', searchQuery.trim());
    if (searchRadius) params.append('radiusMeters', String(searchRadius));
    if (maxPrice) params.append('maxPrice', String(maxPrice));
    if (genderPolicy !== 'all') params.append('genderPolicy', genderPolicy);
    router.push(`/browse?${params.toString()}`);
  };

  const featuredProperties = properties.slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            {/* Campus Tag */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dedicated Exclusively to SEAIT Tupi Campus</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Find Your Place <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                Near SEAIT Campus
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Discover verified boarding houses, dormitories, and student pads within walking distance of
              South East Asian Institute of Technology in Crossing Rubber, Tupi, South Cotabato.
            </p>
          </div>

          {/* Quick Search Floating Bar */}
          <div className="mt-10 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-200/80 text-slate-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
            >
              {/* Keyword / Purok */}
              <div className="lg:col-span-4 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Location / Purok
                </label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Purok 7, Crossing Rubber"
                    className="w-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Distance from SEAIT */}
              <div className="lg:col-span-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Walk from SEAIT
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <select
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="w-full text-xs font-semibold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
                  >
                    <option value={500}>Within 500m (6 min walk)</option>
                    <option value={1000}>Within 1.0 km (12 min walk)</option>
                    <option value={2000}>Within 2.0 km (Default area)</option>
                    <option value={3000}>Within 3.0 km (Crossing)</option>
                    <option value={5000}>Within 5.0 km (Max radius)</option>
                  </select>
                </div>
              </div>

              {/* Max Monthly Budget */}
              <div className="lg:col-span-3 px-3 py-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Max Budget
                </label>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-500">₱</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Any budget"
                    className="w-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Quick Filter Tag Chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Popular near SEAIT:</span>
              <Link
                href="/browse?radiusMeters=500"
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
              >
                🚶 &lt; 500m Walking Distance
              </Link>
              <Link
                href="/browse?genderPolicy=female_only"
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
              >
                🌸 Female Dormitories
              </Link>
              <Link
                href="/browse?amenities=wifi"
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
              >
                📶 Fiber / Starlink Wi-Fi
              </Link>
              <Link
                href="/browse?maxPrice=2000"
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
              >
                💰 Under ₱2,000 / mo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED BOARDING HOUSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Campus Top Picks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Boarding Houses Near SEAIT
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verified safe accommodations with verified student reviews in Crossing Rubber, Tupi.
            </p>
          </div>

          <Link
            href="/browse"
            className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 group"
          >
            <span>View All Boarding Houses</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* 3. INTERACTIVE CAMPUS MAP PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Navigation className="w-4 h-4" />
                <span>Geographic Precision</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Explore Around SEAIT Campus on the Map
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every property is mapped with accurate walk times and distance radii from the SEAIT main entrance.
              </p>
            </div>

            <Link
              href="/map"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center space-x-1.5 self-start shadow-xs"
            >
              <span>Open Fullscreen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-200">
            <MapView properties={properties} radiusMeters={2000} />
          </div>
        </div>
      </section>

      {/* 4. WHY USE SEAIT STAY */}
      <section className="bg-emerald-50/60 border-y border-emerald-100/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why SEAIT Students Trust SEAIT Stay
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Unlike generic property sites, SEAIT Stay is purpose-built for the unique needs of
              students living in Tupi, South Cotabato.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Verified Owners & Inspections</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Owners submit government identification and barangay clearances before earning the
                Verified badge.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Accurate Walk Times</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Precise walking minutes calculated specifically to SEAIT campus gates so you never run late for 7:30 AM lectures.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Real-Time Availability</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No more travelling to Crossing Rubber only to find out rooms are full. Live availability badges updated by owners.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Zero Middleman Fees</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Students communicate directly with legit boarding house owners with no booking markups or commission charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How to Find Your SEAIT Boarding House
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Four simple steps to secure safe, affordable student accommodation in Crossing Rubber.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Search by Radius',
              desc: 'Filter boarding houses by distance from SEAIT campus, monthly budget, and gender policy.'
            },
            {
              step: '02',
              title: 'Compare Features',
              desc: 'Select up to 4 houses to compare rent, Starlink Wi-Fi, aircon, and curfews side-by-side.'
            },
            {
              step: '03',
              title: 'Inquire Directly',
              desc: 'Chat directly with the owner to ask questions, schedule a campus viewing, and confirm slots.'
            },
            {
              step: '04',
              title: 'Move In Confidently',
              desc: 'Move into verified, safe student housing with peace of mind throughout your semester.'
            }
          ].map((item, idx) => (
            <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="text-3xl font-black text-emerald-600/20 font-mono block mb-2">
                {item.step}
              </span>
              <h3 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. STUDENT BUDGET CALCULATOR SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BudgetCalculatorWidget boardingHouses={properties} />
      </section>

      {/* 7. STUDENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What SEAIT Scholars Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Verified experiences from students across colleges in South East Asian Institute of Technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Finding a boarding house with reliable Starlink Wi-Fi was critical for our BSIT capstone project. SEAIT Stay made it so easy to filter by Wi-Fi and walking distance to campus."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Kristine"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-xs text-slate-900">Kristine Joy Alcantara</p>
                <p className="text-[11px] text-slate-400">BSIT 3rd Year • SEAIT</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "As a Criminology cadet, morning physical training requires early wake up. Being just 280m from the SEAIT front gate saved me time and money on daily tricycle fares."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                alt="Mark"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-xs text-slate-900">Mark Angelo Bautista</p>
                <p className="text-[11px] text-slate-400">College of Criminology • SEAIT</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "My parents in Koronadal were worried about my safety. Seeing the verified CCTV badges and curfew policies on SEAIT Stay gave them total confidence."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
                alt="Jasmine"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-xs text-slate-900">Jasmine Nicole Tan</p>
                <p className="text-[11px] text-slate-400">College of Nursing • SEAIT</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. OWNER CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
              For Boarding House Owners in Tupi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              Own a Boarding House Near SEAIT? Reach Hundreds of Verified Students.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              List your property on SEAIT Stay, receive student inquiries directly on your phone, and manage room availability in one simple dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-lg transition-all"
            >
              List Your Boarding House
            </Link>
            <Link
              href="/dashboard/owner"
              className="px-6 py-3.5 rounded-2xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-xs border border-emerald-500/40 transition-all"
            >
              Owner Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
