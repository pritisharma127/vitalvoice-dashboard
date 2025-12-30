# Vital Voice Dashboard - Architecture Documentation

## System Overview

The Vital Voice Dashboard is a full-stack web application built with modern technologies, following a client-server architecture with serverless backend functions.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Vital Voice Dashboard                          │
│                                System Architecture                               │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │   CLIENTS    │
                                    └──────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
    ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
    │   Web Browser    │       │  Mobile Browser  │       │  External APIs   │
    │  (Hospital Staff)│       │  (Field Staff)   │       │ (Third Party)    │
    └──────────────────┘       └──────────────────┘       └──────────────────┘
              │                           │                           │
              └───────────────────────────┼───────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         React Application (Vite)                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │   Pages     │  │ Components  │  │  Contexts   │  │    Hooks    │    │   │
│  │  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤    │   │
│  │  │ Dashboard   │  │ UI Library  │  │ AuthContext │  │ use-toast   │    │   │
│  │  │ Requests    │  │ (shadcn/ui) │  │ Hospital    │  │ use-mobile  │    │   │
│  │  │ Donors      │  │ DashLayout  │  │ Context     │  │             │    │   │
│  │  │ Auth        │  │ ProtectedRt │  │             │  │             │    │   │
│  │  │ ApiDocs     │  │             │  │             │  │             │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                     State Management                             │    │   │
│  │  │  React Query (TanStack) │ React Context │ Local Storage         │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          │ HTTPS
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    SUPABASE                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          EDGE FUNCTIONS                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │   │
│  │  │ blood-requests  │  │     donors      │  │ search-donors-nearby    │  │   │
│  │  │                 │  │                 │  │                         │  │   │
│  │  │ POST /          │  │ GET /           │  │ POST /                  │  │   │
│  │  │ GET /           │  │ GET /:id        │  │ Proximity-based search  │  │   │
│  │  │ GET /:id        │  │ Filter & Page   │  │ Uses Google Maps API    │  │   │
│  │  │ PATCH /:id      │  │                 │  │                         │  │   │
│  │  │ DELETE /:id     │  └─────────────────┘  └─────────────────────────┘  │   │
│  │  └─────────────────┘                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                    update-blood-request (Legacy)                 │    │   │
│  │  │  GET / | GET /:id | PATCH /:id                                   │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                    call-transactions (Voice Agent)               │    │   │
│  │  │  GET / | GET /:id | POST / | PATCH /:id                          │    │   │
│  │  │  Tracks voice agent calls to donors for blood donation campaigns │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         SUPABASE SERVICES                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │     Auth     │  │   Realtime   │  │   Storage    │  │   Secrets  │  │   │
│  │  │              │  │              │  │              │  │            │  │   │
│  │  │ Email/Pass   │  │ WebSocket    │  │ File Uploads │  │ API Keys   │  │   │
│  │  │ Session Mgmt │  │ Subscriptions│  │ (Future)     │  │ Google Maps│  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       POSTGRESQL DATABASE                                │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐     │   │
│  │  │                         TABLES                                  │     │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │     │   │
│  │  │  │blood_requests│  │    donors    │  │      hospitals       │  │     │   │
│  │  │  ├──────────────┤  ├──────────────┤  ├──────────────────────┤  │     │   │
│  │  │  │ id (PK)      │  │ id (PK)      │  │ id (PK)              │  │     │   │
│  │  │  │ request_id   │  │ name         │  │ name                 │  │     │   │
│  │  │  │ patient_name │  │ blood_type   │  │ city                 │  │     │   │
│  │  │  │ blood_type   │  │ phone_number │  │ zipcode              │  │     │   │
│  │  │  │ quantity     │  │ email        │  │ address              │  │     │   │
│  │  │  │ urgency      │  │ city         │  │ phone                │  │     │   │
│  │  │  │ reason       │  │ zipcode      │  └──────────────────────┘  │     │   │
│  │  │  │ status       │  │ is_available │                            │     │   │
│  │  │  │ hospital_*   │  │ area         │  ┌──────────────────────┐  │     │   │
│  │  │  │ caretaker_*  │  │ last_donate  │  │      profiles        │  │     │   │
│  │  │  │ patient_*    │  └──────────────┘  ├──────────────────────┤  │     │   │
│  │  │  │ notes        │                    │ id (PK, FK→auth)     │  │     │   │
│  │  │  │ timestamps   │                    │ full_name            │  │     │   │
│  │  │  └──────────────┘                    │ hospital_id (FK)     │  │     │   │
│  │  │                                      │ role                 │  │     │   │
│  │  │  ┌──────────────────────────────────────────────────────────┐  │     │   │
│  │  │  │              call_transactions                           │  │     │   │
│  │  │  ├──────────────────────────────────────────────────────────┤  │     │   │
│  │  │  │ id (PK)           │ campaign_id (FK→blood_requests)      │  │     │   │
│  │  │  │ donor_id (FK)     │ phone_number, name, address, zip     │  │     │   │
│  │  │  │ blood_type        │ urgency, reason, hospital_location   │  │     │   │
│  │  │  │ availability      │ alternate_phone, current_location    │  │     │   │
│  │  │  │ pincode           │ eligibility, gender                  │  │     │   │
│  │  │  │ timestamps        │ (Tracks voice agent call outcomes)   │  │     │   │
│  │  │  └──────────────────────────────────────────────────────────┘  │     │   │
│  │  │                                      └──────────────────────┘  │     │   │
│  │  └────────────────────────────────────────────────────────────────┘     │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐     │   │
│  │  │                    ROW LEVEL SECURITY (RLS)                     │     │   │
│  │  │  • blood_requests: Auth users can SELECT, INSERT, UPDATE       │     │   │
│  │  │  • donors: Auth users can SELECT                               │     │   │
│  │  │  • hospitals: Anyone can SELECT                                │     │   │
│  │  │  • profiles: Users can CRUD own profile                        │     │   │
│  │  │  • call_transactions: Anyone can SELECT, INSERT, UPDATE        │     │   │
│  │  └────────────────────────────────────────────────────────────────┘     │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐     │   │
│  │  │                        ENUMS                                    │     │   │
│  │  │  blood_type: A+, A-, B+, B-, AB+, AB-, O+, O-                  │     │   │
│  │  │  gender_type: male, female, other                              │     │   │
│  │  │  request_status: pending, in_progress, fulfilled, cancelled    │     │   │
│  │  │  urgency_level: immediate, within_3/6/24/48_hours              │     │   │
│  │  └────────────────────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Google Maps Geocoding API                           │   │
│  │           Used for proximity search (ZIP code → coordinates)             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Blood Request Creation Flow

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│   User      │────▶│  Request     │────▶│  Edge Function │────▶│   Database   │
│   Form      │     │  Validation  │     │  blood-requests│     │              │
└─────────────┘     └──────────────┘     └────────────────┘     └──────────────┘
                                                │
                                                ▼
                                         ┌────────────────┐
                                         │   Response     │
                                         │   + Request ID │
                                         └────────────────┘
```

### 2. Donor Search Flow

```
┌──────────────┐     ┌────────────────┐     ┌──────────────────┐
│ Search Form  │────▶│ Edge Function  │────▶│    Database      │
│ (Filters)    │     │    donors      │     │    Query         │
└──────────────┘     └────────────────┘     └──────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌────────────────┐                    ┌──────────────────┐
│ Standard Query │                    │ Proximity Search │
│ (Direct DB)    │                    │ (+ Google Maps)  │
└────────────────┘                    └──────────────────┘
```

### 3. Authentication Flow

```
┌─────────────┐     ┌────────────────┐     ┌──────────────────┐
│   Login     │────▶│  Supabase      │────▶│   Session        │
│   Form      │     │  Auth          │     │   Created        │
└─────────────┘     └────────────────┘     └──────────────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │  AuthContext   │
                    │  Updated       │
                    └────────────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │  Protected     │
                    │  Routes        │
                    │  Accessible    │
                    └────────────────┘
```

---

## API Architecture

### REST Endpoints

```
BASE URL: https://<>supabase.co/functions/v1

┌─────────────────────────────────────────────────────────────┐
│                    BLOOD REQUESTS                           │
├─────────────────────────────────────────────────────────────┤
│ GET    /blood-requests           List all requests          │
│ GET    /blood-requests/:id       Get single request         │
│ POST   /blood-requests           Create new request         │
│ PATCH  /blood-requests/:id       Update request             │
│ DELETE /blood-requests/:id       Cancel request             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       DONORS                                 │
├─────────────────────────────────────────────────────────────┤
│ GET    /donors                   List donors (w/ filters)   │
│ GET    /donors/:id               Get single donor           │
│ GET    /donors?proximity_search  Distance-based search      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              UPDATE BLOOD REQUEST (Legacy)                   │
├─────────────────────────────────────────────────────────────┤
│ GET    /update-blood-request     List requests              │
│ GET    /update-blood-request/:id Get single request         │
│ PATCH  /update-blood-request/:id Update request             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 CALL TRANSACTIONS                            │
├─────────────────────────────────────────────────────────────┤
│ GET    /call-transactions        List transactions          │
│ GET    /call-transactions/:id    Get by ID or campaign      │
│ POST   /call-transactions        Create transaction         │
│ PATCH  /call-transactions/:id    Update post-call data      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 SEARCH DONORS NEARBY                         │
├─────────────────────────────────────────────────────────────┤
│ POST   /search-donors-nearby     Proximity search (auth)    │
└─────────────────────────────────────────────────────────────┘
```

---


## Technology Stack Details

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Library | 18.x |
| TypeScript | Type Safety | 5.x |
| Vite | Build Tool | 5.x |
| Tailwind CSS | Styling | 3.x |
| shadcn/ui | Component Library | Latest |
| React Router | Routing | 6.x |
| React Query | Data Fetching | 5.x |
| React Hook Form | Forms | 7.x |
| Zod | Validation | 3.x |
| Lucide React | Icons | Latest |

### Backend

| Technology | Purpose |
|------------|---------|
| Supabase | Backend Platform |
| PostgreSQL | Database |
| Deno | Edge Functions Runtime |
| Row Level Security | Data Protection |

### External Services

| Service | Purpose |
|---------|---------|
| Google Maps API | Geocoding for proximity search |

---



## Monitoring & Logging

```
┌─────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Edge Function Logs:                                         │
│  └── Supabase Dashboard → Edge Functions → Logs             │
│                                                              │
│  Database Logs:                                              │
│  └── Supabase Dashboard → Database → Logs                   │
│                                                              │
│  Auth Logs:                                                  │
│  └── Supabase Dashboard → Auth → Logs                       │
│                                                              │
│  Frontend Errors:                                            │
│  └── Browser Console + Optional: Sentry integration         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

The Vital Voice Dashboard follows a modern, serverless architecture that:

1. **Separates Concerns**: Frontend, backend, and data layers are clearly separated
2. **Scales Automatically**: Serverless functions handle variable load
3. **Secures Data**: RLS policies protect sensitive information
4. **Enables Integration**: REST APIs allow third-party access
5. **Simplifies Deployment**: Automated deployment

This architecture provides a solid foundation for a production Vital Voice management system with room for future enhancements.
