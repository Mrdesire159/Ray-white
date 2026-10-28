import { Property, TourRoom } from '../types/property';

// Curated high-resolution architectural photography collections for luxury inside walkthroughs
const ROOM_COLLECTIONS: Record<string, TourRoom[]> = {
  modern_coastal: [
    {
      id: 'exterior',
      name: 'Grand Exterior & Arrival',
      subtitle: 'Architectural Streetscape & Facade',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=85',
      dimensions: '18m Frontage · 4-Car Forecourt',
      architecturalNote: 'Sculptural off-form concrete cantilever with integrated landscape planters and zinc cladding.',
      hotspots: [
        { id: 'h1', x: 28, y: 45, title: 'Architectural Cantilever', description: 'Engineered post-tensioned slab allowing a 6-metre column-free overhang.' },
        { id: 'h2', x: 68, y: 72, title: 'Reflecting Water Garden', description: 'Limestone stepping stones across an illuminated aquatic water feature.' },
        { id: 'h3', x: 82, y: 38, title: 'Charred Timber Battens', description: 'Sustainable Japanese Shou Sugi Ban burnt cedar cladding with natural weather resistance.' }
      ]
    },
    {
      id: 'foyer',
      name: 'Double-Height Entrance Foyer',
      subtitle: 'Monumental Gallery Arrival',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
      dimensions: '6.4m Ceiling Height · 38m²',
      architecturalNote: 'Dramatic ceiling void with custom blown-glass pendant chandelier and oversized solid oak pivot door.',
      hotspots: [
        { id: 'h4', x: 35, y: 28, title: 'Bespoke Pendant Cluster', description: 'Hand-blown Bocci glass globes suspended at staggered drops.' },
        { id: 'h5', x: 62, y: 65, title: 'Honed Limestone Slabs', description: 'Large-format Crema Marfil honed tiles with seamless concealed floor heating.' }
      ]
    },
    {
      id: 'living',
      name: 'Living & Lounge Pavilion',
      subtitle: 'Expansive Open-Plan Entertaining',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85',
      dimensions: '12m x 7.5m · 90m²',
      architecturalNote: 'Sunken conversation lounge featuring a double-sided gas hearth wrapped in fluted stone.',
      hotspots: [
        { id: 'h6', x: 42, y: 55, title: 'Fluted Marble Fireplace', description: 'Linear real-flame fireplace with continuous stone hearth bench seating.' },
        { id: 'h7', x: 80, y: 40, title: 'Motorised Glass Curtains', description: 'Triple-track cavity sliding doors retracting flush into exterior pocket walls.' }
      ]
    },
    {
      id: 'kitchen',
      name: "Chef's Kitchen & Scullery",
      subtitle: 'Culinary Precision & Wine Display',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1800&q=85',
      dimensions: '5.2m Calacatta Island · Scullery',
      architecturalNote: 'Monolithic Calacatta Viola marble island with integrated induction cooking and temperature-controlled wine cellar.',
      hotspots: [
        { id: 'h8', x: 48, y: 60, title: 'Calacatta Viola Marble', description: 'Bookmatched Italian marble with mitred waterfall edges and subtle under-glow.' },
        { id: 'h9', x: 78, y: 45, title: 'Gaggenau 400 Series Suite', description: 'Concealed twin ovens, warming drawer, combi-steam oven, and Sub-Zero column cooling.' }
      ]
    },
    {
      id: 'master',
      name: 'Primary Bedroom Suite & Spa',
      subtitle: 'Private Sanctuary with Ocean Breeze',
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1800&q=85',
      dimensions: '8.5m x 5.8m Suite + 18m² Ensuite',
      architecturalNote: 'Panoramic bedroom suite with bespoke linen acoustic wall panels, private balcony, and freestanding stone soaking bath.',
      hotspots: [
        { id: 'h10', x: 38, y: 50, title: 'Acoustic Upholstered Bedhead', description: 'Custom floor-to-ceiling Belgian linen panelling with concealed reading downlights.' },
        { id: 'h11', x: 74, y: 62, title: 'Freestanding Stone Tub', description: 'Solid composite stone soaking tub positioned against a tranquil garden glass wall.' }
      ]
    },
    {
      id: 'terrace',
      name: 'Entertainer Terrace & Pool',
      subtitle: 'Alfresco Dining & Infinity Edge',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=85',
      dimensions: '14m Mineral Pool · 120m² Sun Deck',
      architecturalNote: 'Heated mineral swimming pool with infinity overflow edge, integrated outdoor BBQ kitchen, and sunken firepit lounge.',
      hotspots: [
        { id: 'h12', x: 45, y: 65, title: 'Heated Mineral Pool', description: 'Magnesium mineral sanitation system with automated in-floor self-cleaning nozzles.' },
        { id: 'h13', x: 80, y: 70, title: 'Outdoor Firepit Lounge', description: 'Custom circular concrete bench with volcanic lava rock gas burner.' }
      ]
    }
  ],

  country_homestead: [
    {
      id: 'exterior',
      name: 'Acreage Facade & Grounds',
      subtitle: 'Heritage Queenslander & Pastoral Vistas',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=85',
      dimensions: '4.5 Acres · Wrap-around Verandah',
      architecturalNote: 'Authentic corrugated iron roof, elevated timber stilt construction, and manicured country gardens.',
      hotspots: [
        { id: 'c1', x: 50, y: 40, title: 'Corrugated Steel Gables', description: 'Colorbond corrugated steel profile designed for passive rainfall collection.' },
        { id: 'c2', x: 75, y: 65, title: 'Wrap-Around Timber Verandah', description: 'Tallowwood tongue-and-groove decking extending 3.2 metres around all four elevations.' }
      ]
    },
    {
      id: 'foyer',
      name: 'Central Breezeway & Hall',
      subtitle: 'Historic Timber Craftsmanship',
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1800&q=85',
      dimensions: '3.6m High Pressed Metal Ceilings',
      architecturalNote: 'Polished original kauri pine floorboards, leadlight fanlights, and traditional fretwork arches.',
      hotspots: [
        { id: 'c3', x: 45, y: 30, title: 'Pressed Metal Ceiling', description: 'Restored Victorian floral pattern ceiling panels painted in warm chalk white.' }
      ]
    },
    {
      id: 'living',
      name: 'Grand Homestead Salon',
      subtitle: 'Cathedral Ceilings & Open Hearth',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85',
      dimensions: '10m x 8m Grand Room',
      architecturalNote: 'Exposed structural timber trusses with a monumental local sandstone open fireplace.',
      hotspots: [
        { id: 'c4', x: 48, y: 58, title: 'Sandstone Open Hearth', description: 'Hand-chiselled local Southern Highlands stone with reclaimed railway sleeper mantelpiece.' }
      ]
    },
    {
      id: 'kitchen',
      name: 'Farmhouse Country Kitchen',
      subtitle: 'Aga Cooker & Butcher Block Island',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1800&q=85',
      dimensions: '6m Farmhouse Wing',
      architecturalNote: 'Traditional British racing green cast-iron cooker, shaker joinery, and thick end-grain chopping block.',
      hotspots: [
        { id: 'c5', x: 52, y: 60, title: 'Cast Iron Range Cooker', description: 'Dual-fuel multi-oven cooker with brass hardware and ceramic subway tiled splashback.' }
      ]
    },
    {
      id: 'master',
      name: 'Country Retreat Master Suite',
      subtitle: 'Garden Balcony & Bay Window',
      image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1800&q=85',
      dimensions: '7m x 6m Master Wing',
      architecturalNote: 'French doors opening onto private morning coffee deck overlooking valley mist.',
      hotspots: [
        { id: 'c6', x: 40, y: 50, title: 'French Timber Casements', description: 'Solid cedar double doors with brass Cremone bolt security hardware.' }
      ]
    },
    {
      id: 'terrace',
      name: 'Verandah Dining & Valley Vistas',
      subtitle: 'Sunset Pavilion Over Pastures',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=85',
      dimensions: '45m² Covered Outdoor Living',
      architecturalNote: 'Overhead infrared radiant heaters, cedar ceiling lining, and unobstructed 180° ridge views.',
      hotspots: [
        { id: 'c7', x: 55, y: 70, title: 'Paddock Panoramic Edge', description: 'Direct view over the private dam, orchard groves, and fenced equine paddocks.' }
      ]
    }
  ],

  penthouse_luxury: [
    {
      id: 'exterior',
      name: 'Skyline Skyline Arrival',
      subtitle: 'Harbourfront Crown Residence',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1800&q=85',
      dimensions: 'Full Floor · 480m² Living',
      architecturalNote: 'Penthouse with wrap-around floor-to-ceiling glass curved curtains overlooking the Opera House and Harbour Bridge.',
      hotspots: [
        { id: 'p1', x: 30, y: 40, title: 'Direct Keyed Elevator', description: 'Private dual high-speed lift vestibule with biometric retinal & card access.' }
      ]
    },
    {
      id: 'foyer',
      name: 'Curated Gallery Vestibule',
      subtitle: 'Private Collector Entrance',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
      dimensions: 'Private Lift Lobby',
      architecturalNote: 'Museum-grade spot lighting, Venetian plaster walls, and custom bronze doors.',
      hotspots: [
        { id: 'p2', x: 50, y: 35, title: 'Venetian Plaster Walls', description: 'Burnished Marmorino lime plaster with subtle reflective pearl sheen.' }
      ]
    },
    {
      id: 'living',
      name: 'Sky Living Salon',
      subtitle: 'Unbroken Harbour Panorama',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85',
      dimensions: '14m Continuous Glass Facade',
      architecturalNote: 'Soaring 3.4m ceiling height with acoustic acoustic acoustic ceilings and full home automation.',
      hotspots: [
        { id: 'p3', x: 60, y: 50, title: 'Curved Acoustic Glazing', description: 'Double-laminated acoustic curtain wall eliminating all exterior city sound.' }
      ]
    },
    {
      id: 'kitchen',
      name: 'Showpiece Sculptural Kitchen',
      subtitle: 'Statuary Marble & Butler Room',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1800&q=85',
      dimensions: 'Gourmet Kitchen + 24m² Butler Room',
      architecturalNote: 'Integrated Wolf cooktop, Sub-Zero refrigeration columns, and hidden prep kitchen.',
      hotspots: [
        { id: 'p4', x: 45, y: 55, title: 'Statuary Marble Island', description: 'Seamless monolithic island bench crafted from a single quarry block.' }
      ]
    },
    {
      id: 'master',
      name: 'Presidential Master Suite',
      subtitle: 'Bespoke Dressing Hall & Ensuite',
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1800&q=85',
      dimensions: '75m² Total Master Wing',
      architecturalNote: 'Leather-lined walk-in dressing room, onyx powder room, and private sunrise harbour view.',
      hotspots: [
        { id: 'p5', x: 50, y: 50, title: 'Motorised Blackout Screens', description: 'Somfy dual sunscreen and blackout automated rollers linked to circadian lighting.' }
      ]
    },
    {
      id: 'terrace',
      name: 'Private Rooftop Sky Terrace',
      subtitle: 'Heated Plunge Pool & Skyline Bar',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=85',
      dimensions: '180m² Private Open-Air Sky Terrace',
      architecturalNote: 'Glass-walled heated plunge pool, cantilevered daybeds, and 360-degree city skyline panoramas.',
      hotspots: [
        { id: 'p6', x: 50, y: 65, title: 'Glass Bottom Plunge Pool', description: 'Clear acrylic viewing panel looking into the private lightwell atrium below.' }
      ]
    }
  ]
};

/**
 * Returns a 6-room tour sequence for any given property
 */
export function getTourRoomsForProperty(property: Property): TourRoom[] {
  if (property.tourRooms && property.tourRooms.length > 0) {
    return property.tourRooms;
  }

  // Pick best matching theme
  const titleAndDesc = (property.title + ' ' + property.description + ' ' + property.type).toLowerCase();
  let baseRooms = ROOM_COLLECTIONS.modern_coastal;

  if (titleAndDesc.includes('pastoral') || titleAndDesc.includes('acreage') || titleAndDesc.includes('homestead') || titleAndDesc.includes('country') || titleAndDesc.includes('bowral') || titleAndDesc.includes('red hill')) {
    baseRooms = ROOM_COLLECTIONS.country_homestead;
  } else if (titleAndDesc.includes('penthouse') || titleAndDesc.includes('harbour') || titleAndDesc.includes('apartment') || titleAndDesc.includes('sydney')) {
    baseRooms = ROOM_COLLECTIONS.penthouse_luxury;
  }

  // Customize the first image using the property's actual first photo
  return baseRooms.map((room, idx) => {
    if (idx === 0 && property.images && property.images[0]) {
      return {
        ...room,
        image: property.images[0],
        subtitle: `${property.address}, ${property.suburb}`
      };
    }
    // If property has multiple images, weave them in
    if (idx === 2 && property.images && property.images[1]) {
      return {
        ...room,
        image: property.images[1]
      };
    }
    if (idx === 5 && property.images && property.images[2]) {
      return {
        ...room,
        image: property.images[2]
      };
    }
    return room;
  });
}
