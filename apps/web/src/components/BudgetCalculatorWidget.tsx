'use client';

import React, { useState } from 'react';
import { Calculator, Sparkles, Building, Info, ArrowRight } from 'lucide-react';
import { BoardingHouse } from '@seait-stay/types';
import { formatCurrency } from '../lib/utils';
import Link from 'next/link';

interface BudgetCalculatorWidgetProps {
  boardingHouses?: BoardingHouse[];
  initialRent?: number;
  initialWaterIncluded?: boolean;
  initialElectricityIncluded?: boolean;
  initialInternetIncluded?: boolean;
}

export default function BudgetCalculatorWidget({
  boardingHouses = [],
  initialRent = 2000,
  initialWaterIncluded = true,
  initialElectricityIncluded = false,
  initialInternetIncluded = true
}: BudgetCalculatorWidgetProps) {
  const [selectedHouseId, setSelectedHouseId] = useState<string>('');
  const [rent, setRent] = useState(initialRent);
  const [water, setWater] = useState(initialWaterIncluded ? 0 : 150);
  const [electricity, setElectricity] = useState(initialElectricityIncluded ? 0 : 350);
  const [internet, setInternet] = useState(initialInternetIncluded ? 0 : 250);
  const [dailyCommute, setDailyCommute] = useState(30); // ₱30 tricycle fare
  const [commuteDays, setCommuteDays] = useState(20); // 20 days/month
  const [food, setFood] = useState(3000); // ₱100/day
  const [laundry, setLaundry] = useState(300);

  const handleHouseSelect = (houseId: string) => {
    setSelectedHouseId(houseId);
    const house = boardingHouses.find((h) => h.id === houseId);
    if (house) {
      setRent(house.lowestPriceMonthly);
      setWater(house.waterIncluded ? 0 : 150);
      setElectricity(house.electricityIncluded ? 0 : 350);
      setInternet(house.internetIncluded ? 0 : 250);
      // If walking distance is under 600m, commute is ₱0 because students can walk!
      if (house.distanceFromSeaitMeters <= 600) {
        setDailyCommute(0);
      } else {
        setDailyCommute(25);
      }
    }
  };

  const monthlyCommute = dailyCommute * commuteDays;
  const totalMonthlyCost = rent + water + electricity + internet + monthlyCommute + food + laundry;

  const items = [
    { label: 'Room Rent', amount: rent, color: 'bg-emerald-500' },
    { label: 'Food & Meals', amount: food, color: 'bg-teal-500' },
    { label: 'Tricycle / Commute', amount: monthlyCommute, color: 'bg-blue-500' },
    { label: 'Electricity', amount: electricity, color: 'bg-amber-500' },
    { label: 'Water', amount: water, color: 'bg-cyan-500' },
    { label: 'Internet', amount: internet, color: 'bg-indigo-500' },
    { label: 'Laundry & Misc', amount: laundry, color: 'bg-purple-500' }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-elevated p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <Calculator className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Financial Planning</span>
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">
            SEAIT Student Monthly Budget Calculator
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Estimate your true total living expenses per month including rent, utilities, commute, and meals.
          </p>
        </div>

        {/* Auto-fill from Real House */}
        {boardingHouses.length > 0 && (
          <div className="sm:w-64">
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Select Boarding House to Autofill:
            </label>
            <select
              value={selectedHouseId}
              onChange={(e) => handleHouseSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="">Custom Values</option>
              {boardingHouses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} (from ₱{h.lowestPriceMonthly.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid: Inputs Left, Total Summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders / Inputs Left (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Room Rent */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
              <span>Monthly Room Rent:</span>
              <span className="font-bold text-emerald-700 font-mono">{formatCurrency(rent)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="6000"
              step="100"
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Utilities Row: Electricity, Water, Internet */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Electricity (PHP)</label>
              <input
                type="number"
                value={electricity}
                onChange={(e) => setElectricity(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Water (PHP)</label>
              <input
                type="number"
                value={water}
                onChange={(e) => setWater(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Wi-Fi (PHP)</label>
              <input
                type="number"
                value={internet}
                onChange={(e) => setInternet(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Daily Commute & Days */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Daily Tricycle / Habal Fare (₱)
              </label>
              <input
                type="number"
                value={dailyCommute}
                onChange={(e) => setDailyCommute(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
              <span className="text-[10px] text-slate-400">Set ₱0 if within walking distance</span>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Class Days per Month
              </label>
              <input
                type="number"
                value={commuteDays}
                onChange={(e) => setCommuteDays(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
              <span className="text-[10px] text-slate-400">Usually 20-22 days</span>
            </div>
          </div>

          {/* Food & Laundry */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Estimated Monthly Food (PHP)
              </label>
              <input
                type="number"
                value={food}
                onChange={(e) => setFood(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Laundry & Personal (PHP)
              </label>
              <input
                type="number"
                value={laundry}
                onChange={(e) => setLaundry(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Total Summary Card Right (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-bold">Estimated Monthly Total</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {formatCurrency(totalMonthlyCost)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Approx. ₱{Math.round(totalMonthlyCost / 30).toLocaleString()} per day
            </p>

            {/* Visual Stacked Progress Bar */}
            <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden flex my-4">
              {items.map(
                (item) =>
                  item.amount > 0 && (
                    <div
                      key={item.label}
                      style={{ width: `${(item.amount / totalMonthlyCost) * 100}%` }}
                      className={`${item.color} h-full transition-all`}
                    />
                  )
              )}
            </div>

            {/* Expense Breakdown List */}
            <div className="space-y-1.5 pt-2 text-xs">
              {items.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/60 mt-6">
            <Link
              href="/browse"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <span>Explore Boarding Houses in Budget</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
