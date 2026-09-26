'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BoardingHouse } from '@seait-stay/types';
import { formatCurrency, formatDistance, getAvailabilityInfo } from '../lib/utils';
import { MapPin, Navigation, School, Clock, ExternalLink } from 'lucide-react';

interface MapViewProps {
  properties: BoardingHouse[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (property: BoardingHouse) => void;
  radiusMeters?: number;
  centerCoordinates?: [number, number]; // [lat, lng]
  zoom?: number;
  className?: string;
}

// SEAIT Campus Coordinates in Crossing Rubber, Tupi, South Cotabato
const SEAIT_LAT = 6.3648;
const SEAIT_LNG = 124.9222;

export default function MapView({
  properties,
  selectedPropertyId,
  onSelectProperty,
  radiusMeters = 2000,
  centerCoordinates = [SEAIT_LAT, SEAIT_LNG],
  zoom = 15,
  className = 'h-full w-full min-h-[400px]'
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const circleRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically load Leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Check if map is already initialized
      if (!mapInstanceRef.current) {
        // Fix Leaflet CSS if not loaded
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const map = L.map(mapContainerRef.current, {
          center: centerCoordinates,
          zoom: zoom,
          zoomControl: true
        });

        // OpenStreetMap Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Add SEAIT Campus Center Marker
        const campusIcon = L.divIcon({
          className: 'custom-campus-marker',
          html: `
            <div style="
              background: linear-gradient(135deg, #047857, #065f46);
              color: white;
              padding: 6px 10px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              gap: 4px;
              border: 2px solid white;
              white-space: nowrap;
            ">
              🏫 SEAIT Campus
            </div>
          `,
          iconSize: [120, 30],
          iconAnchor: [60, 15]
        });

        const campusMarker = L.marker([SEAIT_LAT, SEAIT_LNG], { icon: campusIcon }).addTo(map);
        campusMarker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <div style="font-weight: bold; color: #047857; font-size: 13px;">South East Asian Institute of Technology</div>
            <div style="color: #64748b; font-size: 11px; margin-top: 2px;">National Highway, Purok 7, Crossing Rubber, Tupi</div>
            <div style="margin-top: 6px; font-size: 10px; background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Central Reference Point</div>
          </div>
        `);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update radius circle and property markers when properties or radius change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Update Radius Circle
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }
      if (radiusMeters > 0) {
        circleRef.current = L.circle([SEAIT_LAT, SEAIT_LNG], {
          radius: radiusMeters,
          color: '#059669',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 6'
        }).addTo(map);
      }

      // Clear existing property markers
      Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
      markersRef.current = {};

      // Add markers for all properties
      properties.forEach((prop) => {
        const isSelected = selectedPropertyId === prop.id;
        const availInfo = getAvailabilityInfo(prop.availabilityStatus);

        let pinColor = '#10b981'; // Green
        if (prop.availabilityStatus === 'few_slots') pinColor = '#f59e0b'; // Amber
        if (prop.availabilityStatus === 'fully_occupied') pinColor = '#f43f5e'; // Rose

        const markerHtml = `
          <div style="
            background-color: ${isSelected ? '#0f172a' : 'white'};
            color: ${isSelected ? 'white' : '#0f172a'};
            border: 2px solid ${pinColor};
            border-radius: 20px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            transform: scale(${isSelected ? 1.15 : 1});
            transition: transform 0.2s;
            cursor: pointer;
            white-space: nowrap;
          ">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${pinColor}; display: inline-block;"></span>
            <span>₱${prop.lowestPriceMonthly.toLocaleString()}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'property-marker-pin',
          html: markerHtml,
          iconSize: [75, 28],
          iconAnchor: [37, 14]
        });

        const marker = L.marker([prop.latitude, prop.longitude], { icon: customIcon }).addTo(map);

        const popupContent = `
          <div style="max-width: 220px; font-family: sans-serif; padding: 2px;">
            <img src="${prop.coverImage}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; line-height: 1.2;">${prop.name}</div>
            <div style="color: #64748b; font-size: 11px; margin-top: 2px;">📍 ${prop.purok}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid #f1f5f9;">
              <div>
                <span style="font-size: 10px; color: #64748b;">Walk to SEAIT:</span>
                <div style="font-weight: 600; font-size: 11px; color: #047857;">⏱️ ${prop.walkingTimeMinutes} mins (${prop.distanceFromSeaitMeters}m)</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 10px; color: #64748b;">From</span>
                <div style="font-weight: 800; font-size: 12px; color: #0f172a;">₱${prop.lowestPriceMonthly.toLocaleString()}</div>
              </div>
            </div>
            <a href="/boarding-houses/${prop.slug}" style="display: block; margin-top: 8px; background: #059669; color: white; text-align: center; padding: 5px 0; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">View Listing</a>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectProperty) {
            onSelectProperty(prop);
          }
        });

        markersRef.current[prop.id] = marker;
      });
    });
  }, [properties, selectedPropertyId, radiusMeters, mapLoaded]);

  // Center on selected property if specified
  useEffect(() => {
    if (selectedPropertyId && markersRef.current[selectedPropertyId] && mapInstanceRef.current) {
      const marker = markersRef.current[selectedPropertyId];
      mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true });
      marker.openPopup();
    }
  }, [selectedPropertyId]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 shadow-xs ${className}`}>
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

      {/* Floating Info Overlay */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-2 text-xs font-semibold text-slate-800">
          <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>SEAIT Crossing Rubber, Tupi</span>
          <span className="text-[10px] text-slate-500 font-normal">
            ({properties.length} nearby)
          </span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 shadow-sm text-[11px] font-medium text-slate-700 flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Few Slots</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
}
