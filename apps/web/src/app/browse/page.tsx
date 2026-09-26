'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
  RotateCcw,
  Search,
  ArrowUpDown,
  Navigation,
  School
} from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import FilterSidebar, { FilterState } from '../../components/FilterSidebar';
import MapView from '../../components/MapView';
import { BoardingHouse } from '@seait-stay/types';
import { api } from '../../lib/api';

function BrowseContent() {
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<BoardingHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('distance_asc');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get('query') || '',
    radiusMeters: searchParams.get('radiusMeters') ? Number(searchParams.get('radiusMeters')) : 2000,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 10000,
    genderPolicy: searchParams.get('genderPolicy') || 'all',
    roomCategory: searchParams.get('roomCategory') || '',
    availability: searchParams.get('availability') || '',
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : []
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
      radiusMeters: 2000,
      minPrice: 0,
      maxPrice: 10000,
      genderPolicy: 'all',
      roomCategory: '',
      availability: '',
      verifiedOnly: false,
      amenities: []
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
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
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'split' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
              title="Split View"
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
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
              <div className="xl:col-span-5 h-[650px] sticky top-24 hidden xl:block">
                <MapView
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  onSelectProperty={(prop) => setSelectedPropertyId(prop.id)}
                  radiusMeters={filters.radiusMeters}
                  className="h-full w-full rounded-2xl"
                />
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
            <div className="h-[750px] w-full rounded-2xl overflow-hidden border border-slate-200">
              <MapView
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onSelectProperty={(prop) => setSelectedPropertyId(prop.id)}
                radiusMeters={filters.radiusMeters}
                className="h-full w-full"
              />
            </div>
          )}
        </div>
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
