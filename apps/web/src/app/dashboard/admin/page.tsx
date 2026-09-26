'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  FileText,
  Clock,
  ExternalLink,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { OwnerVerification, PropertyReport, SystemSettings, AuditLog } from '@seait-stay/types';
import { api } from '../../../lib/api';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [verifications, setVerifications] = useState<OwnerVerification[]>([]);
  const [reports, setReports] = useState<PropertyReport[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'reports' | 'settings' | 'audit'>('overview');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      const [statsData, verData, repData, settsData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getVerifications(),
        api.getReports(),
        api.getSystemSettings(),
        api.getAuditLogs()
      ]);
      setStats(statsData || null);
      setVerifications(verData || []);
      setReports(repData || []);
      setSettings(settsData || null);
      setAuditLogs(logsData || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  // Approve / Reject Verification
  const handleReviewVerification = async (verId: string, status: 'verified' | 'rejected') => {
    const notes = prompt(`Enter review notes for ${status.toUpperCase()}:`) || undefined;
    try {
      await api.reviewVerification(verId, status, notes);
      setActionNotice(`Verification ${status} successfully.`);
      loadAdminData();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert('Action failed: ' + err.message);
    }
  };

  // Update Service Radius Setting
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSystemSettings(settings);
      setActionNotice('SEAIT Campus Service Radius updated successfully!');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Shield className="w-12 h-12 text-purple-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500">
          Use the role switcher in the navbar to switch to the Admin persona (Engr. Danica Flores).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 font-semibold text-xs rounded-xl shadow-xs animate-in fade-in">
          ✓ {actionNotice}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white">SEAIT Stay Administration</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold">
                Student Housing Oversight
              </span>
            </div>
            <p className="text-xs text-purple-200">
              Campus anchor: Crossing Rubber, Tupi, South Cotabato (6.3648° N, 124.9222° E)
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'verifications', label: `Verifications (${verifications.filter(v => v.status === 'pending').length})` },
            { id: 'settings', label: 'Radius Settings' },
            { id: 'audit', label: 'Audit Logs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
            <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
            <p className="text-[11px] text-slate-500">{stats.totalStudents} Students • {stats.totalOwners} Owners</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Boarding Houses</span>
            <p className="text-2xl font-black text-emerald-600">{stats.totalBoardingHouses}</p>
            <p className="text-[11px] text-emerald-700 font-semibold">{stats.verifiedBoardingHouses} Verified</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rooms & Inventory</span>
            <p className="text-2xl font-black text-slate-900">{stats.totalRooms}</p>
            <p className="text-[11px] text-slate-500">{stats.availableRooms} Available Slots</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action Needed</span>
            <p className="text-2xl font-black text-amber-600">{stats.pendingVerifications}</p>
            <p className="text-[11px] text-slate-500">Pending ID Submissions</p>
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Verifications Quick View */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Pending Owner ID Submissions</h3>
              <button
                onClick={() => setActiveTab('verifications')}
                className="text-xs font-semibold text-purple-700 hover:underline"
              >
                View All →
              </button>
            </div>

            {verifications.filter((v) => v.status === 'pending').length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending verifications</p>
            ) : (
              <div className="space-y-3">
                {verifications
                  .filter((v) => v.status === 'pending')
                  .slice(0, 3)
                  .map((ver) => (
                    <div
                      key={ver.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{ver.ownerName}</p>
                        <p className="text-slate-500 text-[11px]">
                          {ver.governmentIdType}: {ver.governmentIdNumber}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleReviewVerification(ver.id, 'verified')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewVerification(ver.id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Service Radius Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">SEAIT Geographic Scope</h3>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-xs font-semibold text-purple-700 hover:underline"
              >
                Configure →
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Campus Location:</span>
                <span className="font-bold text-slate-900">National Hwy, Purok 7, Crossing Rubber, Tupi</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Coordinates:</span>
                <span className="font-mono font-semibold text-slate-900">6.3648° N, 124.9222° E</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Default Radius:</span>
                <span className="font-bold text-emerald-700">{settings?.defaultSearchRadiusKm || 2.0} km</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Max Allowable Radius:</span>
                <span className="font-bold text-purple-700">{settings?.maxSearchRadiusKm || 5.0} km</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATIONS QUEUE */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">Owner ID Verification Requests</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review government credentials and barangay clearances before approving verified status.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {verifications.map((ver) => (
              <div key={ver.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <a
                    href={ver.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 group"
                  >
                    <img
                      src={ver.documentUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200'}
                      alt="Document"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold">
                      View
                    </div>
                  </a>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{ver.ownerName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ver.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ver.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ver.status}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      ID: {ver.governmentIdType} • {ver.governmentIdNumber}
                    </p>
                    {ver.permitNumber && (
                      <p className="text-slate-500">Permit: {ver.permitNumber}</p>
                    )}
                    {ver.adminNotes && (
                      <p className="text-emerald-800 font-medium italic">"{ver.adminNotes}"</p>
                    )}
                  </div>
                </div>

                {ver.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReviewVerification(ver.id, 'verified')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      Approve & Verify
                    </button>
                    <button
                      onClick={() => handleReviewVerification(ver.id, 'rejected')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM RADIUS CONFIGURATION */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">Geographic Radius Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly enforce geographic relevance around South East Asian Institute of Technology.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">SEAIT Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={settings.seaitLatitude}
                  onChange={(e) => setSettings({ ...settings, seaitLatitude: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SEAIT Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={settings.seaitLongitude}
                  onChange={(e) => setSettings({ ...settings, seaitLongitude: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Default Student Search Radius (km)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="5.0"
                value={settings.defaultSearchRadiusKm}
                onChange={(e) => setSettings({ ...settings, defaultSearchRadiusKm: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Maximum Allowable Listing Radius (km)
              </label>
              <input
                type="number"
                step="0.5"
                min="1.0"
                max="10.0"
                value={settings.maxSearchRadiusKm}
                onChange={(e) => setSettings({ ...settings, maxSearchRadiusKm: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Any property outside this radius cannot be submitted without admin override.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all mt-2"
            >
              Save Campus Geofence Settings
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">System Activity & Audit Trail</h2>
            <span className="text-xs font-semibold text-slate-400">{auditLogs.length} events</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-purple-700 mr-2">[{log.action}]</span>
                  <span className="font-semibold text-slate-800">{log.actorEmail}</span>
                  <span className="text-slate-400 ml-2">({log.entityType}: {log.entityId})</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
