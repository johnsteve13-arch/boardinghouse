'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BoardingHouse } from '@seait-stay/types';
import { formatCurrency, formatDistance, getAvailabilityInfo } from '../lib/utils';
import {
  MapPin,
  Navigation,
  School,
  Clock,
  ExternalLink,
  Layers,
  Crosshair,
  Shield,
  ShieldAlert,
  Info,
  Sparkles,
  Compass,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface MapViewProps {
  properties: BoardingHouse[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (property: BoardingHouse) => void;
  radiusMeters?: number;
  onRadiusChange?: (radius: number) => void;
  centerCoordinates?: [number, number]; // [lat, lng]
  zoom?: number;
  className?: string;
  showControls?: boolean;
}

// SEAIT Campus Coordinates in Crossing Rubber, Tupi, South Cotabato
const SEAIT_LAT = 6.3648;
const SEAIT_LNG = 124.9222;
const MAX_BARRIER_RADIUS_METERS = 3000; // 3.0 km strict scope barrier

// Key landmarks around SEAIT in Crossing Rubber, Tupi
const TUPI_LANDMARKS = [
  {
    id: 'lm-terminal',
    name: 'Crossing Rubber Tricycle Terminal',
    category: 'transport',
    lat: 6.3662,
    lng: 124.9211,
    icon: '🛵',
    desc: '24/7 direct rides to SEAIT gate (₱15–₱20 fare)',
    badge: 'Tricycle Terminal'
  },
  {
    id: 'lm-highway',
    name: 'National Highway Crossing Rubber',
    category: 'transit',
    lat: 6.3653,
    lng: 124.9215,
    icon: '🚌',
    desc: 'Bus & Van drop-off from GenSan / Koronadal / Polomolok',
    badge: 'Highway Junction'
  },
  {
    id: 'lm-market',
    name: 'Crossing Rubber Market & Food Hub',
    category: 'food',
    lat: 6.3639,
    lng: 124.9198,
    icon: '🍲',
    desc: 'Affordable tenant carinderias, bakeries, water refilling',
    badge: 'Food Hub'
  },
  {
    id: 'lm-security',
    name: 'Barangay Crossing Rubber Security Post',
    category: 'security',
    lat: 6.3675,
    lng: 124.9235,
    icon: '🛡️',
    desc: 'Barangay police outpost & tanod night patrol post',
    badge: 'Safe Zone'
  }
];

/**
 * Generate geodesic polygon points for a circle around center coordinates
 */
function generateCircleCoords(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  points = 64
): [number, number][] {
  const coords: [number, number][] = [];
  const earthRadius = 6378137;
  const latRad = (centerLat * Math.PI) / 180;
  const lngRad = (centerLng * Math.PI) / 180;
  const dByR = radiusMeters / earthRadius;

  for (let i = 0; i <= points; i++) {
    const bearing = (i * 2 * Math.PI) / points;
    const pLat = Math.asin(
      Math.sin(latRad) * Math.cos(dByR) +
      Math.cos(latRad) * Math.sin(dByR) * Math.cos(bearing)
    );
    const pLng =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(dByR) * Math.cos(latRad),
        Math.cos(dByR) - Math.sin(latRad) * Math.sin(pLat)
      );
    coords.push([(pLat * 180) / Math.PI, (pLng * 180) / Math.PI]);
  }
  return coords;
}

export default function MapView({
  properties,
  selectedPropertyId,
  onSelectProperty,
  radiusMeters = 2000,
  onRadiusChange,
  centerCoordinates = [SEAIT_LAT, SEAIT_LNG],
  zoom = 15,
  className = 'h-full w-full min-h-[450px]',
  showControls = true
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const baseTileLayerRef = useRef<any>(null);
  const labelsLayerRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const overlayLayersRef = useRef<any[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [activeRadius, setActiveRadius] = useState<number>(Math.min(radiusMeters || 2000, MAX_BARRIER_RADIUS_METERS));

  // Sync internal radius state if prop updates
  useEffect(() => {
    if (radiusMeters) {
      setActiveRadius(Math.min(radiusMeters, MAX_BARRIER_RADIUS_METERS));
    }
  }, [radiusMeters]);

  // 1. Initialize Leaflet Map with Safe Bounds around Tupi & SEAIT
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Safe geographical bounds around Tupi / Crossing Rubber (allows comfortable viewing without viewport lockup)
        const southWest = L.latLng(6.30, 124.85);
        const northEast = L.latLng(6.43, 124.99);
        const safeBounds = L.latLngBounds(southWest, northEast);

        const map = L.map(mapContainerRef.current, {
          center: centerCoordinates,
          zoom: zoom,
          minZoom: 13,
          maxZoom: 19,
          maxBounds: safeBounds,
          maxBoundsViscosity: 0.7,
          zoomControl: false
        });

        // Rock-solid OpenStreetMap Standard tiles (100% reliable, zero rate limits)
        const streetTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        });
        streetTiles.addTo(map);
        baseTileLayerRef.current = streetTiles;

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Multiple invalidation calls to guarantee tiles are painted after container sizes stabilize
        setTimeout(() => map.invalidateSize(), 100);
        setTimeout(() => map.invalidateSize(), 300);
        setTimeout(() => map.invalidateSize(), 800);

        // ResizeObserver guarantees zero grey tiles when resizing or toggling views
        if (window.ResizeObserver && mapContainerRef.current) {
          const ro = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          });
          ro.observe(mapContainerRef.current);
        }
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

  // 2. Handle Street / Satellite Style Switch
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (baseTileLayerRef.current) {
        map.removeLayer(baseTileLayerRef.current);
        baseTileLayerRef.current = null;
      }
      if (labelsLayerRef.current) {
        map.removeLayer(labelsLayerRef.current);
        labelsLayerRef.current = null;
      }

      if (mapStyle === 'satellite') {
        const satTiles = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
            maxZoom: 19
          }
        );
        satTiles.addTo(map);
        baseTileLayerRef.current = satTiles;
      } else {
        const streetTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        });
        streetTiles.addTo(map);
        baseTileLayerRef.current = streetTiles;
      }
    });
  }, [mapStyle, mapLoaded]);

  // 3. Render 3.0 KM Barrier, Concentric Distance Rings, Landmarks & Property Pins
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clean up previous overlay layers
      overlayLayersRef.current.forEach((layer) => map.removeLayer(layer));
      overlayLayersRef.current = [];

      // ==========================================
      // A. 3.0 KM VISUAL BARRIER (GLOW + BOUNDARY LINE)
      // ==========================================
      // 1. Soft green fill inside the official 3km scope
      const scopeArea = L.circle([SEAIT_LAT, SEAIT_LNG], {
        radius: MAX_BARRIER_RADIUS_METERS,
        color: '#10b981',
        weight: 1,
        fillColor: '#10b981',
        fillOpacity: 0.04,
        interactive: false
      }).addTo(map);
      overlayLayersRef.current.push(scopeArea);

      // 2. Glowing outer barrier halo (Rose glow)
      const barrierGlow = L.circle([SEAIT_LAT, SEAIT_LNG], {
        radius: MAX_BARRIER_RADIUS_METERS + 25,
        color: '#f43f5e',
        weight: 6,
        opacity: 0.35,
        fill: false,
        interactive: false
      }).addTo(map);
      overlayLayersRef.current.push(barrierGlow);

      // 3. Bold, crisp dashed 3.0 km barrier boundary line
      const barrierLine = L.circle([SEAIT_LAT, SEAIT_LNG], {
        radius: MAX_BARRIER_RADIUS_METERS,
        color: '#e11d48',
        weight: 3.5,
        dashArray: '10, 8',
        fill: false,
        interactive: false
      }).addTo(map);
      overlayLayersRef.current.push(barrierLine);

      // 4. Perimeter Badges at North, South, East, West
      const barrierBadges = [
        { label: 'NORTH 3.0 KM BARRIER', dLat: 3000 / 111132, dLng: 0 },
        { label: 'SOUTH 3.0 KM BARRIER', dLat: -3000 / 111132, dLng: 0 },
        {
          label: 'EAST 3.0 KM BARRIER',
          dLat: 0,
          dLng: 3000 / (111132 * Math.cos((SEAIT_LAT * Math.PI) / 180))
        },
        {
          label: 'WEST 3.0 KM BARRIER',
          dLat: 0,
          dLng: -3000 / (111132 * Math.cos((SEAIT_LAT * Math.PI) / 180))
        }
      ];

      barrierBadges.forEach((item) => {
        const badgeIcon = L.divIcon({
          className: 'seait-barrier-label',
          html: `
            <div style="
              background: rgba(15, 23, 42, 0.95);
              color: #fca5a5;
              border: 1.5px solid #f43f5e;
              padding: 2.5px 8px;
              border-radius: 9999px;
              font-size: 8.5px;
              font-weight: 800;
              letter-spacing: 0.5px;
              white-space: nowrap;
              box-shadow: 0 4px 10px rgba(0,0,0,0.5);
              transform: translate(-50%, -50%);
              display: inline-flex;
              align-items: center;
              gap: 3px;
            ">
              <span>⛔</span>
              <span>${item.label}</span>
            </div>
          `,
          iconSize: [0, 0]
        });
        const badgeMarker = L.marker([SEAIT_LAT + item.dLat, SEAIT_LNG + item.dLng], {
          icon: badgeIcon,
          interactive: false
        }).addTo(map);
        overlayLayersRef.current.push(badgeMarker);
      });

      // ==========================================
      // B. CONCENTRIC DISTANCE GUIDE RINGS
      // ==========================================
      // 500m Walk Ring (~6 min walk)
      const ring500 = L.circle([SEAIT_LAT, SEAIT_LNG], {
        radius: 500,
        color: '#10b981',
        weight: 1.5,
        dashArray: '4, 4',
        opacity: 0.8,
        fill: false,
        interactive: false
      }).addTo(map);
      overlayLayersRef.current.push(ring500);

      // 1,000m Walk Ring (~12 min walk)
      const ring1000 = L.circle([SEAIT_LAT, SEAIT_LNG], {
        radius: 1000,
        color: '#14b8a6',
        weight: 1.5,
        dashArray: '4, 4',
        opacity: 0.75,
        fill: false,
        interactive: false
      }).addTo(map);
      overlayLayersRef.current.push(ring1000);

      // 2,000m Crossing Rubber Zone Ring
      const ring2000 = L.circle([SEAIT_LAT, SEAIT_LNG], {
        radius: 2000,
        color: '#0284c7',
        weight: 1.5,
        dashArray: '4, 4',
        opacity: 0.7,
        fill: false,
        interactive: false
      }).addTo(map);
      overlayLayersRef.current.push(ring2000);

      // Ring Distance Labels
      const ringLabels = [
        { radius: 500, text: '🚶 500m (6 min walk)', bg: '#065f46', border: '#10b981', color: '#a7f3d0' },
        { radius: 1000, text: '🚶 1.0 km (12 min walk)', bg: '#115e59', border: '#14b8a6', color: '#99f6e4' },
        { radius: 2000, text: '🛵 2.0 km Crossing Rubber', bg: '#075985', border: '#0284c7', color: '#bae6fd' }
      ];

      ringLabels.forEach((rl) => {
        const offsetLat = (rl.radius * 0.707) / 111132;
        const offsetLng = (rl.radius * 0.707) / (111132 * Math.cos((SEAIT_LAT * Math.PI) / 180));
        const ringLabelIcon = L.divIcon({
          className: 'seait-barrier-label',
          html: `
            <div style="
              background: ${rl.bg};
              color: ${rl.color};
              border: 1px solid ${rl.border};
              padding: 2px 7px;
              border-radius: 9999px;
              font-size: 9px;
              font-weight: 700;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              transform: translate(-50%, -50%);
            ">
              ${rl.text}
            </div>
          `,
          iconSize: [0, 0]
        });
        const rlMarker = L.marker([SEAIT_LAT + offsetLat, SEAIT_LNG + offsetLng], {
          icon: ringLabelIcon,
          interactive: false
        }).addTo(map);
        overlayLayersRef.current.push(rlMarker);
      });

      // Active Filter Radius Highlight (if customized by user)
      if (activeRadius > 0 && activeRadius <= MAX_BARRIER_RADIUS_METERS) {
        const activeFilterFill = L.circle([SEAIT_LAT, SEAIT_LNG], {
          radius: activeRadius,
          color: '#059669',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '3, 5',
          interactive: false
        }).addTo(map);
        overlayLayersRef.current.push(activeFilterFill);
      }

      // ==========================================
      // C. KEY LOCAL TUPI & CROSSING RUBBER LANDMARKS
      // ==========================================
      TUPI_LANDMARKS.forEach((lm) => {
        const lmIcon = L.divIcon({
          className: 'seait-landmark-marker',
          html: `
            <div style="
              background: rgba(15, 23, 42, 0.92);
              color: white;
              border: 1.5px solid #38bdf8;
              padding: 3px 8px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 3px 10px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              cursor: pointer;
            ">
              <span>${lm.icon}</span>
              <span>${lm.name}</span>
            </div>
          `,
          iconSize: [0, 0]
        });

        const lmMarker = L.marker([lm.lat, lm.lng], { icon: lmIcon }).addTo(map);
        lmMarker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif; max-width: 210px;">
            <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase;">${lm.badge}</div>
            <div style="font-weight: 800; font-size: 12.5px; color: #0f172a; margin-top: 2px;">${lm.name}</div>
            <div style="color: #64748b; font-size: 11px; margin-top: 3px;">${lm.desc}</div>
          </div>
        `);
        overlayLayersRef.current.push(lmMarker);
      });

      // ==========================================
      // D. SEAIT CAMPUS CENTER BEACON (ANCHOR)
      // ==========================================
      const campusBeaconIcon = L.divIcon({
        className: 'custom-campus-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: rgba(16, 185, 129, 0.45);
              animation: radar-pulse 2s cubic-bezier(0,0,0.2,1) infinite;
            "></div>
            <div style="
              position: relative;
              background: linear-gradient(135deg, #047857, #064e3b);
              color: white;
              padding: 5px 12px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 4px 14px rgba(0,0,0,0.45);
              display: flex;
              align-items: center;
              gap: 5px;
              border: 2px solid #6ee7b7;
              white-space: nowrap;
              cursor: pointer;
            ">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px #34d399;"></span>
              <span>🏫 SEAIT Campus (Anchor)</span>
            </div>
          </div>
        `,
        iconSize: [180, 32],
        iconAnchor: [90, 16]
      });

      const campusMarker = L.marker([SEAIT_LAT, SEAIT_LNG], { icon: campusBeaconIcon }).addTo(map);
      campusMarker.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif; max-width: 250px;">
          <div style="font-weight: 800; color: #047857; font-size: 13px;">South East Asian Institute of Technology</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 3px;">Purok 7, Crossing Rubber, Tupi, South Cotabato</div>
          <div style="margin-top: 6px; font-size: 10px; background: #ecfdf5; color: #065f46; padding: 4px 8px; border-radius: 6px; font-weight: 700; border: 1px solid #a7f3d0;">
            📍 Official Reference Anchor: 6.3648° N, 124.9222° E<br/>
            🔒 3.0 KM Fixed Scope Perimeter Active
          </div>
        </div>
      `);
      overlayLayersRef.current.push(campusMarker);

      // ==========================================
      // E. BOARDING HOUSE PROPERTY PINS
      // ==========================================
      Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
      markersRef.current = {};

      const boundedProperties = properties.filter((p) => p.distanceFromSeaitMeters <= MAX_BARRIER_RADIUS_METERS);

      boundedProperties.forEach((prop) => {
        const isSelected = selectedPropertyId === prop.id;
        const availInfo = getAvailabilityInfo(prop.availabilityStatus);

        let pinColor = '#10b981'; // Green
        if (prop.availabilityStatus === 'few_slots') pinColor = '#f59e0b'; // Amber
        if (prop.availabilityStatus === 'fully_occupied') pinColor = '#f43f5e'; // Rose

        const markerHtml = `
          <div style="
            background-color: ${isSelected ? '#090d16' : 'white'};
            color: ${isSelected ? '#34d399' : '#0f172a'};
            border: 2px solid ${isSelected ? '#34d399' : pinColor};
            border-radius: 20px;
            padding: 4px 9px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.22);
            transform: scale(${isSelected ? 1.2 : 1});
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor: pointer;
            white-space: nowrap;
          ">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${pinColor}; display: inline-block; box-shadow: 0 0 4px ${pinColor};"></span>
            <span>₱${prop.lowestPriceMonthly.toLocaleString()}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'property-marker-pin',
          html: markerHtml,
          iconSize: [80, 30],
          iconAnchor: [40, 15]
        });

        const marker = L.marker([prop.latitude, prop.longitude], { icon: customIcon }).addTo(map);

        const popupContent = `
          <div style="max-width: 230px; font-family: sans-serif; padding: 2px;">
            <div style="position: relative; border-radius: 10px; overflow: hidden; margin-bottom: 7px;">
              <img src="${prop.coverImage}" style="width: 100%; height: 105px; object-fit: cover;" />
              <div style="position: absolute; top: 6px; left: 6px; background: rgba(15,23,42,0.85); color: white; padding: 2px 7px; border-radius: 9999px; font-size: 9.5px; font-weight: 700;">
                ${availInfo.badge}
              </div>
            </div>
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.25;">${prop.name}</div>
            <div style="color: #64748b; font-size: 11px; margin-top: 2px;">📍 ${prop.purok}, Crossing Rubber</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid #f1f5f9;">
              <div>
                <span style="font-size: 10px; color: #64748b;">Walk to SEAIT:</span>
                <div style="font-weight: 700; font-size: 11px; color: #047857;">⏱️ ${prop.walkingTimeMinutes} mins (${prop.distanceFromSeaitMeters}m)</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 10px; color: #64748b;">From</span>
                <div style="font-weight: 900; font-size: 12.5px; color: #0f172a;">₱${prop.lowestPriceMonthly.toLocaleString()}</div>
              </div>
            </div>
            <a href="/boarding-houses/${prop.slug}" style="display: block; margin-top: 8px; background: #059669; color: white; text-align: center; padding: 6px 0; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 6px rgba(5,150,105,0.3);">View Details & Inquire</a>
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
  }, [properties, selectedPropertyId, activeRadius, mapLoaded, mapStyle]);

  // Center on selected property if specified
  useEffect(() => {
    if (selectedPropertyId && markersRef.current[selectedPropertyId] && mapInstanceRef.current) {
      const marker = markersRef.current[selectedPropertyId];
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.flyTo(marker.getLatLng(), 16.5, { animate: true, duration: 0.9 });
      const timer = setTimeout(() => {
        marker.openPopup();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedPropertyId, properties]);

  // Smooth Pan to Center Campus Action
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([SEAIT_LAT, SEAIT_LNG], 15.5, {
        duration: 0.9
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleRadiusSelect = (newRadius: number) => {
    const capped = Math.min(newRadius, MAX_BARRIER_RADIUS_METERS);
    setActiveRadius(capped);
    if (onRadiusChange) {
      onRadiusChange(capped);
    }
    if (mapInstanceRef.current) {
      const targetZoom = capped <= 500 ? 16.5 : capped <= 1000 ? 15.5 : capped <= 2000 ? 14.8 : 14.2;
      mapInstanceRef.current.flyTo([SEAIT_LAT, SEAIT_LNG], targetZoom, { duration: 0.8 });
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-card bg-slate-100 ${className}`}>
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px] z-0" />

      {/* TOP-LEFT FLOATING STATUS ISLAND */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none max-w-[280px] sm:max-w-sm">
        <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-xl pointer-events-auto space-y-1.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <School className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-slate-900 leading-tight truncate">
                SEAIT Campus Scope
              </h4>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                Crossing Rubber, Tupi, South Cotabato
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-[10px] font-bold">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>3.0 km Scope Barrier Active</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span>{properties.filter((p) => p.distanceFromSeaitMeters <= MAX_BARRIER_RADIUS_METERS).length} houses in scope</span>
            </span>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT MODERN FLOATING CONTROLS */}
      {showControls && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end space-y-2">
          {/* Map Layer Switcher: Streets vs Satellite */}
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/90 shadow-lg flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 ${
                mapStyle === 'streets'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🗺️ Street</span>
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 ${
                mapStyle === 'satellite'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🛰️ Satellite</span>
            </button>
          </div>

          {/* Quick Radius Jump Selector */}
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/90 shadow-lg flex items-center space-x-1 text-[10px] font-bold">
            <span className="px-2 text-slate-400 uppercase tracking-wider text-[9px]">Scope:</span>
            {[
              { val: 500, label: '500m' },
              { val: 1000, label: '1km' },
              { val: 2000, label: '2km' },
              { val: 3000, label: '3km Barrier' }
            ].map((r) => (
              <button
                key={r.val}
                type="button"
                onClick={() => handleRadiusSelect(r.val)}
                className={`px-2 py-1 rounded-xl transition-all ${
                  activeRadius === r.val
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Recenter Campus & Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleRecenter}
              title="Recenter SEAIT Campus Anchor (Crossing Rubber)"
              className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md text-emerald-700 hover:bg-emerald-50 border border-slate-200/90 shadow-lg font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Crosshair className="w-4 h-4 text-emerald-600 animate-spin-slow" />
              <span className="hidden sm:inline text-[11px]">Center SEAIT</span>
            </button>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg flex flex-col p-0.5">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM-LEFT FLOATING LEGEND & BARRIER BADGE */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200/90 shadow-xl text-[11px] font-semibold text-slate-700 flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
          <span>Few Slots</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200 text-rose-700 font-bold">
          <span className="w-3.5 border-b-2 border-rose-500 border-dashed" />
          <span>3.0 km Boundary Barrier (Beyond Blocked)</span>
        </div>
      </div>

      {/* BOTTOM-RIGHT COORDINATE / ANCHOR PILL */}
      <div className="hidden sm:flex absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 text-[10px] font-mono items-center space-x-2 shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Anchor: 6.3648° N, 124.9222° E</span>
        <span className="text-slate-500">•</span>
        <span className="text-emerald-400 font-bold">Scope: Max 3.0 km</span>
      </div>
    </div>
  );
}
