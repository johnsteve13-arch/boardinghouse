import React from 'react';
import Link from 'next/link';
import { Home, ShieldCheck, MapPin, Phone, Mail, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  SEAIT<span className="text-emerald-400">Stay</span>
                </span>
                <p className="text-xs text-slate-400">Find Your Place Near SEAIT</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              The premier, verified boarding house and student accommodation finder platform dedicated
              exclusively to the campus community of South East Asian Institute of Technology (SEAIT) in
              Crossing Rubber, Tupi, South Cotabato, Philippines.
            </p>

            <div className="pt-2 text-xs space-y-1.5 text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>National Highway, Purok 7, Crossing Rubber, Tupi, South Cotabato 9505</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SEAIT Student Housing Helpdesk: (083) 228-1234</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@seaitstay.edu.ph</span>
              </div>
            </div>
          </div>

          {/* Quick Links for Students */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">For Students</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/browse" className="hover:text-emerald-400 transition-colors">
                  Explore Boarding Houses
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-emerald-400 transition-colors">
                  Interactive Campus Map
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-emerald-400 transition-colors">
                  Compare Accommodations
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-emerald-400 transition-colors">
                  Monthly Budget Calculator
                </Link>
              </li>
              <li>
                <Link href="/dashboard/student" className="hover:text-emerald-400 transition-colors">
                  Student Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links for Owners */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">For Owners</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  List Your Boarding House
                </Link>
              </li>
              <li>
                <Link href="/dashboard/owner" className="hover:text-emerald-400 transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/owner" className="hover:text-emerald-400 transition-colors">
                  Submit Verification
                </Link>
              </li>
              <li>
                <Link href="/dashboard/owner" className="hover:text-emerald-400 transition-colors">
                  Update Room Availability
                </Link>
              </li>
            </ul>
          </div>

          {/* Tupi Emergency & Safety Contacts */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Tupi Local Safety</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex justify-between">
                <span>Tupi Municipal Police:</span>
                <span className="text-white font-mono">0998-598-6729</span>
              </li>
              <li className="flex justify-between">
                <span>Bureau of Fire Protection:</span>
                <span className="text-white font-mono">0917-824-7389</span>
              </li>
              <li className="flex justify-between">
                <span>Tupi MDRRMO Rescue:</span>
                <span className="text-white font-mono">(083) 226-2580</span>
              </li>
              <li className="flex justify-between">
                <span>Barangay Crossing Rubber:</span>
                <span className="text-white font-mono">Purok 7 Hall</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SEAIT Stay. All rights reserved. Designed for South East Asian Institute of Technology students.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>in Tupi, South Cotabato</span>
            </span>
            <Link href="/dashboard/admin" className="text-slate-400 hover:text-white transition-colors">
              Admin Control Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
