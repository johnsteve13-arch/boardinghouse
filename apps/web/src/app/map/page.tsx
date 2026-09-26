'use client';

import React, { useState, useEffect } from 'react';
import MapView from '../../components/MapView';
import PropertyCard from '../../components/PropertyCard';
import { BoardingHouse } from '@seait-stay/types';
import { api } from '../../lib/api';
import { Compass, School, SlidersHorizontal, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function CampusMapPage() {
  const [properties, setProperties] = useState<BoardingHouse[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<BoardingHouse | null>(null);
  const [radiusMeters, setRadiusMeters] = useState(2000);
  const [genderFilter, setGenderFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getBoardingHouses();
        setProperties(data);
      } catch (err) {
        console.error('Failed to load map properties:', err);
      }
    }
    load();
  }, []);

  const filteredProperties = properties.filter((p) => {
    if (p.distanceFromSeaitMeters > radiusMeters) return false;
    if (genderFilter !== 'all' && p.genderPolicy !== genderFilter && p.genderPolicy !== 'all') {
      return false;
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col relative overflow-hidden bg-slate-100">
      {/* Top Map Control Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <School className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 leading-tight">
              SEAIT Campus Interactive Map
            </h1>
            <p className="text-[11px] text-slate-500">
              Crossing Rubber, Tupi, South Cotabato ({filteredProperties.length} boarding houses shown)
            </p>
          </div>
        </div>

        {/* Quick Radius and Gender Pills */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
            <span className="text-slate-500 font-medium">Radius:</span>
            {[500, 1000, 2000, 3000].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusMeters(r)}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  radiusMeters === r
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r >= 1000 ? `${r / 1000}km` : `${r}m`}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-1 bg-slate-50 border border-slate-200 p-0.5 rounded-xl">
            {[
              { id: 'all', label: 'All' },
              { id: 'female_only', label: 'Female' },
              { id: 'male_only', label: 'Male' }
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setGenderFilter(g.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  genderFilter === g.id
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <Link
            href="/browse"
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            List View
          </Link>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 relative w-full h-full">
        <MapView
          properties={filteredProperties}
          selectedPropertyId={selectedProperty?.id}
          onSelectProperty={(prop) => setSelectedProperty(prop)}
          radiusMeters={radiusMeters}
          className="h-full w-full rounded-none border-none"
        />

        {/* Selected Property Popup Card Drawer (Bottom Left) */}
        {selectedProperty && (
          <div className="absolute bottom-6 left-6 z-[1001] max-w-sm w-full animate-in slide-in-from-bottom-4 duration-200">
            <div className="relative">
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shadow-md hover:bg-slate-700"
              >
                ✕
              </button>
              <PropertyCard property={selectedProperty} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
