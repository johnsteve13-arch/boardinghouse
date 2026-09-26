# 🏫 SEAIT Stay — World-Class Boarding House Finder & Information System

> **Premier, Web-Based Student Accommodation & Boarding House Finder System designed specifically for South East Asian Institute of Technology (SEAIT), Crossing Rubber, Tupi, South Cotabato, Philippines.**

[![SEAIT Campus Anchor](https://img.shields.io/badge/Campus-SEAIT%20Tupi%2C%20South%20Cotabato-047857.svg)](https://seait.edu.ph)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black.svg)](https://nextjs.org/)
[![Node.js Express](https://img.shields.io/badge/API-Express%20TypeScript-blue.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌟 Executive Summary & Problem Solved

Every semester, thousands of students enrolling at **South East Asian Institute of Technology (SEAIT)** travel to **Crossing Rubber, Tupi, South Cotabato** from surrounding municipalities (Koronadal, Polomolok, General Santos, Tampakan, Surallah) looking for safe, affordable accommodation.

Historically, this process suffered from:
1. **Scattered, Outdated Information**: Tenants had to walk under the sun in Crossing Rubber checking handwritten cardboard signs.
2. **Ghost Availability**: Students travel to boarding houses only to find all slots taken weeks ago.
3. **Location Uncertainty**: Lack of accurate distance data—students couldn't easily verify whether a house was a 4-minute walk or a 25-minute commute.
4. **Safety & Transparency Concerns**: Unverified owners, undisclosed curfews, hidden electricity charges, and lack of security guarantees.

**SEAIT Stay** solves these issues by establishing a centralized discovery, real-time availability, and verified accommodation platform built specifically for the SEAIT campus community.

---

## 🏛️ Strict Geographic Scope

The platform is strictly bounded to the service area of:
* **Institution**: South East Asian Institute of Technology, Inc. (SEAIT)
* **Address**: National Highway, Purok 7, Crossing Rubber, Tupi, South Cotabato, 9505 Philippines
* **Geographic Anchor**: `Latitude: 6.3648° N`, `Longitude: 124.9222° E`
* **Default Service Radius**: 2.0 kilometers (configurable up to 5.0 km by Admin)
* **Coverage**: Purok 1 to Purok 7 Crossing Rubber, Dole Bypass Road, National Highway corridors.

---

## 🏗️ Production Architecture

```
                                   ┌──────────────────────┐
                                   │  SEAIT Student / User │
                                   └──────────┬───────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │      NEXT.JS 14 FRONTEND (Vercel)        │
                        │  - React, TypeScript, Tailwind CSS       │
                        │  - Framer Motion, Lucide Icons           │
                        │  - Leaflet / OSM Interactive Campus Map   │
                        │  - React Context (Auth, Compare, Budget) │
                        └─────────────────────┬────────────────────┘
                                              │
                                    REST API  │  Bearer JWT
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │     NODE.JS + EXPRESS API (Render)       │
                        │  - TypeScript, Zod Validation            │
                        │  - RBAC (Student, Owner, Admin)          │
                        │  - Haversine Distance Engine             │
                        │  - Centralized Error & Security Engine   │
                        │  - Health Endpoint: GET /health          │
                        └─────────────────────┬────────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │       SUPABASE / POSTGRESQL DB           │
                        │  - Relational Schema (DDL Constraints)   │
                        │  - Spatial Haversine Distance Function   │
                        │  - Audit Logs & System Geofence Settings │
                        └──────────────────────────────────────────┘
```

---

## 👥 User Roles & Capabilities

| Capability | Student / Tenant | Boarding House Owner | System Administrator |
|---|:---:|:---:|:---:|
| Search & Radius Filter (< 500m to 5km) | ✅ | ✅ | ✅ |
| Interactive Campus Map & Directions | ✅ | ✅ | ✅ |
| Side-by-Side Comparison Matrix | ✅ | ✅ | ✅ |
| Student Monthly Budget Calculator | ✅ | ✅ | ✅ |
| Direct In-App Inquiry & Messaging | ✅ | ✅ | ✅ |
| Write Verified Reviews & Ratings | ✅ | ❌ | Moderation |
| Owner Identity Verification Workflow | ❌ | ✅ (Submit ID/Permit) | ✅ (Approve/Reject) |
| 1-Click Real-Time Availability Switch | ❌ | ✅ (Available/Few/Full) | ✅ |
| Room Inventory Management | ❌ | ✅ | ✅ |
| Service Radius & Geofence Configuration | ❌ | ❌ | ✅ |
| Audit Trail & Platform Analytics | ❌ | ❌ | ✅ |

---

## 🗄️ Database Design (`database/schema.sql`)

The database is built on PostgreSQL (optimized for Supabase) with complete relational normalization:

* `users` — Authentication credentials, roles (`student`, `owner`, `admin`), student ID numbers, SEAIT college departments.
* `owner_verifications` — Government IDs, barangay business permits, admin review status and audit notes.
* `boarding_houses` — Names, slugs, descriptions, latitude/longitude, distance from SEAIT in meters, walking time in minutes, curfews, gender policies, utilities included/excluded.
* `boarding_house_photos` — Multi-photo gallery categorized by `exterior`, `room`, `bathroom`, `kitchen`, `study_area`.
* `rooms` — Inventory items with room categories (`single`, `double`, `quad`, `bedspace`, `studio`), per-person vs per-room rates, advance/deposit requirements, and available slots.
* `amenities` & `boarding_house_amenities` — Many-to-many amenities mapping (Fiber Wi-Fi, Aircon, CCTV, Gated, Cooking, Filtered Water, Generator).
* `inquiries` & `inquiry_messages` — In-app messaging threads between students and property owners.
* `reviews` — Verified stay ratings across Cleanliness, Location, Value, Safety, and Owner Responsiveness with owner replies.
* `favorites` & `comparisons` — Student bookmarking and comparison matrices.
* `system_settings` — SEAIT campus coordinates, default radius, maximum allowable search radius.
* `audit_logs` — Immutable audit records of administrative verifications, listing creations, and setting updates.

---

## 🚀 Quickstart Local Development

### Prerequisites
* **Node.js** v18+ (tested on Node v20 / v24)
* **npm** v9+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/johnsteve13-arch/boardinghouse.git
cd boardinghouse
npm install
```

### 2. Environment Configuration
Copy `.env.example` to root `.env`:
```bash
cp .env.example .env
```
*(The API runs out-of-the-box in local development with rich realistic SEAIT Crossing Rubber seed data even before configuring external database credentials).*

### 3. Run Development Servers
Start both the Next.js Frontend and the Node.js API concurrently:
```bash
# Start backend API (Port 4000)
npm run dev:api

# In another terminal, start frontend (Port 3000)
npm run dev:web
```

* **Frontend**: `http://localhost:3000`
* **API Health Check**: `http://localhost:4000/health`
* **API Base URL**: `http://localhost:4000/api`

---

## 🔑 Demo Personas (1-Click Instant Testing)

For evaluation without requiring manual registration, click the **Role Switcher** in the navbar:
* **Student Persona**: `kristine.bsit@seait.edu.ph` / `Password123!` (Kristine Joy Alcantara - BSIT 3rd Year)
* **Owner Persona**: `nanay.rosa@gmail.com` / `Password123!` (Rosa Mae Magbanua - Owner of Green Ville Dorm)
* **Admin Persona**: `admin@seaitstay.edu.ph` / `Password123!` (Engr. Danica Flores - SEAIT Student Affairs)

---

## ☁️ Production Deployment Guide

### A. Deploy Frontend to Vercel
1. Import repository `johnsteve13-arch/boardinghouse` into Vercel.
2. Set **Root Directory** to `apps/web`.
3. Set **Build Command**: `next build` (or default).
4. Configure Environment Variables:
   * `NEXT_PUBLIC_API_URL`: Your deployed Render API URL (e.g. `https://seait-stay-api.onrender.com/api`).
5. Deploy!

### B. Deploy Backend API to Render
1. Create a new **Web Service** on Render connected to `johnsteve13-arch/boardinghouse`.
2. Set **Root Directory** to `apps/api`.
3. Set **Build Command**: `npm install && npm run build`.
4. Set **Start Command**: `npm run start`.
5. Health Check Path: `/health`.
6. Configure Environment Variables:
   * `PORT`: `4000` (Render binds automatically)
   * `NODE_ENV`: `production`
   * `JWT_SECRET`: Secure 64-character random string
   * `DATABASE_URL`: Your Supabase connection string.
7. Deploy!

### C. Supabase PostgreSQL Setup
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Paste the contents of `database/schema.sql` and run.
3. Paste the contents of `database/seed.sql` and run.
4. Copy the connection string to `DATABASE_URL` in your Render environment variables.

---

## 🧪 Testing

Run the automated test suite verifying distance algorithms, geofencing, and recommendation scoring:
```bash
npm run test:api
```

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE). Built for the students and faculty of South East Asian Institute of Technology, Tupi, South Cotabato.
