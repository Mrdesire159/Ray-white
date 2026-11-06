import { Property } from '../types/property';

export const PROPERTIES: Property[] = [
  // 1. BOWRAL - SOLAR COUNTRY ESTATE
  {
    id: 'rw-house-2',
    title: 'The Solar Country Estate: Sprawling Acreage Sanctuary with Lap Pool',
    address: '88 Ridgeview Drive',
    suburb: 'Bowral',
    state: 'NSW',
    postcode: '2576',
    status: 'sale',
    type: 'House',
    price: 2380000,
    priceDisplay: '$2,380,000',
    originalPrice: 3450000,
    originalPriceDisplay: '$3,450,000',
    priceReduced: true,
    savingsAmount: 1070000,
    sellingPrice: 2380000,
    rentagePricePerWeek: 990,
    rentagePricePerMonth: 4290,
    grossYield: '2.2%',
    bedrooms: 5,
    bathrooms: 3,
    carSpaces: 4,
    landSizeM2: 22000,
    buildingSizeM2: 460,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Reduced by over $1,000,000 below actual market appraisal for a quick sale. Set upon 5.4 flat manicured acres against a dense eucalyptus forest, this residence boasts an extensive rooftop solar array, 12m sparkling lap pool, triple living pavilions, and private orchard groves.',
    features: ['Pool', 'Garage', 'Garden', 'Air Conditioning', 'Fireplace'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '12:30 PM - 1:15 PM', formattedDateTime: '2026-10-24 12:30 PM' }
    ],
    agentId: 'agent-1',
    auctionDate: 'Auction: Saturday 21 November, 2:00 PM',
    councilRatesPerQuarter: 710,
    yearBuilt: 2018,
    coords: { lat: -34.4792, lng: 150.4181 }
  },

  // 2. RED HILL - CHARCOAL PAVILION
  {
    id: 'rw-house-3',
    title: 'The Charcoal Pavilion: Architectural Bushland Retreat & Sunken Firepit',
    address: '23 Eucalyptus Way',
    suburb: 'Red Hill',
    state: 'VIC',
    postcode: '3937',
    status: 'sale',
    type: 'House',
    price: 2890000,
    priceDisplay: '$2,890,000',
    originalPrice: 4200000,
    originalPriceDisplay: '$4,200,000',
    priceReduced: true,
    savingsAmount: 1310000,
    sellingPrice: 2890000,
    rentagePricePerWeek: 1290,
    rentagePricePerMonth: 5590,
    grossYield: '2.4%',
    bedrooms: 4,
    bathrooms: 3,
    carSpaces: 3,
    landSizeM2: 8400,
    buildingSizeM2: 390,
    images: [
      'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Priced over 31% below replacement value to attract astute buyers. A sculptural dark timber and glass architectural statement nestled in native bushland. Features a heated pool, sunken circular outdoor firepit with bench seating, polished concrete floors, and double-glazed walls.',
    features: ['Pool', 'Garage', 'Garden', 'Air Conditioning', 'Fireplace', 'Balcony'],
    inspections: [
      { date: 'Sunday, 25 Oct', time: '1:00 PM - 1:45 PM', formattedDateTime: '2026-10-25 1:00 PM' }
    ],
    agentId: 'agent-1',
    auctionDate: 'Auction: Saturday 28 November, 11:00 AM',
    councilRatesPerQuarter: 850,
    yearBuilt: 2021,
    coords: { lat: -38.3667, lng: 145.0167 }
  },

  // 3. SOUTHERN HIGHLANDS - DORMER RIDGE
  {
    id: 'rw-house-4',
    title: 'Dormer Ridge: Grand Gabled Country Manor with Organic Gardens',
    address: '50 Heritage Lane',
    suburb: 'Southern Highlands',
    state: 'NSW',
    postcode: '2575',
    status: 'sale',
    type: 'House',
    price: 2650000,
    priceDisplay: '$2,650,000',
    originalPrice: 3800000,
    originalPriceDisplay: '$3,800,000',
    priceReduced: true,
    savingsAmount: 1150000,
    sellingPrice: 2650000,
    rentagePricePerWeek: 1150,
    rentagePricePerMonth: 4983,
    grossYield: '2.3%',
    bedrooms: 5,
    bathrooms: 4,
    carSpaces: 4,
    landSizeM2: 14200,
    buildingSizeM2: 480,
    images: [
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: false,
    description: 'Reduced to sell fast with vendor committed elsewhere. An aerial-worthy estate with distinctive green gabled roofline and dormer windows. Boasts landscaped organic vegetable beds, asphalt turning circle, expansive cedar deck, and private mature trees.',
    features: ['Garage', 'Garden', 'Fireplace', 'Balcony', 'Air Conditioning'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '2:15 PM - 3:00 PM', formattedDateTime: '2026-10-24 2:15 PM' }
    ],
    agentId: 'agent-2',
    councilRatesPerQuarter: 790,
    yearBuilt: 2015,
    coords: { lat: -34.4833, lng: 150.4000 }
  },

  // 4. BYRON BAY HINTERLAND - MID-CENTURY PAVILION (RENT)
  {
    id: 'rw-house-5',
    title: 'Hinterland Horizon: Mid-Century Pavilion with Infinity Pool & Valley Views',
    address: '12 Summit Road',
    suburb: 'Byron Bay Hinterland',
    state: 'NSW',
    postcode: '2479',
    status: 'rent',
    type: 'House',
    price: 1390,
    priceDisplay: '$1,390 / week',
    originalPrice: 2250,
    originalPriceDisplay: '$2,250 / week',
    priceReduced: true,
    savingsAmount: 860,
    sellingPrice: 3200000,
    rentagePricePerWeek: 1390,
    rentagePricePerMonth: 6023,
    grossYield: '2.5%',
    bedrooms: 4,
    bathrooms: 3,
    carSpaces: 3,
    landSizeM2: 12000,
    buildingSizeM2: 370,
    images: [
      'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Discounted below standard Byron rental tariffs to secure premium long-term tenants. Perched on the crest of rolling Byron hills, this architectural pavilion showcases timber decking with heated pool, golden deciduous foliage, master wing with panoramic valley outlooks, and luxury furnishings.',
    features: ['Pool', 'Garage', 'Garden', 'Balcony', 'Air Conditioning', 'Pet Friendly'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '10:00 AM - 10:30 AM', formattedDateTime: '2026-10-24 10:00 AM' }
    ],
    agentId: 'agent-2',
    availableDate: 'Available 1 December 2026',
    bondAmount: 5560,
    isPetFriendly: true,
    coords: { lat: -28.6474, lng: 153.6120 }
  },

  // 5. TAMBORINE MOUNTAIN - BLUE RIDGE COTTAGE
  {
    id: 'rw-house-6',
    title: 'Blue Ridge Cottage: Classic Raised Verandah Homestead',
    address: '77 Mountainview Crescent',
    suburb: 'Tamborine Mountain',
    state: 'QLD',
    postcode: '4272',
    status: 'sale',
    type: 'House',
    price: 1090000,
    priceDisplay: '$1,090,000',
    originalPrice: 1580000,
    originalPriceDisplay: '$1,580,000',
    priceReduced: true,
    savingsAmount: 490000,
    sellingPrice: 1090000,
    rentagePricePerWeek: 540,
    rentagePricePerMonth: 2340,
    grossYield: '2.6%',
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 2,
    landSizeM2: 4500,
    buildingSizeM2: 240,
    images: [
      'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: false,
    description: 'Priced almost $500,000 below market appraisal to entice buyers seeking tranquil mountain living. An enchanting Queensland country cottage with distinct blue iron roof and full-length balustrade verandah. Lower level undercroft storage, lush fruit trees, crisp alpine air, and easy commute to Gold Coast beaches.',
    features: ['Garage', 'Garden', 'Balcony', 'Fireplace'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '1:00 PM - 1:30 PM', formattedDateTime: '2026-10-24 1:00 PM' }
    ],
    agentId: 'agent-1',
    councilRatesPerQuarter: 490,
    yearBuilt: 1985,
    coords: { lat: -27.9167, lng: 153.2000 }
  },

  // 6. CURRUMBIN VALLEY - RAINFOREST SANCTUM (RENT)
  {
    id: 'rw-house-7',
    title: 'Rainforest Sanctum: Modern Twin-Pavilion Eco Villa',
    address: '34 Crystal Creek Pass',
    suburb: 'Currumbin Valley',
    state: 'QLD',
    postcode: '4223',
    status: 'rent',
    type: 'House',
    price: 850,
    priceDisplay: '$850 / week',
    originalPrice: 1380,
    originalPriceDisplay: '$1,380 / week',
    priceReduced: true,
    savingsAmount: 530,
    sellingPrice: 2190000,
    rentagePricePerWeek: 850,
    rentagePricePerMonth: 3683,
    grossYield: '2.5%',
    bedrooms: 4,
    bathrooms: 3,
    carSpaces: 2,
    landSizeM2: 6800,
    buildingSizeM2: 330,
    images: [
      'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Discounted eco-rental rate below market average for approved tenants. An architectural tropical sanctuary framed by giant tree ferns and lush sub-tropical canopy. Twin elevated pavilions connected by open-air timber walkways, soaring ceilings, and pure mountain stream frontage.',
    features: ['Balcony', 'Garden', 'Air Conditioning', 'Pet Friendly'],
    inspections: [
      { date: 'Wednesday, 28 Oct', time: '4:30 PM - 5:00 PM', formattedDateTime: '2026-10-28 4:30 PM' }
    ],
    agentId: 'agent-2',
    availableDate: 'Available 15 November 2026',
    bondAmount: 3400,
    isPetFriendly: true,
    coords: { lat: -28.1833, lng: 153.4167 }
  },

  // 7. MANLY - COASTAL CONTEMPORARY
  {
    id: 'rw-house-8',
    title: 'The Coastal Contemporary: Executive Dual-Level Designer Haven',
    address: '19 Seaview Parade',
    suburb: 'Manly',
    state: 'NSW',
    postcode: '2095',
    status: 'sale',
    type: 'House',
    price: 2490000,
    priceDisplay: '$2,490,000',
    originalPrice: 3650000,
    originalPriceDisplay: '$3,650,000',
    priceReduced: true,
    savingsAmount: 1160000,
    sellingPrice: 2490000,
    rentagePricePerWeek: 1190,
    rentagePricePerMonth: 5156,
    grossYield: '2.5%',
    bedrooms: 4,
    bathrooms: 3,
    carSpaces: 2,
    landSizeM2: 680,
    buildingSizeM2: 310,
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Reduced by $1.16M to attract Northern Beaches buyers ready for immediate settlement. A crisp modern two-storey home boasting pristine white weatherboards, stone column accents, level front and rear lawns, integrated double garage, and effortless proximity to harbor beaches.',
    features: ['Garage', 'Garden', 'Air Conditioning', 'Balcony', 'Ocean Views'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '11:30 AM - 12:00 PM', formattedDateTime: '2026-10-24 11:30 AM' }
    ],
    agentId: 'agent-2',
    auctionDate: 'Auction: Saturday 21 November, 12:00 PM',
    councilRatesPerQuarter: 620,
    yearBuilt: 2020,
    coords: { lat: -33.7972, lng: 151.2858 }
  },

  // 8. POINT PIPER - THE GLASS PAVILION
  {
    id: 'rw-sale-1',
    title: 'The Glass Pavilion: Architectural Waterfront Haven',
    address: '42 Wolseley Road',
    suburb: 'Point Piper',
    state: 'NSW',
    postcode: '2027',
    status: 'sale',
    type: 'House',
    price: 3450000,
    priceDisplay: '$3,450,000',
    originalPrice: 4950000,
    originalPriceDisplay: '$4,950,000',
    priceReduced: true,
    savingsAmount: 1500000,
    sellingPrice: 3450000,
    rentagePricePerWeek: 1790,
    rentagePricePerMonth: 7756,
    grossYield: '2.7%',
    bedrooms: 4,
    bathrooms: 4,
    carSpaces: 3,
    landSizeM2: 780,
    buildingSizeM2: 440,
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Sensational $1,500,000 vendor reduction below original valuation to entice discerning trophy home buyers. An architectural tour de force overlooking Sydney Harbour, combining dramatic cantilevered terraces with bespoke marble finishes, an infinity-edge heated pool, private boat slipway, and panoramic water vistas.',
    features: ['Pool', 'Garage', 'Garden', 'Air Conditioning', 'Balcony', 'Ocean Views', 'Wine Cellar'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '11:00 AM - 11:45 AM', formattedDateTime: '2026-10-24 11:00 AM' },
      { date: 'Wednesday, 28 Oct', time: '1:00 PM - 1:30 PM', formattedDateTime: '2026-10-28 1:00 PM' }
    ],
    agentId: 'agent-1',
    auctionDate: 'Auction on-site: Saturday 7 November, 2:30 PM',
    councilRatesPerQuarter: 920,
    yearBuilt: 2022,
    coords: { lat: -33.8642, lng: 151.2514 }
  },

  // 9. SURRY HILLS - VICTORIAN GRANDEUR
  {
    id: 'rw-sale-2',
    title: 'Victorian Grandeur: Restored Heritage Terrace',
    address: '18 Mary Street',
    suburb: 'Surry Hills',
    state: 'NSW',
    postcode: '2010',
    status: 'sale',
    type: 'Townhouse',
    price: 1690000,
    priceDisplay: '$1,690,000',
    originalPrice: 2450000,
    originalPriceDisplay: '$2,450,000',
    priceReduced: true,
    savingsAmount: 760000,
    sellingPrice: 1690000,
    rentagePricePerWeek: 890,
    rentagePricePerMonth: 3856,
    grossYield: '2.9%',
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 1,
    landSizeM2: 195,
    buildingSizeM2: 210,
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Remarkable price adjustment of $760,000 below comparable sales in Surry Hills. A seamless blend of c1890 period romance and state-of-the-art modernism. Features soaring 3.4m ornate ceilings, exposed sandstone feature walls, an architect-designed north-facing lightwell courtyard, and Calacatta marble.',
    features: ['Garage', 'Garden', 'Air Conditioning', 'Balcony', 'Fireplace'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '10:00 AM - 10:30 AM', formattedDateTime: '2026-10-24 10:00 AM' }
    ],
    agentId: 'agent-2',
    auctionDate: 'Auction: Saturday 31 October, 10:30 AM',
    councilRatesPerQuarter: 480,
    yearBuilt: 1895,
    coords: { lat: -33.8864, lng: 151.2118 }
  },

  // 10. DARLING POINT - SUB-PENTHOUSE MARINA VIEW (RENT)
  {
    id: 'rw-rent-1',
    title: 'Sub-Penthouse Marina View Residence with Designer Furnishings',
    address: 'Apt 1402, 18 New Beach Road',
    suburb: 'Darling Point',
    state: 'NSW',
    postcode: '2027',
    status: 'rent',
    type: 'Apartment',
    price: 1150,
    priceDisplay: '$1,150 / week',
    originalPrice: 1850,
    originalPriceDisplay: '$1,850 / week',
    priceReduced: true,
    savingsAmount: 700,
    sellingPrice: 2590000,
    rentagePricePerWeek: 1150,
    rentagePricePerMonth: 4983,
    grossYield: '2.5%',
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 2,
    buildingSizeM2: 175,
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Below-market executive tariff saving tenants $700 per week. Immaculately curated executive apartment in an exclusive waterfront boutique block. Enjoys sweeping views over Rushcutters Bay marina, master suite with walk-in robe and ensuite, and two secure undercover car spaces.',
    features: ['Garage', 'Air Conditioning', 'Balcony', 'Ocean Views', 'Pet Friendly'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '11:15 AM - 11:35 AM', formattedDateTime: '2026-10-24 11:15 AM' }
    ],
    agentId: 'agent-1',
    availableDate: 'Available 5 November 2026',
    bondAmount: 4600,
    isPetFriendly: true,
    coords: { lat: -33.8735, lng: 151.2361 }
  },

  // 11. PADDINGTON - FREESTANDING MODERN HAMPTONS (RENT)
  {
    id: 'rw-rent-2',
    title: 'Freestanding Modern Hamptons Family Estate',
    address: '29 Gordon Street',
    suburb: 'Paddington',
    state: 'NSW',
    postcode: '2021',
    status: 'rent',
    type: 'House',
    price: 1490,
    priceDisplay: '$1,490 / week',
    originalPrice: 2400,
    originalPriceDisplay: '$2,400 / week',
    priceReduced: true,
    savingsAmount: 910,
    sellingPrice: 3190000,
    rentagePricePerWeek: 1490,
    rentagePricePerMonth: 6456,
    grossYield: '2.6%',
    bedrooms: 4,
    bathrooms: 3,
    carSpaces: 2,
    landSizeM2: 420,
    buildingSizeM2: 280,
    images: [
      'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Attractively reduced tariff saving $910 weekly on Paddington market rates. A distinguished freestanding sanctuary boasting heated salt pool, private landscaped entertainer courtyard, multiple family living zones, and proximity to Paddington five-way boutiques.',
    features: ['Pool', 'Garage', 'Garden', 'Air Conditioning', 'Balcony', 'Pet Friendly'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '12:30 PM - 1:00 PM', formattedDateTime: '2026-10-24 12:30 PM' }
    ],
    agentId: 'agent-2',
    availableDate: 'Available Immediately',
    bondAmount: 5960,
    isPetFriendly: true,
    coords: { lat: -33.8841, lng: 151.2269 }
  },

  // 12. BONDI BEACH - THE BONDI HORIZON VILLA
  {
    id: 'rw-house-10',
    title: 'The Bondi Horizon Villa: Oceanfront Cantilevered Concrete Residence',
    address: '8 Ramsgate Avenue',
    suburb: 'Bondi Beach',
    state: 'NSW',
    postcode: '2026',
    status: 'sale',
    type: 'House',
    price: 3980000,
    priceDisplay: '$3,980,000',
    originalPrice: 5850000,
    originalPriceDisplay: '$5,850,000',
    priceReduced: true,
    savingsAmount: 1870000,
    sellingPrice: 3980000,
    rentagePricePerWeek: 2100,
    rentagePricePerMonth: 9100,
    grossYield: '2.8%',
    bedrooms: 5,
    bathrooms: 4,
    carSpaces: 3,
    landSizeM2: 590,
    buildingSizeM2: 430,
    images: [
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Exceptional $1,870,000 price discount directly below independent bank valuation to attract immediate serious offers. An iconic coastal sculptural masterpiece perched above Ben Buckler cliffline. Features off-form architectural board-marked concrete, heated ocean-view pool, floor-to-ceiling glass pavilions, and private wine tasting cellar.',
    features: ['Pool', 'Garage', 'Garden', 'Air Conditioning', 'Balcony', 'Ocean Views'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '1:30 PM - 2:15 PM', formattedDateTime: '2026-10-24 1:30 PM' }
    ],
    agentId: 'agent-1',
    auctionDate: 'Auction on-site: Saturday 28 November, 3:30 PM',
    councilRatesPerQuarter: 980,
    yearBuilt: 2023,
    coords: { lat: -33.8915, lng: 151.2767 }
  },

  // 13. NOOSA HEADS - THE PALM SPRINGS OASIS (RENT)
  {
    id: 'rw-house-12',
    title: 'The Palm Springs Oasis: Mid-Century Courtyard Villa',
    address: '42 Park Crescent',
    suburb: 'Noosa Heads',
    state: 'QLD',
    postcode: '4567',
    status: 'rent',
    type: 'House',
    price: 1180,
    priceDisplay: '$1,180 / week',
    originalPrice: 1850,
    originalPriceDisplay: '$1,850 / week',
    priceReduced: true,
    savingsAmount: 670,
    sellingPrice: 2650000,
    rentagePricePerWeek: 1180,
    rentagePricePerMonth: 5113,
    grossYield: '2.4%',
    bedrooms: 4,
    bathrooms: 3,
    carSpaces: 2,
    landSizeM2: 820,
    buildingSizeM2: 310,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    description: 'Reduced below typical Noosa luxury rental tariffs to welcome discerning residents. A breezy mid-century modern pavilion nestled by Noosa National Park. Designed around a turquoise swimming pool and central breeze-block courtyard with mature cacti, outdoor shower, and designer furnishings.',
    features: ['Pool', 'Garage', 'Garden', 'Air Conditioning', 'Balcony', 'Pet Friendly'],
    inspections: [
      { date: 'Saturday, 24 Oct', time: '11:00 AM - 11:30 AM', formattedDateTime: '2026-10-24 11:00 AM' }
    ],
    agentId: 'agent-2',
    availableDate: 'Available 20 November 2026',
    bondAmount: 4720,
    isPetFriendly: true,
    coords: { lat: -26.3986, lng: 153.0931 }
  }
];

export const SUBURBS = [
  'Bowral',
  'Red Hill',
  'Southern Highlands',
  'Byron Bay Hinterland',
  'Tamborine Mountain',
  'Currumbin Valley',
  'Manly',
  'Point Piper',
  'Surry Hills',
  'Darling Point',
  'Paddington',
  'Bondi Beach',
  'Noosa Heads'
];

export const PROPERTY_TYPES = ['All Types', 'House', 'Apartment', 'Townhouse', 'Penthouse', 'Land'];

export const ALL_FEATURES = [
  'Pool',
  'Garage',
  'Garden',
  'Air Conditioning',
  'Balcony',
  'Ocean Views',
  'Pet Friendly',
  'Fireplace'
];
