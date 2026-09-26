'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Scale,
  X,
  Plus,
  Check,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Wifi,
  AirVent,
  UtensilsCrossed,
  Bath,
  ArrowRight
} from 'lucide-react';
import { useCompare } from '../../lib/compareContext';
import { BoardingHouse } from '@seait-stay/types';
import { api } from '../../lib/api';
import { formatCurrency, formatDistance, getAvailabilityInfo, getGenderPolicyInfo } from '../../lib/utils';

export default function ComparePage() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();

  const [properties, setProperties] = useState<BoardingHouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      if (compareIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await api.getComparison(compareIds);
        setProperties(data);
      } catch (err) {
        console.error('Failed to load comparison data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [compareIds]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading property comparison...</p>
      </div>
    );
  }

  if (properties.length < 2) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Scale className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Compare Boarding Houses</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Select at least 2 boarding houses while browsing to view a side-by-side comparison of rent,
          walking distance to SEAIT, Wi-Fi, aircon, and curfews.
        </p>
        <Link
          href="/browse"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm transition-all"
        >
          <span>Explore Boarding Houses</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const comparisonAttributes = [
    {
      category: 'Overview',
      rows: [
        {
          label: 'Monthly Rent',
          render: (p: BoardingHouse) => (
            <span className="font-extrabold text-sm text-slate-900">
              {formatCurrency(p.lowestPriceMonthly)}
              {p.lowestPriceMonthly !== p.highestPriceMonthly && ` - ${formatCurrency(p.highestPriceMonthly)}`}
            </span>
          )
        },
        {
          label: 'Distance to SEAIT',
          render: (p: BoardingHouse) => (
            <span className="font-bold text-xs text-emerald-700">
              {p.walkingTimeMinutes} min walk ({p.distanceFromSeaitMeters}m)
            </span>
          )
        },
        {
          label: 'Availability',
          render: (p: BoardingHouse) => {
            const avail = getAvailabilityInfo(p.availabilityStatus);
            return (
              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${avail.color}`}>
                {avail.label} ({p.availableRooms} slots)
              </span>
            );
          }
        },
        {
          label: 'Gender Policy',
          render: (p: BoardingHouse) => {
            const g = getGenderPolicyInfo(p.genderPolicy);
            return <span className="capitalize text-xs font-medium text-slate-800">{g.label}</span>;
          }
        },
        {
          label: 'Student Rating',
          render: (p: BoardingHouse) => (
            <div className="flex items-center space-x-1 text-xs">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-bold">{p.ratingAverage || 'New'}</span>
              <span className="text-slate-400">({p.ratingCount} reviews)</span>
            </div>
          )
        }
      ]
    },
    {
      category: 'Utilities & Connectivity',
      rows: [
        {
          label: 'High-speed Wi-Fi',
          render: (p: BoardingHouse) =>
            p.amenities.includes('wifi') ? (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                <Check className="w-4 h-4 mr-1 text-emerald-600" /> Included
              </span>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )
        },
        {
          label: 'Water Supply',
          render: (p: BoardingHouse) => (
            <span className="text-xs font-medium text-slate-800">
              {p.waterIncluded ? 'Included in Rent' : 'Submetered / Extra'}
            </span>
          )
        },
        {
          label: 'Electricity',
          render: (p: BoardingHouse) => (
            <span className="text-xs font-medium text-slate-800">
              {p.electricityIncluded ? 'Included in Rent' : 'Submetered / Tenant Share'}
            </span>
          )
        },
        {
          label: 'Cooking Allowed',
          render: (p: BoardingHouse) =>
            p.cookingAllowed ? (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                <Check className="w-4 h-4 mr-1 text-emerald-600" /> Allowed
              </span>
            ) : (
              <span className="text-xs text-rose-600">Not Allowed</span>
            )
        }
      ]
    },
    {
      category: 'Safety & House Rules',
      rows: [
        {
          label: 'Night Curfew',
          render: (p: BoardingHouse) => (
            <span className="text-xs font-medium text-slate-800">
              {p.hasCurfew ? p.curfewTime : 'No Curfew'}
            </span>
          )
        },
        {
          label: 'CCTV Security',
          render: (p: BoardingHouse) =>
            p.hasCctv ? (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                <Check className="w-4 h-4 mr-1 text-emerald-600" /> 24/7 CCTV
              </span>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )
        },
        {
          label: 'Gated Perimeter',
          render: (p: BoardingHouse) =>
            p.isGated ? (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                <Check className="w-4 h-4 mr-1 text-emerald-600" /> Gated & Locked
              </span>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )
        },
        {
          label: 'Visitor Rules',
          render: (p: BoardingHouse) => (
            <span className="text-xs font-medium text-slate-800">
              {p.visitorsAllowed ? 'Common Areas Until 6 PM' : 'Strictly Tenants Only'}
            </span>
          )
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <Scale className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Comparison Matrix</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Compare Boarding Houses ({properties.length} selected)
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={clearCompare}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
          >
            Clear All
          </button>
          <Link
            href="/browse"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm"
          >
            Add More
          </Link>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-xs">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase w-48">
                Features
              </th>
              {properties.map((prop) => (
                <th key={prop.id} className="p-4 text-left w-64 min-w-[240px] align-top">
                  <div className="relative group space-y-2">
                    <button
                      onClick={() => removeFromCompare(prop.id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-sm"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <img
                      src={prop.coverImage}
                      alt={prop.name}
                      className="w-full h-32 object-cover rounded-xl shadow-xs"
                    />
                    <Link
                      href={`/boarding-houses/${prop.slug}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-700 line-clamp-1 block"
                    >
                      {prop.name}
                    </Link>
                    <p className="text-[11px] text-slate-500 line-clamp-1">📍 {prop.purok}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {comparisonAttributes.map((section) => (
              <React.Fragment key={section.category}>
                <tr className="bg-slate-50/90">
                  <td
                    colSpan={properties.length + 1}
                    className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50/50"
                  >
                    {section.category}
                  </td>
                </tr>

                {section.rows.map((row) => (
                  <tr key={row.label} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">{row.label}</td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="px-4 py-3 text-xs">
                        {row.render(prop)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
