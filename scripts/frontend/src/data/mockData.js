const IMG = {
  kerala:      '/images/kerala_houseboat_sunset.jpg',
  munnar:      '/images/darjeeling_tea_gardens.jpg',
  andaman:     '/images/tropical_white_sand_beach.jpg',
  jaipur:      '/images/jodhpur_mehrangarh_fort.jpg',
  pondicherry: '/images/tropical_white_sand_beach.jpg',
  ship:        '/images/goa_baga_sunset.jpg',
  mountains:   '/images/solang_valley_manali.jpg',
  manali:      '/images/solang_valley_manali.jpg',
  kashmir:     '/images/kashmir_dal_lake.jpg',
  hampi:       '/images/hampi_stone_chariot.jpg',
  konark:      '/images/konark_sun_temple.jpg',
  ladakh:      '/images/pangong_lake_ladakh.jpg',
  mysore:      '/images/mysore_palace_illuminated.jpg',
  lonavala:    '/images/lonavala_monsoon_waterfall.jpg',
  ooty:        '/images/ooty_nilgiri_toy_train.jpg',
  northeast:   '/images/northeast_living_root_bridge.jpg',
  jodhpur:     '/images/jodhpur_mehrangarh_fort.jpg',
  rann:        '/images/rann_of_kutch_desert.jpg',
  sundarbans:  '/images/sundarbans_wildlife_safari.jpg',
  spiti:       '/images/spiti_valley_chandratal.jpg',
  rishikesh:   '/images/rishikesh_laxman_jhula.jpg',
  norway:      '/images/coorg_plantation_estate.jpg',
  lake:        '/images/pangong_lake_ladakh.jpg',
  teagarden:   '/images/darjeeling_tea_gardens.jpg',
  sunrise:     '/images/amritsar_golden_temple.jpg',
  goa:         '/images/goa_baga_sunset.jpg',
  coorg:       '/images/coorg_plantation_estate.jpg',
}





export const destinations = [
  { id: 1, name: 'Pondicherry', rank: 1, image: IMG.pondicherry },
  { id: 2, name: 'Kerala',      rank: 2, image: IMG.kerala },
  { id: 3, name: 'Jaipur',      rank: 3, image: IMG.jaipur },
  { id: 4, name: 'Andaman',     rank: 4, image: IMG.andaman },
  { id: 5, name: 'Munnar',      rank: 5, image: IMG.munnar },
]

export const packages = [
  {
    id: 1,
    title: 'Mystic Munnar Explorer',
    duration: '3 Days, 2 Nights',
    rating: 4.8,
    reviewCount: 124,
    pricePerPerson: 12499,
    destination: 'Kerala',
    image: IMG.munnar,
    images: [IMG.munnar, IMG.teagarden, IMG.kerala],
    nextDeparture: 'Oct 15 – Oct 17',
    tag: 'Likely to sell out',
    activity: 'Trekking',
    description: `Experience the ethereal beauty of Munnar's rolling hills and expansive tea plantations. This curated journey perfectly balances adventure, culture, and relaxation. Wake up to misty mornings and go to sleep under a canopy of stars.`,
    highlights: [
      'Morning pick-up from Kochi Airport/Railway Station',
      'Check-in at the resort and traditional welcome',
      'Afternoon guided tea plantation walk and tasting',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Tea Garden Walk',
        image: IMG.teagarden,
        description: 'Welcome to Munnar! After settling into your resort, explore the iconic tea gardens.',
        activities: [
          'Morning pick-up from Kochi Airport/Railway Station',
          'Check-in at the resort and traditional welcome',
          'Afternoon guided tea plantation walk and tasting',
        ],
      },
      {
        day: 2,
        title: 'Eravikulam & Mattupetty',
        image: IMG.kerala,
        description: 'A full day of exploration starting with the famous Eravikulam National Park.',
        activities: [
          'Trek in Eravikulam National Park',
          'Visit Mattupetty Dam and Indo-Swiss Farm',
          'Evening leisure at Echo Point',
        ],
      },
      {
        day: 3,
        title: 'Top Station & Departure',
        image: IMG.munnar,
        description: 'Visit the breathtaking Top Station before your drop-off.',
        activities: [
          'Early morning visit to Top Station',
          'Sunrise photography session',
          'Drop-off at Kochi Airport/Railway Station',
        ],
      },
    ],
    reviews: [
      {
        id: 1, name: 'Rahul Sharma', date: 'Oct 12, 2023', rating: 5,
        text: 'Absolutely stunning experience. The tea gardens were breathtaking and the guide was very knowledgeable. Highly recommend this package for a serene getaway.',
      },
      {
        id: 2, name: 'Priya Patel', date: 'Sep 28, 2023', rating: 4,
        text: 'Great trip overall. The accommodation was comfortable and the food was delicious. Would definitely book again.',
      },
      {
        id: 3, name: 'Amit Singh', date: 'Sep 10, 2023', rating: 5,
        text: 'One of the best travel experiences I have had. Everything was perfectly organized. The guides were professional and friendly.',
      },
    ],
    ratingBreakdown: { 5: 78, 4: 32, 3: 10, 2: 5, 1: 3 },
    totalReviews: 128,
  },
  {
    id: 2,
    title: 'Andaman Escapade',
    duration: '6 Days, 5 Nights',
    rating: 4.9,
    reviewCount: 98,
    pricePerPerson: 24999,
    destination: 'Andaman',
    image: IMG.andaman,
    images: [IMG.andaman, IMG.ship, IMG.norway],
    nextDeparture: 'Nov 12 – Nov 18',
    tag: null,
    activity: 'Beach',
    description: 'Dive into the crystal-clear waters of the Andaman Sea. Explore pristine beaches, coral reefs, and a rich history.',
    highlights: [
      'Scuba diving and snorkeling at Havelock Island',
      'Cellular Jail historical tour',
      'Beach bonfire and seafood dinner',
    ],
    itinerary: [
      {
        day: 1, title: 'Arrival at Port Blair', image: IMG.andaman,
        description: 'Arrive at Port Blair and check in to your hotel.',
        activities: ['Airport pickup', 'Hotel check-in', 'Cellular Jail light and sound show'],
      },
      {
        day: 2, title: 'Havelock Island', image: IMG.ship,
        description: 'Ferry to Havelock Island, the jewel of Andaman.',
        activities: ['Ferry to Havelock', 'Radhanagar Beach visit', 'Snorkeling session'],
      },
    ],
    reviews: [
      {
        id: 1, name: 'Sneha Rao', date: 'Nov 5, 2023', rating: 5,
        text: 'Breathtaking experience! The beaches were pristine and the water was crystal clear.',
      },
    ],
    ratingBreakdown: { 5: 70, 4: 18, 3: 6, 2: 2, 1: 2 },
    totalReviews: 98,
  },
  {
    id: 3,
    title: 'Uttarakhand Group Trek',
    duration: '5 Days, 4 Nights',
    rating: 4.9,
    reviewCount: 87,
    pricePerPerson: 8999,
    destination: 'Uttarakhand',
    image: IMG.mountains,
    images: [IMG.mountains, IMG.norway, IMG.lake],
    nextDeparture: 'Dec 01 – Dec 05',
    tag: null,
    activity: 'Trekking',
    description: 'Embark on a thrilling group trek through the majestic Himalayan terrain of Uttarakhand.',
    highlights: ['Guided group trek', 'Camping under stars', 'Local cuisine experience'],
    itinerary: [
      {
        day: 1, title: 'Arrival at Rishikesh', image: IMG.mountains,
        description: 'Arrive and meet your group at Rishikesh.',
        activities: ['Group assembly', 'Trek briefing', 'Evening Ganga Aarti'],
      },
      {
        day: 2, title: 'Valley of Flowers Trek', image: IMG.norway,
        description: 'A stunning trek through colourful valleys.',
        activities: ['6 km trek', 'Wildlife spotting', 'Camp dinner'],
      },
    ],
    reviews: [],
    ratingBreakdown: { 5: 60, 4: 20, 3: 5, 2: 1, 1: 1 },
    totalReviews: 87,
  },
  {
    id: 4,
    title: 'Dehradoon Full Week Trek with Night Camping',
    duration: '7 Days, 6 Nights',
    rating: 4.9,
    reviewCount: 62,
    pricePerPerson: 8999,
    destination: 'Dehradoon',
    image: IMG.norway,
    images: [IMG.norway, IMG.mountains, IMG.lake],
    nextDeparture: 'Dec 10 – Dec 17',
    tag: null,
    activity: 'Trekking',
    description: "A full week of adventure trekking through Dehradoon's scenic trails with night camping under the stars.",
    highlights: ['Night camping', 'Waterfall treks', 'Village cultural experience'],
    itinerary: [
      {
        day: 1, title: 'Arrival at Dehradoon', image: IMG.norway,
        description: 'Arrive and settle in.',
        activities: ['Pickup from Dehradoon Station', 'Camp setup', 'Orientation walk'],
      },
    ],
    reviews: [],
    ratingBreakdown: { 5: 40, 4: 15, 3: 5, 2: 1, 1: 1 },
    totalReviews: 62,
  },
  {
    id: 5,
    title: 'Majestic Kerala Tour',
    duration: '6 Days, 5 Nights',
    rating: 4.7,
    reviewCount: 110,
    pricePerPerson: 18999,
    destination: 'Kerala',
    image: IMG.kerala,
    images: [IMG.kerala, IMG.munnar, IMG.teagarden],
    nextDeparture: 'Nov 12 – Nov 18',
    tag: 'Likely to sell out',
    activity: 'Culture',
    description: "Experience the backwaters, hill stations, and beaches of God's own country.",
    highlights: ['Houseboat stay in Alleppey backwaters', 'Munnar tea garden tour', 'Kovalam beach sunset'],
    itinerary: [
      {
        day: 1, title: 'Arrival at Kochi', image: IMG.kerala,
        description: 'Arrive at Kochi and check in.',
        activities: ['Airport pickup', 'Hotel check-in', 'Fort Kochi heritage walk'],
      },
    ],
    reviews: [],
    ratingBreakdown: { 5: 80, 4: 22, 3: 5, 2: 2, 1: 1 },
    totalReviews: 110,
  },
]

export const bookings = [
  {
    id: 'BK-8902',
    packageId: 1,
    packageTitle: 'Mystic Munnar Explorer',
    image: IMG.munnar,
    dates: 'Oct 15 – Oct 17, 2024',
    dateRange: 'Nov 12 – Nov 18, 2024',
    dateShort: '15 Oct 2024',
    guests: 2,
    guestLabel: '2 Adults, 0 Children',
    status: 'confirmed',
    statusLabel: 'CONFIRMED',
    step: null,
    stepLabel: null,
    placedOn: 'Oct 05, 2024',
    travelers: [
      { name: 'Rajesh Kumar', role: 'Primary Contact', age: 34 },
      { name: 'Priya Kumar', role: 'Adult', age: 30 },
    ],
    baseCost: 45000,
    taxes: 2250,
    totalCost: 47250,
    tokenPaid: 5000,
    bookingRef: 'SAH-8942-KRL',
    timeline: [
      { label: 'Enquiry sent', date: 'Oct 05, 10:23 AM', done: true },
      { label: 'Token paid', date: '₹5,000 received on Oct 05', done: true },
      { label: 'Expert call scheduled', date: 'Pending', done: false },
    ],
  },
  {
    id: 'BK-8903',
    packageId: 2,
    packageTitle: 'Andaman Escapade',
    image: IMG.andaman,
    dates: 'Nov 12 – Nov 18, 2024',
    dateRange: 'Nov 12 – Nov 18, 2024',
    dateShort: '12 Nov 2024',
    guests: 4,
    guestLabel: '4 Adults, 0 Children',
    status: 'token_paid',
    statusLabel: 'TOKEN PAID',
    step: 1,
    stepLabel: 'Step 1 of 3',
    placedOn: 'Oct 10, 2024',
    travelers: [
      { name: 'Arjun Mehta', role: 'Primary Contact', age: 28 },
      { name: 'Kavya Mehta', role: 'Adult', age: 26 },
      { name: 'Suresh Mehta', role: 'Adult', age: 55 },
      { name: 'Lakshmi Mehta', role: 'Adult', age: 52 },
    ],
    baseCost: 99996,
    taxes: 4999,
    totalCost: 104995,
    tokenPaid: 5000,
    bookingRef: 'SAH-9103-AND',
    timeline: [
      { label: 'Enquiry sent', date: 'Oct 10, 09:15 AM', done: true },
      { label: 'Token paid', date: '₹5,000 received on Oct 10', done: true },
      { label: 'Expert call scheduled', date: 'Pending', done: false },
    ],
  },
]

export const pastBookings = [
  {
    id: 'BK-7712',
    packageId: 5,
    packageTitle: 'Majestic Kerala Tour',
    image: IMG.kerala,
    dates: 'Aug 05 – Aug 10, 2024',
    dateRange: 'Aug 05 – Aug 10, 2024',
    dateShort: '05 Aug 2024',
    guests: 2,
    guestLabel: '2 Adults, 0 Children',
    status: 'completed',
    statusLabel: 'COMPLETED',
    step: null,
    stepLabel: null,
    placedOn: 'Jul 20, 2024',
    travelers: [],
    baseCost: 37998,
    taxes: 1900,
    totalCost: 39898,
    tokenPaid: 5000,
    bookingRef: 'SAH-7712-KRL',
    timeline: [
      { label: 'Enquiry sent', date: 'Jul 20, 11:00 AM', done: true },
      { label: 'Token paid', date: '₹5,000 received on Jul 20', done: true },
      { label: 'Trip completed', date: 'Aug 10, 2024', done: true },
    ],
  },
]

export const stats = [
  { value: '9.8L+', label: 'Guests' },
  { value: '77k+', label: 'Tours' },
  { value: '15+', label: 'Years' },
]

export const categories = ['Family', 'Senior', 'Honeymoon', 'Solo', 'Adventure', 'Spiritual']

export const filterOptions = {
  dates:    ['Any Date', 'This Week', 'This Month', 'Next 3 Months'],
  activity: ['Any Activity', 'Trekking', 'Beach', 'Culture', 'Adventure', 'Wildlife'],
  duration: ['Any Duration', '1-3 Days', '4-6 Days', '7+ Days'],
  location: ['Any Location', 'Kerala', 'Andaman', 'Uttarakhand', 'Rajasthan', 'Goa'],
}

export const user = {
  name: 'GUEST NAME',
  phone: '+91 98765 43210',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sahydari',
}

export const faqs = [
  {
    id: 1,
    question: 'How do I cancel my booking?',
    answer: 'You can cancel your booking by going to Bookings > Select your booking > Cancel. Cancellations made 7+ days before departure are fully refunded.',
  },
  {
    id: 2,
    question: 'Can I modify my booking after confirmation?',
    answer: 'Yes, bookings can be modified up to 14 days before departure. Please contact our support team or chat on WhatsApp for assistance.',
  },
  {
    id: 3,
    question: 'How do payments work for bookings?',
    answer: 'Pay 50% at the time of booking to reserve your spot, and the remaining 50% to confirm 100% of your booking before departure.',
  },
]

