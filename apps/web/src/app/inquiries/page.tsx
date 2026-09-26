'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Building,
  User as UserIcon,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Inquiry } from '@seait-stay/types';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';

export default function InquiriesPage() {
  const { user } = useAuth();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchInquiries = async () => {
    try {
      const data = await api.getMyInquiries();
      setInquiries(data);
      if (!selectedInquiryId && data.length > 0) {
        setSelectedInquiryId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInquiries();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedInquiryId, inquiries]);

  const activeInquiry = inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeInquiry) return;

    setSending(true);
    try {
      const updated = await api.sendInquiryMessage(activeInquiry.id, replyMessage.trim());
      if (updated) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === activeInquiry.id ? updated : inq))
        );
        setReplyMessage('');
      }
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign in to View Inquiries</h2>
        <p className="text-xs text-slate-500">
          You must be logged in as a student or owner to communicate regarding boarding house listings.
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card flex flex-col md:flex-row">
        {/* Left Column: Conversations Sidebar (w-80) */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">Inquiry Messages</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {inquiries.length} conversation{inquiries.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading messages...</div>
            ) : inquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <p>No inquiries yet.</p>
                <Link href="/browse" className="text-emerald-600 font-semibold underline">
                  Explore boarding houses
                </Link>
              </div>
            ) : (
              inquiries.map((inq) => {
                const isSelected = activeInquiry?.id === inq.id;
                const otherPartyName = user.role === 'owner' ? inq.studentName : inq.boardingHouseName;
                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-start space-x-3 ${
                      isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <img
                      src={inq.boardingHouseCover}
                      alt={inq.boardingHouseName}
                      className="w-11 h-11 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-bold text-xs text-slate-900 truncate">{otherPartyName}</p>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {new Date(inq.lastMessageAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mb-1">
                        {inq.boardingHouseName}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{inq.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Chat Canvas */}
        {activeInquiry ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center space-x-3">
                <img
                  src={activeInquiry.boardingHouseCover}
                  alt={activeInquiry.boardingHouseName}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {activeInquiry.boardingHouseName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {user.role === 'owner'
                      ? `Student: ${activeInquiry.studentName} (${activeInquiry.studentEmail})`
                      : `Inquiry with Property Owner`}
                    {activeInquiry.roomInterest && ` • Room: ${activeInquiry.roomInterest}`}
                  </p>
                </div>
              </div>

              <Link
                href={`/boarding-houses/${activeInquiry.boardingHouseId}`}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View Property
              </Link>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
              {activeInquiry.messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 font-semibold mb-1 px-1">
                      {msg.senderName} ({msg.senderRole})
                    </span>
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center space-x-2">
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your message regarding rooms, advance rent, or campus viewing..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={sending || !replyMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
            Select a conversation on the left to read messages.
          </div>
        )}
      </div>
    </div>
  );
}
