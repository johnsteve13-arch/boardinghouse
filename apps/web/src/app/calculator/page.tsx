'use client';

import React, { useState, useEffect } from 'react';
import BudgetCalculatorWidget from '../../components/BudgetCalculatorWidget';
import { BoardingHouse } from '@seait-stay/types';
import { api } from '../../lib/api';
import { Calculator, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react';

export default function CalculatorPage() {
  const [properties, setProperties] = useState<BoardingHouse[]>([]);

  useEffect(() => {
    api.getBoardingHouses()
      .then((data) => setProperties(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <Calculator className="w-3.5 h-3.5" />
          <span>Student Financial Assistant</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          SEAIT Student Living Expense & Boarding Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Planning your semester budget in Crossing Rubber, Tupi? Use our dynamic calculator to estimate
          your monthly room rent, electricity share, water, commute fare, meals, and laundry.
        </p>
      </div>

      {/* Main Calculator */}
      <BudgetCalculatorWidget boardingHouses={properties} />

      {/* Helpful Local Cost Tips for SEAIT Students */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase">
            <Lightbulb className="w-4 h-4" />
            <span>Walk vs. Tricycle</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900">Walking Saves ₱600–₱800/mo</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Boarding houses within 500m of SEAIT gate allow you to walk to classes, cutting daily tricycle fares
            entirely from your monthly budget.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Water & Wi-Fi Packages</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900">Bundled Utilities Value</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Many Crossing Rubber boarding houses bundle free filtered drinking water and fiber internet,
            saving up to ₱500 per month compared to buying mineral water jugs and mobile data loads.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>Submetered Electricity</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900">Aircon vs. Fan Rooms</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Airconditioned rooms usually have individual submeters. Running an inverter unit 6 hours nightly
            typically adds approx. ₱800–₱1,200 to your monthly bill in South Cotabato.
          </p>
        </div>
      </div>
    </div>
  );
}
