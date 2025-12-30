# Vital Voice Dashboard - Application Guide

## Introduction

Welcome to the Vital Voice Dashboard! This guide explains how the application works in simple terms, designed for anyone regardless of their technical background.

---

## What is this Application?

The Vital Voice Dashboard is a web application that helps hospitals and Vital Voices:

1. **Request Blood** - When a patient needs blood, hospital staff can create a request
2. **Find Donors** - Search for registered blood donors in nearby areas
3. **Track Requests** - Monitor the status of blood requests from creation to fulfillment
4. **Manage Data** - Keep records of all blood requests and donors

Think of it as a digital bridge connecting hospitals in need of blood with available donors.

---

## Who Uses This Application?

### Hospital Administrators
Staff members at hospitals who:
- Create new blood requests when patients need blood
- Search for matching donors
- Update request status as blood is procured
- View dashboards with request statistics

### External Systems (via API)
Other software applications can:
- Create blood requests automatically
- Search for donors
- Get real-time updates on request status

---

## How Does It Work?

### The Big Picture

```
Patient Needs Blood → Hospital Creates Request → System Finds Donors → Blood is Delivered → Request Marked Complete
```

### Step-by-Step Process

#### 1. Creating a Blood Request

When a patient needs blood:

1. Hospital staff logs into the portal
2. Clicks "New Request" button
3. Fills in patient information:
   - Patient name and age
   - Blood type needed (A+, O-, etc.)
   - How many units are needed
   - How urgent is the need
   - **Reason for blood requirement** (e.g., surgery, accident, medical treatment)
   - Caretaker contact details
4. Submits the request
5. System generates a unique tracking ID

#### 2. Finding Donors

The system helps find matching donors by:

1. Looking at the required blood type
2. Searching for available donors
3. Finding donors near the hospital location
4. Showing contact information for outreach

The "proximity search" feature finds donors closest to the hospital, making it faster to get blood.

#### 3. Tracking Request Status

Each request goes through stages:

- **Pending** - Just created, waiting for action
- **In Progress** - Donor found, blood being processed
- **Fulfilled** - Blood delivered to patient
- **Cancelled** - Request no longer needed

#### 4. Dashboard Overview

The dashboard shows:
- Total requests this month
- Requests by status
- Requests by blood type
- Recent activity

---

## Understanding Blood Types

The application works with 8 blood types:

| Blood Type | Can Donate To | Can Receive From |
|------------|---------------|------------------|
| O- | Everyone | O- only |
| O+ | O+, A+, B+, AB+ | O+, O- |
| A- | A-, A+, AB-, AB+ | A-, O- |
| A+ | A+, AB+ | A+, A-, O+, O- |
| B- | B-, B+, AB-, AB+ | B-, O- |
| B+ | B+, AB+ | B+, B-, O+, O- |
| AB- | AB-, AB+ | A-, B-, AB-, O- |
| AB+ | AB+ only | Everyone |

---

## Key Features Explained

### 1. Blood Request Form

**What it does:** Allows hospital staff to formally request blood for a patient.

**Information needed:**
- Patient details (name, age, gender)
- Medical needs (blood type, units needed)
- Urgency level
- **Reason for blood** (surgery, accident, treatment, etc.)
- Contact person information
- Hospital location

### 2. Donor Search

**What it does:** Finds registered blood donors matching specific criteria.

**Search options:**
- By blood type
- By location (city, area, zipcode)
- By availability status
- By distance from hospital

### 3. Request Management

**What it does:** Lets staff update and track blood requests.

**Actions available:**
- Update status
- Add notes
- Modify quantity
- Change urgency level
- Cancel request

### 4. Proximity Search

**What it does:** Finds donors closest to a specific location.

**How it works:**
1. Enter a ZIP/PIN code
2. System calculates distances to all donors
3. Shows donors sorted by distance
4. Filters by maximum distance if needed

### 5. Voice Agent Call Tracking

**What it does:** Tracks calls made by voice agents to donors for blood donation campaigns.

**Information captured:**
- Campaign ID (linked to blood request)
- Donor details (name, phone, blood type)
- Call outcomes (availability, eligibility)
- Current location and pincode
- Alternate contact information

**Use cases:**
- Automated donor outreach via voice agents
- Tracking donor responses
- Recording eligibility status and reasons

### 6. API Access

**What it does:** Allows other computer systems to interact with the portal.

**Use cases:**
- Hospital management systems creating requests automatically
- Mobile apps for staff
- Integration with Vital Voice inventory systems
- Automated notifications
- **Voice agent systems for donor outreach**

---

## Understanding Urgency Levels

| Level | Meaning | Response Time |
|-------|---------|---------------|
| Immediate | Life-threatening emergency | As fast as possible |
| Within 3 Hours | Critical but stable | Under 3 hours |
| Within 6 Hours | Urgent surgery planned | Under 6 hours |
| Within 24 Hours | Scheduled procedure | Same day |
| Within 48 Hours | Non-urgent need | Within 2 days |

---

## Data Security

The application keeps data safe by:

1. **Login Required** - Only authorized users can access the portal
2. **Secure Storage** - All data is encrypted
3. **Access Control** - Users can only see relevant information
4. **Audit Trail** - All changes are recorded with timestamps

---

## Glossary of Terms

| Term | Meaning |
|------|---------|
| **API** | A way for different computer programs to communicate |
| **Campaign** | A blood request used to coordinate donor outreach |
| **Call Transaction** | A record of a voice agent call to a donor |
| **Database** | Where all the information is stored |
| **Edge Function** | Small programs that run online to process requests |
| **Eligibility** | Whether a donor can donate (based on health, recent donations, etc.) |
| **RLS** | Row Level Security - ensures users see only their data |
| **UUID** | A unique identifier for each record |
| **Voice Agent** | An automated system that makes calls to donors |

---

## Summary

The Vital Voice Dashboard simplifies the process of:
- Creating blood requests for patients
- Finding matching donors quickly
- Tracking requests through fulfillment
- Integrating with other hospital systems

By digitizing this process, hospitals can respond faster to blood needs and potentially save more lives.
