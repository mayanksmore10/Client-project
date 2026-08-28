/**
 * Centralized API service for Sahyadri Travels frontend.
 * All fetch calls go through here. Base URL read from VITE_API_URL env var.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Local images from public/images/ ─────────────────────────────────────────
// Files are in public/images/ and served as static URLs by Vite
const LOCAL_IMAGES = {
  goa:         '/images/goa_baga_sunset.jpg',
  baga:        '/images/goa_baga_sunset.jpg',
  sunset:      '/images/goa_baga_sunset.jpg',
  tropical:    '/images/tropical_white_sand_beach.jpg',
  andaman:     '/images/tropical_white_sand_beach.jpg',
  island:      '/images/tropical_white_sand_beach.jpg',
  beach:       '/images/tropical_white_sand_beach.jpg',
  amritsar:    '/images/amritsar_golden_temple.jpg',
  golden:      '/images/amritsar_golden_temple.jpg',
  temple:      '/images/amritsar_golden_temple.jpg',
  darjeeling:  '/images/darjeeling_tea_gardens.jpg',
  tiger:       '/images/darjeeling_tea_gardens.jpg',
  tea:         '/images/darjeeling_tea_gardens.jpg',
  coorg:       '/images/coorg_plantation_estate.jpg',
  coffee:      '/images/coorg_plantation_estate.jpg',
  plantation:  '/images/coorg_plantation_estate.jpg',
  estate:      '/images/coorg_plantation_estate.jpg',
  solang:      '/images/solang_valley_manali.jpg',
  manali:      '/images/solang_valley_manali.jpg',
  paragliding: '/images/solang_valley_manali.jpg',
  houseboat:   '/images/kerala_houseboat_sunset.jpg',
  kerala:      '/images/kerala_houseboat_sunset.jpg',
  backwaters:  '/images/kerala_houseboat_sunset.jpg',
  kashmir:     '/images/kashmir_dal_lake.jpg',
  dal:         '/images/kashmir_dal_lake.jpg',
  shikara:     '/images/kashmir_dal_lake.jpg',
  srinagar:    '/images/kashmir_dal_lake.jpg',
  hampi:       '/images/hampi_stone_chariot.jpg',
  chariot:     '/images/hampi_stone_chariot.jpg',
  konark:      '/images/konark_sun_temple.jpg',
  puri:        '/images/konark_sun_temple.jpg',
  ladakh:      '/images/pangong_lake_ladakh.jpg',
  pangong:     '/images/pangong_lake_ladakh.jpg',
  leh:         '/images/pangong_lake_ladakh.jpg',
  mysore:      '/images/mysore_palace_illuminated.jpg',
  lonavala:    '/images/lonavala_monsoon_waterfall.jpg',
  waterfall:   '/images/lonavala_monsoon_waterfall.jpg',
  ooty:        '/images/ooty_nilgiri_toy_train.jpg',
  coonoor:     '/images/ooty_nilgiri_toy_train.jpg',
  toy:         '/images/ooty_nilgiri_toy_train.jpg',
  northeast:   '/images/northeast_living_root_bridge.jpg',
  meghalaya:   '/images/northeast_living_root_bridge.jpg',
  shillong:    '/images/northeast_living_root_bridge.jpg',
  root:        '/images/northeast_living_root_bridge.jpg',
  jodhpur:     '/images/jodhpur_mehrangarh_fort.jpg',
  mehrangarh:  '/images/jodhpur_mehrangarh_fort.jpg',
  fort:        '/images/jodhpur_mehrangarh_fort.jpg',
  rajasthan:   '/images/jodhpur_mehrangarh_fort.jpg',
  rann:        '/images/rann_of_kutch_desert.jpg',
  kutch:       '/images/rann_of_kutch_desert.jpg',
  desert:      '/images/rann_of_kutch_desert.jpg',
  sundarbans:  '/images/sundarbans_wildlife_safari.jpg',
  safari:      '/images/sundarbans_wildlife_safari.jpg',
  mangrove:    '/images/sundarbans_wildlife_safari.jpg',
  spiti:       '/images/spiti_valley_chandratal.jpg',
  chandratal:  '/images/spiti_valley_chandratal.jpg',
  kaza:        '/images/spiti_valley_chandratal.jpg',
  rishikesh:   '/images/rishikesh_laxman_jhula.jpg',
  haridwar:    '/images/rishikesh_laxman_jhula.jpg',
  ganga:       '/images/rishikesh_laxman_jhula.jpg',
  jhula:       '/images/rishikesh_laxman_jhula.jpg',
  taj:         '/images/Golden Triangle Classic - Taj Mahal Sunrise.png',
  delhi:       '/images/Golden Triangle Classic - Taj Mahal Sunrise.png',
  agra:        '/images/Golden Triangle Classic - Taj Mahal Sunrise.png',
  shimla:      '/images/Himalayan Manali-Shimla Retreat - Solang Valley.png',
  himalaya:    '/images/Himalayan Manali-Shimla Retreat - Solang Valley.png',
  himachal:    '/images/solang_valley_manali.jpg',
}





const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80'

/** Pick a local image based on destination/title keywords, else use fallback */
function resolveImage(pkg) {
  const text = `${pkg.title || ''} ${pkg.destination || ''}`.toLowerCase()
  for (const [keyword, url] of Object.entries(LOCAL_IMAGES)) {
    if (text.includes(keyword)) return url
  }
  return FALLBACK_IMG
}

// ─── Internal fetch helper ─────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('access_token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch (_) { /* ignore parse errors */ }
    throw new Error(detail)
  }

  // 204 No Content — return null
  if (res.status === 204) return null
  return res.json()
}

// ─── Data normalizer ───────────────────────────────────────────────────────────
/**
 * Maps the API snake_case package shape to the camelCase shape
 * that all existing components already expect.
 */
export function normalizePackage(p) {
  // If the DB has images, use them; otherwise pick a local image by keyword
  const dbImages = Array.isArray(p.images) && p.images.length ? p.images : null
  const localImg = resolveImage(p)
  const images   = dbImages || [localImg]
  return {
    // keep both forms so callers can use either
    id: p.package_id,
    package_id: p.package_id,
    title: p.title || '',
    destination: p.destination || '',
    duration: `${p.days} Day${p.days !== 1 ? 's' : ''}, ${p.nights} Night${p.nights !== 1 ? 's' : ''}`,
    days: p.days,
    nights: p.nights,
    pricePerPerson: p.price_per_person,
    price_per_person: p.price_per_person,
    price_per_child: p.price_per_child || 0,
    gst_included: p.gst_included || false,
    image: images[0],
    images,
    rating: 0,         // loaded separately via reviews API
    reviewCount: 0,    // loaded separately
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    tag: Array.isArray(p.traveler_type) && p.traveler_type.length ? null : null,
    highlights: p.highlights || [],
    itinerary: Array.isArray(p.itinerary)
      ? p.itinerary.map((day, i) => ({
          day: i + 1,
          title: day.title || `Day ${i + 1}`,
          image: images[i % images.length],
          description: day.description || '',
          activities: day.activities || [],
        }))
      : [],
    description: p.description || '',
    available_dates: p.available_dates || [],
    room_options: p.room_options || [],
    traveler_type: p.traveler_type || [],
    reviews: [],
  }
}

// ─── Normalize a recommendation result ────────────────────────────────────────
export function normalizeRecommendation(r) {
  // recommendation items may be partial package objects
  return normalizePackage({
    package_id: r.package_id,
    title: r.title || '',
    destination: r.destination || '',
    days: r.days || 1,
    nights: r.nights || 1,
    price_per_person: r.price_per_person || 0,
    images: r.images || [],
    highlights: r.highlights || [],
    itinerary: r.itinerary || [],
    description: r.description || '',
    available_dates: r.available_dates || [],
    room_options: r.room_options || [],
    traveler_type: r.traveler_type || [],
    ...r,
  })
}

// ─── Booking normalizer ────────────────────────────────────────────────────────
export function normalizeBooking(b) {
  const travelDate = b.travel_date ? new Date(b.travel_date) : null
  const dateStr = travelDate && !isNaN(travelDate)
    ? travelDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''
  const createdDate = b.created_at ? new Date(b.created_at) : null
  const createdStr = createdDate && !isNaN(createdDate)
    ? createdDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''
  const confirmedAt = b.confirmed_at ? new Date(b.confirmed_at) : null
  const placedOn = confirmedAt && !isNaN(confirmedAt)
    ? confirmedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : createdStr

  const totalCost = b.price_breakdown?.total || b.total || b.totalCost || 0
  let paidAmount = b.paid_amount || b.paidAmount || 0
  if (!paidAmount || paidAmount <= 0) {
    if (b.status === 'token_paid') {
      paidAmount = totalCost / 2
    } else {
      paidAmount = totalCost
    }
  }

  const isRegistration = b.status === 'token_paid' || (totalCost > 0 && paidAmount < totalCost)
  const pendingAmount = isRegistration ? Math.max(0, totalCost - paidAmount) : 0

  return {
    id: b.booking_id,
    booking_id: b.booking_id,
    packageId: b.package_id,
    packageTitle: b.package_title || b.packageTitle || 'Package',
    package_title: b.package_title || b.packageTitle || 'Package',
    destination: b.destination || '',
    image: resolveImage({ title: b.package_title || b.packageTitle, destination: b.destination }),
    dates: dateStr,
    dateRange: dateStr,
    dateShort: dateStr,
    travel_date: b.travel_date,
    created_at: b.created_at,
    placedOn,
    paidAmount,
    pendingAmount,
    isRegistration,
    total: totalCost,
    totalCost,
    guests: (b.adult_count || 0) + (b.child_count || 0),
    guestLabel: `${b.adult_count || 0} Adult${(b.adult_count || 0) !== 1 ? 's' : ''}${b.child_count > 0 ? `, ${b.child_count} Child${b.child_count !== 1 ? 'ren' : ''}` : ''}`,
    adult_count: b.adult_count || 0,
    child_count: b.child_count || 0,
    status: b.status || 'draft',
    statusLabel: (b.status || 'draft').toUpperCase(),
    travelers: Array.isArray(b.guests) ? b.guests.map(g => ({
      name: g.name || '',
      role: 'Adult',
      age: g.age || '',
    })) : [],
    taxes: b.price_breakdown?.gst_amount || 0,
    tokenPaid: paidAmount,
    bookingRef: b.booking_id,
    payment_method: b.payment_method || null,
    price_breakdown: b.price_breakdown || null,
    timeline: [
      { label: 'Booking initiated', date: placedOn || 'Just now', done: true },
      { label: 'Booking confirmed', date: b.status === 'confirmed' ? placedOn : 'Pending', done: b.status === 'confirmed' || b.status === 'completed' },
      { label: 'Trip completed', date: b.status === 'completed' ? dateStr : 'Upcoming', done: b.status === 'completed' },
    ],
  }
}


// ─── Home / Discovery ──────────────────────────────────────────────────────────

export async function getFeaturedPackages(limit = 6) {
  const data = await apiFetch(`/packages/featured?limit=${limit}`)
  return (data || []).map(normalizePackage)
}

export async function getStats() {
  return apiFetch('/stats')
}

export async function getDestinations() {
  return apiFetch('/destinations')
}

export async function getTravelerTypes() {
  return apiFetch('/traveler-types')
}

// ─── Packages ─────────────────────────────────────────────────────────────────

export async function getPackages(limit = 20) {
  const data = await apiFetch(`/packages?limit=${limit}`)
  return (data || []).map(normalizePackage)
}

export async function searchPackages({ destination, budget_min, budget_max, days, traveler_type, page = 1, page_size = 20 } = {}) {
  const params = new URLSearchParams()
  if (destination) params.set('destination', destination)
  if (budget_min !== undefined && budget_min !== '') params.set('budget_min', budget_min)
  if (budget_max !== undefined && budget_max !== '') params.set('budget_max', budget_max)
  if (days !== undefined && days !== '') params.set('days', days)
  if (traveler_type) params.set('traveler_type', traveler_type)
  params.set('page', page)
  params.set('page_size', page_size)

  const data = await apiFetch(`/packages/search?${params.toString()}`)
  return {
    total: data?.total || 0,
    page: data?.page || 1,
    page_size: data?.page_size || 20,
    packages: (data?.packages || []).map(normalizePackage),
  }
}

export async function getPackage(packageId) {
  const data = await apiFetch(`/packages/${packageId}`)
  return normalizePackage(data)
}

export async function getAvailableDates(packageId) {
  const data = await apiFetch(`/packages/${packageId}/available-dates`)
  return data?.available_dates || []
}

export async function getRoomOptions(packageId, travelDate) {
  const params = travelDate ? `?travel_date=${travelDate}` : ''
  const data = await apiFetch(`/packages/${packageId}/rooms${params}`)
  return data?.room_options || []
}

export async function getPackageReviews(packageId, limit = 20) {
  return apiFetch(`/packages/${packageId}/reviews?limit=${limit}`)
}

export async function getPackageReviewsSummary(packageId) {
  return apiFetch(`/reviews/package/${packageId}`)
}

// ─── AI Recommendations ───────────────────────────────────────────────────────

export async function recommendPackages(query, topK = 5) {
  const data = await apiFetch('/recommend-packages', {
    method: 'POST',
    body: JSON.stringify({ query, top_k: topK }),
  })
  return (data?.packages || []).map(normalizeRecommendation)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (data?.access_token) {
    localStorage.setItem('access_token', data.access_token)
  }
  return data
}

export async function register(email, password, full_name) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  })
}

export async function logout() {
  await apiFetch('/auth/logout', { method: 'POST' })
  localStorage.removeItem('access_token')
  localStorage.removeItem('auth_user')
}

export async function getMe() {
  return apiFetch('/auth/me')
}

export async function updateProfile(data) {
  return apiFetch('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function uploadProfilePhoto(file) {
  const token = localStorage.getItem('access_token')
  const formData = new FormData()
  formData.append('file', file)

  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const res = await fetch(`${BASE}/auth/me/photo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    credentials: 'include',
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch (_) {}
    throw new Error(detail)
  }

  return res.json()
}


export async function changePassword(current_password, new_password) {
  return apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  })
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function getMyBookings(status = 'all') {
  const data = await apiFetch(`/bookings/my?status=${status}`)
  const upcoming = (data?.upcoming || []).map(normalizeBooking)
  const past = (data?.past || []).map(normalizeBooking)
  return { upcoming, past }
}

export async function getBooking(bookingId) {
  const data = await apiFetch(`/bookings/${bookingId}`)
  return normalizeBooking(data)
}

export async function initiateBooking(payload) {
  const data = await apiFetch('/bookings/initiate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return normalizeBooking(data)
}

export async function confirmBooking(bookingId, paidAmount) {
  const data = await apiFetch(`/bookings/${bookingId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ paid_amount: paidAmount }),
  })
  return normalizeBooking(data)
}


export async function cancelBooking(bookingId) {
  const data = await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PATCH' })
  return normalizeBooking(data)
}

export async function submitContact(payload) {
  return apiFetch('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function submitCustomEnquiry(payload) {
  return apiFetch('/contact/custom-enquiry', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getCustomEnquiries() {
  return apiFetch('/contact/custom-enquiries')
}

export async function getWhatsAppLink() {
  return apiFetch('/support/whatsapp')
}

export async function submitTripReview(bookingId, rating, comment) {
  return apiFetch(`/reviews/${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  })
}


