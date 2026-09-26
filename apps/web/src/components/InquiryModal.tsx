'use client';

import React, { useState } from 'react';
import { X, Send, MessageSquare, Calendar, Home, CheckCircle2 } from 'lucide-react';
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
  'Is there a single room available for next month?',
  'What is the curfew time and visitor policy?',
  'Can I schedule a viewing this coming weekend?',
  'Is motorcycle parking secure and included?',
  'Are electricity and water included in the rate?'
];

export default function InquiryModal({ property, isOpen, onClose }: InquiryModalProps) {
  const { user } = useAuth();

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

    if (!user) {
      setError('Please sign in as a student to send inquiries');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createInquiry({
        boardingHouseId: property.id,
        roomInterest: roomInterest || undefined,
        targetMoveInDate: targetMoveInDate || undefined,
        initialMessage: message
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
            <h3 className="font-bold text-base text-slate-900">Inquire with Owner</h3>
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
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your inquiry has been sent to <span className="font-semibold text-slate-800">{property.ownerName}</span>.
              You will receive an in-app notification when they reply.
            </p>
            <div className="pt-2 flex items-center justify-center space-x-3">
              <Link
                href="/inquiries"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all shadow-sm"
              >
                Go to Messages Inbox
              </Link>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all"
              >
                Close
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
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-slate-900 truncate">{property.name}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  Owner: {property.ownerName} • {property.purok}
                </p>
              </div>
            </div>

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
                  {property.rooms.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} (₱{r.monthlyRate.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Move-in</label>
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about room availability, advance deposit, rules, or request a campus schedule viewing..."
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
                <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
