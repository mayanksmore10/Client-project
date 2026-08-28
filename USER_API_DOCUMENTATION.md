# Sahyadri Travels — User API Documentation

> **Base URL**: `http://localhost:8000`  
> **Auth**: Cookie-based (`access_token` httpOnly cookie set on login)  
> **🔒 Protected** routes require the user to be logged in (cookie must be present)

---

## Table of Contents

1. [General](#1-general)
2. [Authentication](#2-authentication--auth)
3. [Home / Discovery](#3-home--discovery)
4. [Packages](#4-packages)
5. [Bookings](#5-bookings)
6. [Reviews](#6-reviews)
7. [AI Recommendations](#7-ai-recommendations)
8. [Contact & Support](#8-contact--support)
9. [Booking Flow (Step-by-step)](#9-booking-flow-step-by-step)

---

## 1. General

### `GET /`
**Purpose**: Health check / welcome message.  
**Used by**: App startup ping, internal health checks.

```json
{ "message": "Welcome to Sahyadri Travels" }
```

---

### `GET /health`
**Purpose**: Confirms the API server is alive and running.  
**Used by**: Frontend status checks, deployment monitors.

```json
{ "status": "ok", "service": "Sahyadri Travels" }
```

---

## 2. Authentication — `/auth`

Handles user registration, login, session management, and profile operations.

---

### `POST /auth/register`
**Purpose**: Create a new user account.  
**Auth**: Public  
**Used by**: Registration / Sign-up page.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "full_name": "John Doe"
}
```

**Response** `201 Created`
```json
{
  "id": "abc123",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user"
}
```

---

### `POST /auth/login`
**Purpose**: Authenticate a user and set the session cookie.  
**Auth**: Public  
**Used by**: Login page.  
**Note**: Sets an `access_token` httpOnly cookie automatically on success.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response** `200 OK`
```json
{ "access_token": "<jwt_token>" }
```

---

### `POST /auth/logout`
**Purpose**: Clear the session cookie and log the user out.  
**Auth**: Public  
**Used by**: Logout button in navbar / profile menu.

**Response** `200 OK`
```json
{ "message": "Logged out successfully" }
```

---

### `GET /auth/me` (Protected)
**Purpose**: Fetch the currently logged-in user's profile details.  
**Auth**: Required  
**Used by**: Profile page, navbar user display, any page that needs user info.

**Response** `200 OK`
```json
{
  "id": "abc123",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "9876543210",
  "gender": "male",
  "date_of_birth": "1995-04-15",
  "profile_photo_url": "http://localhost:8000/uploads/profile_photos/xyz.jpg",
  "role": "user"
}
```

---

### `PATCH /auth/me` (Protected)
**Purpose**: Update the user's profile fields (name, phone, gender, DOB etc.).  
**Auth**: Required  
**Used by**: Edit Profile page / form.  
**Note**: Only send fields you want to update (partial update supported).

**Request Body** *(any subset of fields)*
```json
{
  "full_name": "Jane Doe",
  "phone": "9876543210",
  "gender": "female",
  "date_of_birth": "1995-04-15"
}
```

**Response** `200 OK` — Updated user profile object.

---

### `POST /auth/me/photo` (Protected)
**Purpose**: Upload a profile photo (replaces old one).  
**Auth**: Required  
**Used by**: Profile photo upload button.  
**Note**: Accepts `multipart/form-data`, field name `file`. Max size 5 MB. Allowed: JPEG, PNG, WebP.

**Response** `200 OK` — Updated user profile with `profile_photo_url`.

---

### `POST /auth/change-password` (Protected)
**Purpose**: Change the user's password.  
**Auth**: Required  
**Used by**: Security / Password settings page.

**Request Body**
```json
{
  "current_password": "oldSecret",
  "new_password": "newSecret123"
}
```

**Response** `200 OK`
```json
{ "message": "Password changed successfully" }
```

---

## 3. Home / Discovery

Used to populate the landing page with featured content and statistics.

---

### `GET /packages/featured`
**Purpose**: Get highlighted tour packages for the homepage.  
**Auth**: Public  
**Used by**: Homepage — "Featured Tours" section.

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `limit` | int | `6` | Max number of packages to return |

**Response**: Array of package objects.

---

### `GET /stats`
**Purpose**: Get site-wide stats to display on the homepage.  
**Auth**: Public  
**Used by**: Homepage stats banner (e.g. "500+ guests", "120 tours completed").

**Response**
```json
{
  "total_guests": 524,
  "tours_completed": 120,
  "total_reviews": 87
}
```

---

### `GET /destinations`
**Purpose**: Get a sorted list of all unique destinations.  
**Auth**: Public  
**Used by**: Search filters, destination dropdowns, browse-by-destination page.

**Response**
```json
["Coorg", "Goa", "Munnar", "Ooty"]
```

---

### `GET /traveler-types`
**Purpose**: Get all available traveler type categories.  
**Auth**: Public  
**Used by**: Filter dropdowns (Family, Honeymoon, Solo, Senior).

**Response**
```json
["family", "honeymoon", "senior", "solo"]
```

---

## 4. Packages — `/packages`

Browse, search, and explore tour package details.

---

### `GET /packages`
**Purpose**: Get all available tour packages.  
**Auth**: Public  
**Used by**: All Packages / Browse page.

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `limit` | int | `20` | Max packages to return |

---

### `GET /packages/search`
**Purpose**: Search and filter packages by destination, budget, duration, and traveler type.  
**Auth**: Public  
**Used by**: Search bar and filter panel on the packages listing page.

| Query Param | Type | Description |
|-------------|------|-------------|
| `destination` | string | Partial / case-insensitive destination name |
| `budget_min` | float | Minimum price per person |
| `budget_max` | float | Maximum price per person |
| `days` | int | Exact number of trip days |
| `traveler_type` | string | `family`, `honeymoon`, `solo`, `senior` |
| `page` | int | Page number (default: 1) |
| `page_size` | int | Results per page (default: 10, max: 50) |

**Response**
```json
{
  "total": 45,
  "page": 1,
  "page_size": 10,
  "packages": [ ... ]
}
```

---

### `GET /packages/by-destination/{destination}`
**Purpose**: Get packages by destination name (partial match).  
**Auth**: Public  
**Used by**: Destination detail page, "More from Coorg" section.

---

### `GET /packages/by-type/{traveler_type}`
**Purpose**: Get packages filtered by traveler type.  
**Auth**: Public  
**Used by**: Category quick-links (e.g. "Family Tours", "Honeymoon Specials").

---

### `GET /packages/{package_id}`
**Purpose**: Get full details of a single tour package.  
**Auth**: Public  
**Used by**: Package detail / product page.

---

### `GET /packages/{package_id}/available-dates`
**Purpose**: Get future available travel dates for a package.  
**Auth**: Public  
**Used by**: Date picker on the booking form — only valid dates are shown.

**Response**
```json
{
  "package_id": "PKG-001",
  "available_dates": ["2025-10-15", "2025-11-01", "2025-12-20"]
}
```

---

### `GET /packages/{package_id}/rooms`
**Purpose**: Get room type options and pricing for a specific date.  
**Auth**: Public  
**Used by**: Room selection step in the booking form.

| Query Param | Type | Description |
|-------------|------|-------------|
| `travel_date` | date | Selected travel date (validated against available dates) |

**Response**
```json
{
  "package_id": "PKG-001",
  "travel_date": "2025-10-15",
  "room_options": [
    { "room_type": "standard", "price_per_night": 800, "description": "Standard room" },
    { "room_type": "deluxe", "price_per_night": 1500, "description": "Deluxe with view" }
  ]
}
```

---

### `GET /packages/{package_id}/reviews`
**Purpose**: Get user reviews for a specific package.  
**Auth**: Public  
**Used by**: Reviews section on the package detail page.

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `limit` | int | `20` | Max reviews to return |

---

### `POST /packages/{package_id}/reviews` (Protected)
**Purpose**: Submit a review for a package (not tied to a booking).  
**Auth**: Required  
**Used by**: Quick review form on the package page.

**Request Body**
```json
{
  "rating": 5,
  "comment": "Amazing experience!",
  "photos": []
}
```

**Response** `201 Created` — New review object.

---

## 5. Bookings — `/bookings`

Multi-step booking flow: initiate → save guests → confirm → (optionally cancel).

---

### `POST /bookings/initiate` (Protected)
**Purpose**: Create a new booking in `draft` status with full price breakdown.  
**Auth**: Required  
**Used by**: "Book Now" button — Step 1 of the booking flow.

**Request Body**
```json
{
  "package_id": "PKG-001",
  "travel_date": "2025-10-15",
  "adult_count": 2,
  "child_count": 1,
  "rooms": [
    { "room_type": "deluxe", "count": 1 }
  ]
}
```

**Response** `201 Created`
```json
{
  "booking_id": "BK-20251015-AB12",
  "status": "draft",
  "price_breakdown": {
    "price_per_person": 5000,
    "adult_count": 2,
    "price_per_child": 2500,
    "child_count": 1,
    "room_charges": 1500,
    "subtotal": 14000,
    "gst_amount": 700,
    "total": 14700
  }
}
```

---

### `PUT /bookings/{booking_id}/guests` (Protected)
**Purpose**: Save traveler / guest details for a draft booking.  
**Auth**: Required  
**Used by**: Step 2 — Guest details form.  
**Note**: Number of guests must exactly equal `adult_count`.

**Request Body**
```json
{
  "guests": [
    { "name": "John Doe", "age": 30, "id_type": "Aadhar", "id_number": "XXXX-XXXX-XXXX" },
    { "name": "Jane Doe", "age": 28, "id_type": "Passport", "id_number": "A1234567" }
  ]
}
```

---

### `POST /bookings/{booking_id}/confirm` (Protected)
**Purpose**: Confirm a draft booking (moves status `draft` → `confirmed`).  
**Auth**: Required  
**Used by**: "Confirm Booking" button — Step 3 / final step.  
**Note**: All guest details must be saved before confirming.

**Response** `200 OK` — Booking with `status: "confirmed"` and `confirmed_at`.

---

### `PUT /bookings/{booking_id}/payment-method` (Protected)
**Purpose**: Set the payment method on a confirmed booking.  
**Auth**: Required  
**Used by**: Payment selection step (after confirmation).

**Request Body**
```json
{ "payment_method": "UPI" }
```

---

### `GET /bookings/my` (Protected)
**Purpose**: Get all bookings for the logged-in user.  
**Auth**: Required  
**Used by**: My Bookings / Dashboard page.

| Query Param | Type | Description |
|-------------|------|-------------|
| `status` | string | Filter: `upcoming`, `past`, `cancelled`, `all` |

**Response**
```json
{
  "upcoming": [ { "booking_id": "...", "status": "confirmed", ... } ],
  "past": [ ... ]
}
```

---

### `GET /bookings/{booking_id}` (Protected)
**Purpose**: Get full details of a single booking.  
**Auth**: Required  
**Used by**: Booking detail / receipt page.

---

### `PATCH /bookings/{booking_id}/cancel` (Protected)
**Purpose**: Cancel a confirmed booking.  
**Auth**: Required  
**Used by**: "Cancel Booking" button on booking detail page.  
**Note**: Only `confirmed` bookings with a future travel date can be cancelled.

**Response** `200 OK` — Booking with `status: "cancelled"`.

---

## 6. Reviews — `/reviews`

Submit and manage reviews linked to a completed booking.

---

### `POST /reviews/{booking_id}` (Protected)
**Purpose**: Submit a review for a completed booking.  
**Auth**: Required  
**Used by**: "Write a Review" button in My Bookings (after travel date passes).  

**Rules:**
- Only your own bookings can be reviewed
- Travel date must already be in the past
- One review per booking — duplicates return `409 Conflict`

**Request Body**
```json
{
  "rating": 4,
  "comment": "Great experience, loved the hospitality!",
  "photos": []
}
```

**Response** `201 Created` — New review object.

---

### `GET /reviews/package/{package_id}`
**Purpose**: Get all reviews for a package with average rating.  
**Auth**: Public  
**Used by**: Reviews section on the package detail page.

**Response**
```json
{
  "package_id": "PKG-001",
  "total_reviews": 12,
  "average_rating": 4.5,
  "reviews": [ ... ]
}
```

---

### `DELETE /reviews/{review_id}` (Protected)
**Purpose**: Delete your own review.  
**Auth**: Required  
**Used by**: Delete button next to a user's own review.

**Response** `204 No Content`

---

## 7. AI Recommendations — `/recommend-packages`

Powered by MongoDB Atlas Vector Search and AI embeddings for natural language queries.

---

### `POST /recommend-packages`
**Purpose**: Get AI-powered package recommendations based on a free-text query.  
**Auth**: Public  
**Used by**: AI recommendation widget or chatbot input on the homepage / search page.

**Request Body**
```json
{
  "query": "I want a peaceful hill station trip for my honeymoon under 10000",
  "top_k": 5
}
```

**Response**
```json
{
  "query": "I want a peaceful hill station trip...",
  "recommendations": [
    {
      "package_id": "PKG-042",
      "title": "Coorg Honeymoon Escape",
      "score": 0.92
    }
  ]
}
```

---

## 8. Contact & Support

---

### `POST /contact`
**Purpose**: Submit a contact / enquiry form.  
**Auth**: Public  
**Used by**: Contact Us page form.

**Request Body**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "9876543210",
  "message": "I want to know more about the Coorg package."
}
```

**Response** `201 Created`
```json
{ "message": "Your enquiry has been submitted. We will get back to you soon!" }
```

---

### `GET /support/whatsapp`
**Purpose**: Get a pre-filled WhatsApp chat link for customer support.  
**Auth**: Public  
**Used by**: "Chat on WhatsApp" button in the site footer or help page.

**Response**
```json
{
  "whatsapp_url": "https://wa.me/919999999999?text=Hi, I need help with Sahyadri Tours and Travels.",
  "phone": "919999999999"
}
```

---

## 9. Booking Flow (Step-by-step)

Complete sequence of API calls for a user to book a tour:

```
Step 1 — Browse packages
         GET /packages  OR  GET /packages/search

Step 2 — View package details
         GET /packages/{package_id}

Step 3 — Check available travel dates
         GET /packages/{package_id}/available-dates

Step 4 — Choose room type
         GET /packages/{package_id}/rooms?travel_date=YYYY-MM-DD

Step 5 — Initiate booking (creates draft + price breakdown)
         POST /bookings/initiate

Step 6 — Fill in guest/traveler details
         PUT /bookings/{booking_id}/guests

Step 7 — Confirm the booking
         POST /bookings/{booking_id}/confirm

Step 8 — (Optional) Set payment method
         PUT /bookings/{booking_id}/payment-method

Step 9 — View booking receipt / confirmation
         GET /bookings/{booking_id}

Step 10 — (After travel date) Write a review
          POST /reviews/{booking_id}
```

---

*Generated from source: `app/modules/*/router.py`*
