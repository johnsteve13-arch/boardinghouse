'use client';

import React, { useState } from 'react';
import { X, Send, MessageSquare, Calendar, Home, CheckCircle2, User as UserIcon, Phone } from 'lucide-react';
import { BoardingHouse } from '@seait-stay/types';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import Link from 'next/link';

interface InquiryModalProps {
  property: BoardingHouse;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_QUESTIONS = [
  'Is there a room available for next month?',
  'What is the curfew time and visitor policy?',
  'Can I schedule a viewing this coming weekend?',
  'Is motorcycle parking secure and included?',
  'Are electricity and water included in the monthly rate?'
];

export default function InquiryModal({ property, isOpen, onClose }: InquiryModalProps) {
  const { user } = useAuth();

  const [tenantName, setTenantName] = useState(user?.fullName || '');
  const [tenantContact, setTenantContact] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [roomInterest, setRoomInterest] = useState('');
  const [targetMoveInDate, setTargetMoveInDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please type your inquiry message');
      return;
    }

    if (!user && !tenantName.trim()) {
      setError('Please enter your name so the owner knows who is reaching out.');
      return;
    }

    if (!user && !tenantContact.trim()) {
      setError('Please provide your phone number or Facebook name for the owner to respond.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createInquiry({
        boardingHouseId: property.id,
        roomInterest: roomInterest || undefined,
        targetMoveInDate: targetMoveInDate || undefined,
        initialMessage: message,
        tenantName: tenantName.trim() || undefined,
        tenantContact: tenantContact.trim() || undefined
      });

      if (res?.id) {
        setSubmittedInquiryId(res.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Direct Tenant Inquiry</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedInquiryId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-slate-900">Inquiry Sent Successfully!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your inquiry has been directly forwarded to the owner <strong className="text-slate-800">{property.ownerName}</strong>.
              They can contact you directly via <strong className="text-emerald-700">{tenantContact || 'your contact details'}</strong>.
            </p>
            <div className="pt-2 flex items-center justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Property Summary Bar */}
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={property.coverImage}
                alt={property.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="overflow-hidden text-left">
                <p className="font-bold text-xs text-slate-900 truncate">{property.name}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  Owner: {property.ownerName} • {property.purok}, Crossing Rubber
                </p>
              </div>
            </div>

            {/* Tenant Contact Information (No Registration Needed) */}
            {!user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Full Name *</label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="e.g. Maria Santos"
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone / Messenger *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={tenantContact}
                      onChange={(e) => setTenantContact(e.target.value)}
                      placeholder="+63 9XX or FB Name"
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Questions Chips */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Quick Question Suggestions:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setMessage(q)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Interest & Target Move-In Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Room Type</label>
                <select
                  value={roomInterest}
                  onChange={(e) => setRoomInterest(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Any Available Room</option>
                  {property.rooms && property.rooms.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} (₱{r.monthlyRate.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Move-in Date</label>
                <input
                  type="date"
                  value={targetMoveInDate}
                  onChange={(e) => setTargetMoveInDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Inquiry Message *</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about room availability, advance deposit, rules, or request a viewing..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>

            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center space-x-1.5 disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Send Inquiry to Owner'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
