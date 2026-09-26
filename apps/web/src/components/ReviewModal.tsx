'use client';

import React, { useState } from 'react';
import { X, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BoardingHouse } from '@seait-stay/types';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';

interface ReviewModalProps {
  property: BoardingHouse;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  property,
  isOpen,
  onClose,
  onReviewSubmitted
}: ReviewModalProps) {
  const { user } = useAuth();

  const [overallRating, setOverallRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [location, setLocation] = useState(5);
  const [value, setValue] = useState(5);
  const [safety, setSafety] = useState(5);
  const [responsiveness, setResponsiveness] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.length < 10) {
      setError('Please provide a detailed review of at least 10 characters.');
      return;
    }

    if (!user) {
      setError('You must be signed in as a student to write a review.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitReview({
        boardingHouseId: property.id,
        overallRating,
        cleanlinessRating: cleanliness,
        locationRating: location,
        valueRating: value,
        safetyRating: safety,
        ownerResponsivenessRating: responsiveness,
        comment
      });
      setSuccess(true);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarPicker = (valueVal: number, onChangeVal: (v: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChangeVal(star)}
            className="p-0.5 focus:outline-none"
          >
            <Star
              className={`w-4 h-4 ${
                star <= valueVal
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-bold text-base text-slate-900">Write a Verified Review</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-slate-900">Review Published!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thank you for helping fellow SEAIT students make informed accommodation decisions.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs">
              <div className="flex items-center space-x-2 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold">Reviewing: {property.name}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-mono">SEAIT Verified</span>
            </div>

            {/* Overall Rating Selection */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Overall Rating:</span>
              <div className="flex items-center space-x-2">
                {renderStarPicker(overallRating, setOverallRating)}
                <span className="text-xs font-bold text-slate-800">{overallRating}.0</span>
              </div>
            </div>

            {/* Criteria Breakdown Ratings */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Cleanliness:</span>
                {renderStarPicker(cleanliness, setCleanliness)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Location:</span>
                {renderStarPicker(location, setLocation)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Value for Money:</span>
                {renderStarPicker(value, setValue)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Safety & Security:</span>
                {renderStarPicker(safety, setSafety)}
              </div>
              <div className="flex items-center justify-between col-span-2">
                <span className="text-slate-600">Owner Responsiveness:</span>
                {renderStarPicker(responsiveness, setResponsiveness)}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Review & Advice for SEAIT Students
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your stay experience: noise levels, Wi-Fi speed, water pressure, walking experience to SEAIT campus..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>

            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

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
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
