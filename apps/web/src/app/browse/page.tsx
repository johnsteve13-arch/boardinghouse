'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
  RotateCcw,
  Search,
  ArrowUpDown,
  Navigation,
  School,
  Maximize2,
  MapPin
} from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import FilterSidebar, { FilterState } from '../../components/FilterSidebar';
import MapView from '../../components/MapView';
import { BoardingHouse } from '@seait-stay/types';
import { api } from '../../lib/api';

function BrowseContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight') || searchParams.get('id');

  const [properties, setProperties] = useState<BoardingHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>(
    searchParams.get('view') === 'map' || Boolean(highlightId) ? 'map' : 'split'
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(highlightId);
  const [sortBy, setSortBy] = useState('distance_asc');

  // Filter state (Defaults to full 3.0 km SEAIT scope)
  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get('query') || '',
    radiusMeters: searchParams.get('radiusMeters') ? Number(searchParams.get('radiusMeters')) : 3000,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 10000,
    genderPolicy: searchParams.get('genderPolicy') || 'all',
    roomCategory: searchParams.get('roomCategory') || '',
    availability: searchParams.get('availability') || '',
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : []
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync highlightId when search params change
  useEffect(() => {
    if (highlightId) {
      setSelectedPropertyId(highlightId);
      if (searchParams.get('view') === 'map') {
        setViewMode('map');
      }
    }
  }, [highlightId, searchParams]);

  // Fetch properties whenever filters or sorting change
  useEffect(() => {
    async function fetchFilteredProperties() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          sortBy,
          radiusMeters: filters.radiusMeters
        };
        if (filters.query) params.query = filters.query;
        if (filters.minPrice > 0) params.minPrice = filters.minPrice;
        if (filters.maxPrice < 10000) params.maxPrice = filters.maxPrice;
        if (filters.genderPolicy !== 'all') params.genderPolicy = filters.genderPolicy;
        if (filters.roomCategory) params.roomCategory = filters.roomCategory;
        if (filters.availability) params.availability = filters.availability;
        if (filters.verifiedOnly) params.verifiedOnly = true;
        if (filters.amenities.length > 0) params.amenities = filters.amenities.join(',');

        const data = await api.getBoardingHouses(params);
        setProperties(data);
      } catch (err) {
        console.error('Error fetching boarding houses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredProperties();
  }, [filters, sortBy]);

  const handleResetFilters = () => {
    setFilters({
      query: '',
      radiusMeters: 3000,
      minPrice: 0,
      maxPrice: 10000,
      genderPolicy: 'all',
      roomCategory: '',
      availability: '',
      verifiedOnly: false,
      amenities: []
    });
  };

  const highlightedProp = highlightId ? properties.find((p) => p.id === highlightId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Property Map Spotlight Banner (When directed to a specific listing) */}
      {highlightedProp && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                  Direct Live Map Focus
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                  Live on 3.0 KM Map
                </span>
              </div>
              <h2 className="font-black text-base text-white tracking-tight">
                {highlightedProp.name} • {highlightedProp.purok}
              </h2>
              <p className="text-xs text-slate-300">
                ⏱️ {highlightedProp.walkingTimeMinutes} min walk ({highlightedProp.distanceFromSeaitMeters}m from SEAIT Campus Gate)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Interactive Map
            </button>
            <Link
              href={`/boarding-houses/${highlightedProp.slug}`}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-sm transition-all"
            >
              Public Listing &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Search Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search query input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            placeholder="Search boarding house name or purok..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* View Switcher & Sorting */}
        <div className="flex items-center space-x-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="distance_asc">Nearest to SEAIT</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="newest">Newest Listed</option>
            </select>
          </div>

          {/* View Mode Toggle: Split / Grid / Map */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`hidden md:inline-flex px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'split' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Side-by-side Split View"
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                viewMode === 'map' ? 'bg-white shadow-xs text-emerald-800' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Interactive 3km Map View"
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Map (3km)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Filters */}
        <div className={`w-full lg:w-72 shrink-0 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            totalResults={properties.length}
          />
        </div>

        {/* Listings and Map Area */}
        <div className="flex-1 w-full">
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Property List (7 cols) */}
              <div className="xl:col-span-7 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-200">
                  <span>
                    Found <strong className="text-slate-900">{properties.length}</strong> boarding houses near SEAIT
                  </span>
                  <span>Radius: {filters.radiusMeters >= 1000 ? `${filters.radiusMeters / 1000}km` : `${filters.radiusMeters}m`}</span>
                </div>

                {/* Mobile & Tablet Interactive Map Card (Always visible on screens < xl) */}
                <div className="xl:hidden w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-card relative">
                  <div className="absolute top-3 right-3 z-[1001]">
                    <button
                      onClick={() => setViewMode('map')}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 hover:bg-slate-800 transition-all border border-slate-700/60"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Full Map</span>
                    </button>
                  </div>
                  <MapView
                    properties={properties}
                    selectedPropertyId={selectedPropertyId}
                    onSelectProperty={(prop) => setSelectedPropertyId(prop.id)}
                    radiusMeters={filters.radiusMeters}
                    onRadiusChange={(r) => setFilters((prev) => ({ ...prev, radiusMeters: r }))}
                    className="h-full w-full"
                  />
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                    <School className="w-12 h-12 text-emerald-600/40 mx-auto" />
                    <h3 className="font-bold text-base text-slate-900">No boarding houses found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No boarding houses match your active filters. Try expanding your search radius or clearing price limits.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {properties.map((prop) => (
                      <div
                        key={prop.id}
                        onMouseEnter={() => setSelectedPropertyId(prop.id)}
                        className={`transition-all duration-200 rounded-2xl ${
                          selectedPropertyId === prop.id ? 'ring-2 ring-emerald-500 shadow-elevated' : ''
                        }`}
                      >
                        <PropertyCard property={prop} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Interactive Map (5 cols) */}
              <div className="xl:col-span-5 h-[680px] sticky top-24 hidden xl:flex flex-col space-y-2">
                <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-700">
                  <span className="flex items-center space-x-1.5 text-emerald-700">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Live 3.0 km Map View</span>
                  </span>
                  <button
                    onClick={() => setViewMode('map')}
                    className="text-[11px] text-slate-500 hover:text-emerald-700 flex items-center space-x-1 transition-colors"
                  >
                    <span>Expand Full Map</span>
                    <MapIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <MapView
                    properties={properties}
                    selectedPropertyId={selectedPropertyId}
                    onSelectProperty={(prop) => setSelectedPropertyId(prop.id)}
                    radiusMeters={filters.radiusMeters}
                    onRadiusChange={(r) => setFilters((prev) => ({ ...prev, radiusMeters: r }))}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {viewMode === 'grid' && (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                  <h3 className="font-bold text-base text-slate-900">No boarding houses match your filters</h3>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((prop) => (
                    <PropertyCard key={prop.id} property={prop} />
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode === 'map' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <span>
                  Interactive 3.0 km SEAIT Radius Map • <strong className="text-emerald-700">{properties.length}</strong> boarding houses within scope
                </span>
                <button
                  onClick={() => setViewMode('split')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Switch to List View
                </button>
              </div>
              <div className="h-[calc(100vh-220px)] min-h-[580px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-elevated">
                <MapView
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  onSelectProperty={(prop) => setSelectedPropertyId(prop.id)}
                  radiusMeters={filters.radiusMeters}
                  onRadiusChange={(r) => setFilters((prev) => ({ ...prev, radiusMeters: r }))}
                  className="h-full w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Map Toggle Pill (Always accessible on mobile / tablet) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden pointer-events-auto">
        <button
          onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
          className="px-5 py-3 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-2xl flex items-center space-x-2 border border-slate-700/80 backdrop-blur-md hover:bg-slate-800 active:scale-95 transition-all"
        >
          {viewMode === 'map' ? (
            <>
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span>Show Listings List</span>
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span>Show 3km Map ({properties.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading search...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
