'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Bed,
  MessageSquare,
  AlertCircle,
  FileCheck,
  Users,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { BoardingHouse, AvailabilityStatus, Room } from '@seait-stay/types';
import { api } from '../../../lib/api';
import { formatCurrency, getAvailabilityInfo } from '../../../lib/utils';

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  const [properties, setProperties] = useState<BoardingHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'verification' | 'add_house'>('listings');

  // New House Form State
  const [newHouseName, setNewHouseName] = useState('');
  const [newHouseDesc, setNewHouseDesc] = useState('');
  const [newHouseAddress, setNewHouseAddress] = useState('');
  const [newHousePurok, setNewHousePurok] = useState('Purok 7, Crossing Rubber');
  const [newHouseLat, setNewHouseLat] = useState(6.365);
  const [newHouseLng, setNewHouseLng] = useState(124.923);
  const [newHouseGender, setNewHouseGender] = useState<'all' | 'female_only' | 'male_only'>('all');
  const [newHousePrice, setNewHousePrice] = useState(2000);
  const [newHouseCover, setNewHouseCover] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800');
  const [isSubmittingHouse, setIsSubmittingHouse] = useState(false);

  // Verification Form State
  const [idType, setIdType] = useState('Philippine Passport');
  const [idNumber, setIdNumber] = useState('');
  const [docUrl, setDocUrl] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600');
  const [permitNumber, setPermitNumber] = useState('');
  const [verSubmitted, setVerSubmitted] = useState(false);

  // Quick Notification Banner
  const [notice, setNotice] = useState<string | null>(null);

  const loadOwnerData = async () => {
    try {
      const data = await api.getMyListings();
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOwnerData();
    }
  }, [user]);

  // 1-Click Fast Availability Status Changer
  const handleUpdateAvailabilityStatus = async (houseId: string, status: AvailabilityStatus) => {
    try {
      const updated = await api.updateAvailability(houseId, status);
      if (updated) {
        setProperties((prev) => prev.map((h) => (h.id === houseId ? (updated as BoardingHouse) : h)));
        setNotice('Availability status updated and confirmed fresh!');
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err: any) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  // 1-Click "Confirm Availability Today"
  const handleConfirmToday = async (houseId: string) => {
    try {
      const updated = await api.confirmAvailability(houseId);
      if (updated) {
        setProperties((prev) => prev.map((h) => (h.id === houseId ? (updated as BoardingHouse) : h)));
        setNotice('Availability confirmed fresh as of today.');
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err: any) {
      alert('Error confirming availability');
    }
  };

  // Submit Verification Documents
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitOwnerVerification({
        governmentIdType: idType,
        governmentIdNumber: idNumber || 'ID-TUPI-2024-88',
        documentUrl: docUrl,
        permitNumber: permitNumber || 'TUPI-BRGY-2024-CLR'
      });
      setVerSubmitted(true);
      setNotice('Verification documents submitted. Admin will review within 24 hours.');
    } catch (err: any) {
      alert('Failed to submit verification: ' + err.message);
    }
  };

  // Create New House Submission
  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingHouse(true);
    try {
      const created = await api.createBoardingHouse({
        name: newHouseName,
        description: newHouseDesc,
        address: newHouseAddress,
        purok: newHousePurok,
        latitude: Number(newHouseLat),
        longitude: Number(newHouseLng),
        genderPolicy: newHouseGender,
        lowestPriceMonthly: Number(newHousePrice),
        highestPriceMonthly: Number(newHousePrice) * 1.5,
        totalRooms: 6,
        availableRooms: 2,
        coverImage: newHouseCover,
        amenities: ['wifi', 'cooking_allowed', 'drinking_water']
      });

      if (created) {
        setProperties((prev) => [created, ...prev]);
        setActiveTab('listings');
        setNotice(`Boarding house "${created.name}" created successfully!`);
        setTimeout(() => setNotice(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to list boarding house');
    } finally {
      setIsSubmittingHouse(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Owner Access Required</h2>
        <p className="text-xs text-slate-500">Sign in with an owner account to manage your boarding houses.</p>
        <Link href="/login" className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  const totalSlots = properties.reduce((sum, p) => sum + p.availableRooms, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Toast Notice */}
      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-xs rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <span>✓ {notice}</span>
          <button onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {/* Header Profile Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
            alt={user.fullName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white">{user.fullName}</h1>
              {user.isVerified ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Owner</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Boarding House Manager • Crossing Rubber, Tupi</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'listings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            My Listings ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('add_house')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'add_house'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            + Add House
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'verification'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            ID Verification
          </button>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Houses</span>
          <p className="text-2xl font-black text-slate-900">{properties.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Slots</span>
          <p className="text-2xl font-black text-emerald-600">{totalSlots} open</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verification</span>
          <p className="text-sm font-extrabold text-slate-900 mt-1">
            {user.isVerified ? '✓ Verified by Admin' : 'Submit ID Docs'}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Messages</span>
          <Link href="/inquiries" className="text-sm font-extrabold text-emerald-700 hover:underline block mt-1">
            Open Student Inbox →
          </Link>
        </div>
      </div>

      {/* TAB 1: LISTINGS MANAGEMENT */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900">Your Boarding Houses</h2>
              <p className="text-xs text-slate-500">
                Update real-time availability slots and confirm freshness so students see your listing first.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('add_house')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>List Another Property</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your properties...</div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Building className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No properties listed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your boarding house in Crossing Rubber, Tupi to start receiving student inquiries.
              </p>
              <button
                onClick={() => setActiveTab('add_house')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Add Your First Property
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {properties.map((prop) => {
                const avail = getAvailabilityInfo(prop.availabilityStatus);
                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* House Info */}
                      <div className="flex items-start space-x-4">
                        <img
                          src={prop.coverImage}
                          alt={prop.name}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-base text-slate-900">{prop.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${avail.color}`}>
                              {avail.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">📍 {prop.purok}, {prop.barangay}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold">
                            ⏱️ {prop.walkingTimeMinutes} min walk to SEAIT ({prop.distanceFromSeaitMeters}m)
                          </p>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/boarding-houses/${prop.slug}`}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                        >
                          View Public Page
                        </Link>
                      </div>
                    </div>

                    {/* Real-Time Availability Controls (Requirement 17) */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 block">
                          Instant Availability Switcher
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Last confirmed: {new Date(prop.lastAvailabilityConfirmedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleUpdateAvailabilityStatus(prop.id, 'available')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            prop.availabilityStatus === 'available'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          🟢 Available
                        </button>

                        <button
                          onClick={() => handleUpdateAvailabilityStatus(prop.id, 'few_slots')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            prop.availabilityStatus === 'few_slots'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          🟡 Few Slots
                        </button>

                        <button
                          onClick={() => handleUpdateAvailabilityStatus(prop.id, 'fully_occupied')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            prop.availabilityStatus === 'fully_occupied'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                          }`}
                        >
                          🔴 Fully Occupied
                        </button>

                        <button
                          onClick={() => handleConfirmToday(prop.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                          ✓ Confirm Today
                        </button>
                      </div>
                    </div>

                    {/* Room Inventory List */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Configured Rooms:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {prop.rooms.map((r) => (
                          <div key={r.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="flex justify-between font-bold text-slate-900">
                              <span>{r.name}</span>
                              <span className="text-emerald-700">{formatCurrency(r.monthlyRate)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {r.availableSlots} of {r.capacity} slots free
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADD BOARDING HOUSE FORM */}
      {activeTab === 'add_house' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">List New Boarding House</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Must be located within the SEAIT service radius in Crossing Rubber, Tupi, South Cotabato.
            </p>
          </div>

          <form onSubmit={handleCreateHouse} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Property Name</label>
              <input
                type="text"
                required
                value={newHouseName}
                onChange={(e) => setNewHouseName(e.target.value)}
                placeholder="e.g. Purok 7 Pine Dormitory"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description & House Rules</label>
              <textarea
                rows={3}
                required
                value={newHouseDesc}
                onChange={(e) => setNewHouseDesc(e.target.value)}
                placeholder="Describe facilities, Wi-Fi speed, study desks, quiet hours..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Purok</label>
                <select
                  value={newHousePurok}
                  onChange={(e) => setNewHousePurok(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Purok 7, Crossing Rubber">Purok 7 (Closest to SEAIT)</option>
                  <option value="Purok 6, Crossing Rubber">Purok 6, Crossing Rubber</option>
                  <option value="Purok 5, Crossing Rubber">Purok 5, National Highway</option>
                  <option value="Purok 4, Crossing Rubber">Purok 4, Crossing Rubber</option>
                  <option value="Purok 3, Crossing Rubber">Purok 3, Crossing Rubber</option>
                  <option value="Purok 2, Crossing Rubber">Purok 2, Dole Bypass</option>
                  <option value="Purok 1, Crossing Rubber">Purok 1, Crossing Rubber</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gender Policy</label>
                <select
                  value={newHouseGender}
                  onChange={(e) => setNewHouseGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">Co-ed / All Welcome</option>
                  <option value="female_only">Female Only</option>
                  <option value="male_only">Male Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Street Address</label>
              <input
                type="text"
                required
                value={newHouseAddress}
                onChange={(e) => setNewHouseAddress(e.target.value)}
                placeholder="e.g. Purok 7, Crossing Rubber, National Highway, Tupi"
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Starting Monthly Rent (₱)</label>
                <input
                  type="number"
                  required
                  value={newHousePrice}
                  onChange={(e) => setNewHousePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  required
                  value={newHouseCover}
                  onChange={(e) => setNewHouseCover(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingHouse}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
              >
                {isSubmittingHouse ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: OWNER ID VERIFICATION */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-emerald-600 mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Trust & Safety</span>
            </div>
            <h2 className="text-lg font-black text-slate-900">Owner Verification Center</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your government ID and barangay permit to earn the verified badge for all your listings.
            </p>
          </div>

          {verSubmitted || user.isVerified ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {user.isVerified ? 'You Are a Verified Owner' : 'Documents Under Review'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {user.isVerified
                  ? 'Your credentials have been checked and approved by the SEAIT Administrator. Your listings display the verified badge.'
                  : 'Your documents have been submitted to the SEAIT Student Housing Desk for review.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Government ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Philippine Passport">Philippine Passport</option>
                  <option value="UMID">Unified Multi-Purpose ID (UMID)</option>
                  <option value="Driver License">Driver's License</option>
                  <option value="PhilSys National ID">PhilSys National ID</option>
                  <option value="Voter ID">Voter's ID</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ID Number</label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. P1928374A"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document / ID Photo URL</label>
                <input
                  type="url"
                  required
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Barangay Business Clearance / Permit No. (Optional)
                </label>
                <input
                  type="text"
                  value={permitNumber}
                  onChange={(e) => setPermitNumber(e.target.value)}
                  placeholder="e.g. TUPI-BRGY-2024-CLR"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Submit Documents for Review
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
