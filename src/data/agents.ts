import { Agent } from '../types/property';

export const AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Julian Henderson',
    role: 'Principal & Licensed Real Estate Agent',
    phone: '+61 (02) 9363 1100',
    email: 'contact@raywhiterealestate.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    licenseNumber: 'LREA 20188941',
    soldCount: 148,
    rating: 4.9,
    office: 'Ray White Double Bay & Prestige Australasia',
    bio: 'With over 16 years specialising in Sydney’s premier Eastern Suburbs, prestige waterfronts, and luxury lifestyle estates nationwide, Julian consistently sets benchmark sale prices through strategic auction campaigns and discreet off-market transactions.',
    isTopPerformer: true,
    topPerformerTitle: "Ray White Chairman's Elite",
    recentSalesCount: 19,
    recentSalesVolume: '$54.2M',
    clearanceRate: '96%',
    avgDaysOnMarket: 18,
    recentSales: [
      {
        address: '14 Wolseley Road',
        suburb: 'Point Piper',
        price: '$14,200,000',
        soldDate: '2 weeks ago',
        type: 'Waterfront Residence',
      },
      {
        address: '8 Ocean Avenue',
        suburb: 'Double Bay',
        price: '$4,850,000',
        soldDate: '3 weeks ago',
        type: 'Victorian Luxury Terrace',
      },
      {
        address: '22 Cross Street',
        suburb: 'Double Bay',
        price: '$3,620,000',
        soldDate: 'Last month',
        type: 'Executive Penthouse',
      },
      {
        address: '5 Wallaroy Road',
        suburb: 'Woollahra',
        price: '$5,900,000',
        soldDate: 'Last month',
        type: 'Manor Estate',
      },
    ],
  },
  {
    id: 'agent-2',
    name: 'Sophie Montgomery',
    role: 'Senior Sales Executive & Premier Auctioneer',
    phone: '+61 (02) 9363 1144',
    email: 'contact@raywhiterealestate.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    licenseNumber: 'LREA 20214309',
    soldCount: 112,
    rating: 5.0,
    office: 'Ray White Sydney & National Prestige',
    bio: 'Sophie brings relentless energy and deep market intelligence across prestige homes, architectural properties, and high-yield executive investments, providing tailored advisory for vendors and investors nationwide.',
    isTopPerformer: true,
    topPerformerTitle: 'Premier Auctioneer of the Year',
    recentSalesCount: 15,
    recentSalesVolume: '$38.6M',
    clearanceRate: '94%',
    avgDaysOnMarket: 21,
    recentSales: [
      {
        address: '47 Crown Street',
        suburb: 'Surry Hills',
        price: '$2,890,000',
        soldDate: '1 week ago',
        type: 'Architectural Terrace',
      },
      {
        address: '102/15 Campbell Street',
        suburb: 'Paddington',
        price: '$1,975,000',
        soldDate: '2 weeks ago',
        type: 'Heritage Warehouse Loft',
      },
      {
        address: '89 Darlinghurst Road',
        suburb: 'Potts Point',
        price: '$3,250,000',
        soldDate: '3 weeks ago',
        type: 'Harbour View Apartment',
      },
    ],
  },
];

export const getAgentById = (id: string): Agent => {
  return AGENTS.find(a => a.id === id) || AGENTS[0];
};
