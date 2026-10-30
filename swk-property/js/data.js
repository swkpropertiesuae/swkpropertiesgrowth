// SWK Property — developer & project directory.
//
// Compiled from public knowledge of UAE master developments (as of late 2025).
// Status and dates move quickly in this market: every record should be checked
// against the developer / DLD / RERA record before it is presented as current.
// Tuple: [name, location, status, kind, year]
//   status: 'completed' | 'ongoing' | 'launched'   (launched = newly released / early off-plan)
//   kind:   'tower' | 'villa' | 'mixed' | 'island' | 'retail'
//   year:   completion year for completed projects, otherwise null (confirm handover with developer)

export const DATA_NOTE =
  'Directory compiled from public information. Statuses and handover dates change — confirm with the developer before relying on them.';

export const DEVELOPERS = [
  { id: 'emaar', name: 'Emaar Properties', hq: 'Dubai', projects: [
    ['Burj Khalifa & Downtown Dubai', 'Downtown Dubai', 'completed', 'tower', 2010],
    ['Dubai Marina', 'Dubai Marina', 'completed', 'tower', null],
    ['Arabian Ranches', 'Dubailand', 'completed', 'villa', null],
    ['Emaar Beachfront', 'Dubai Harbour', 'ongoing', 'tower', null],
    ['Dubai Creek Harbour', 'Ras Al Khor', 'ongoing', 'mixed', null],
    ['Dubai Hills Estate', 'Al Khail Road', 'ongoing', 'mixed', null],
    ['The Valley', 'Dubai–Al Ain Road', 'ongoing', 'villa', null],
    ['Golf Fields', 'Dubai South', 'launched', 'tower', null],
  ]},
  { id: 'damac', name: 'DAMAC Properties', hq: 'Dubai', projects: [
    ['DAMAC Hills', 'Dubailand', 'ongoing', 'mixed', null],
    ['DAMAC Hills 2', 'Dubailand', 'ongoing', 'villa', null],
    ['DAMAC Lagoons', 'Dubailand', 'ongoing', 'villa', null],
    ['Aykon City', 'Sheikh Zayed Road', 'ongoing', 'tower', null],
    ['DAMAC Islands', 'Dubailand', 'launched', 'villa', null],
    ['Safa One', 'Al Safa', 'completed', 'tower', null],
  ]},
  { id: 'nakheel', name: 'Nakheel', hq: 'Dubai', projects: [
    ['Palm Jumeirah', 'Palm Jumeirah', 'completed', 'island', null],
    ['Palm Jebel Ali', 'Jebel Ali', 'launched', 'island', null],
    ['Dubai Islands', 'Deira', 'ongoing', 'island', null],
    ['Jumeirah Village Circle', 'JVC', 'ongoing', 'mixed', null],
    ['Al Furjan', 'Al Furjan', 'ongoing', 'mixed', null],
    ['International City', 'Warsan', 'completed', 'tower', null],
    ['Jumeirah Islands', 'Jumeirah', 'completed', 'villa', null],
  ]},
  { id: 'sobha', name: 'Sobha Realty', hq: 'Dubai', projects: [
    ['Sobha Hartland', 'Mohammed Bin Rashid City', 'ongoing', 'mixed', null],
    ['Sobha Hartland II', 'Mohammed Bin Rashid City', 'ongoing', 'mixed', null],
    ['Sobha SeaHaven', 'Dubai Harbour', 'ongoing', 'tower', null],
    ['River Cove Residences', 'Waterfront', 'launched', 'tower', null],
    ['Sobha Siniya Island', 'Umm Al Quwain', 'launched', 'island', null],
  ]},
  { id: 'meraas', name: 'Meraas', hq: 'Dubai', projects: [
    ['Bluewaters Island', 'Jumeirah', 'completed', 'island', null],
    ['City Walk', 'Al Wasl', 'completed', 'mixed', null],
    ['La Mer', 'Jumeirah 1', 'completed', 'retail', null],
    ['Port de La Mer', 'Jumeirah', 'ongoing', 'mixed', null],
    ['Jumeira Bay', 'Jumeirah', 'ongoing', 'island', null],
  ]},
  { id: 'dubaiproperties', name: 'Dubai Properties', hq: 'Dubai', projects: [
    ['Jumeirah Beach Residence', 'JBR', 'completed', 'tower', null],
    ['Business Bay', 'Business Bay', 'ongoing', 'tower', null],
    ['Mudon', 'Dubailand', 'ongoing', 'villa', null],
    ['Villanova', 'Dubailand', 'ongoing', 'villa', null],
    ['Remraam', 'Dubailand', 'completed', 'mixed', null],
    ['Dubai Wharf', 'Culture Village', 'launched', 'tower', null],
  ]},
  { id: 'aldar', name: 'Aldar Properties', hq: 'Abu Dhabi', projects: [
    ['Yas Acres', 'Yas Island', 'completed', 'villa', null],
    ['Saadiyat Lagoons', 'Saadiyat Island', 'ongoing', 'villa', null],
    ['Fahid Island', 'Abu Dhabi', 'launched', 'island', null],
    ['Al Raha Beach', 'Abu Dhabi', 'completed', 'mixed', null],
    ['Al Ghadeer', 'Abu Dhabi', 'completed', 'villa', null],
    ['Noya', 'Yas Island', 'ongoing', 'villa', null],
  ]},
  { id: 'ellington', name: 'Ellington Properties', hq: 'Dubai', projects: [
    ['Wilton Park Residences', 'MBR City', 'completed', 'tower', null],
    ['Belgravia Heights', 'JVC', 'ongoing', 'tower', null],
    ['The Quayside', 'Business Bay', 'ongoing', 'tower', null],
    ['Ellington Beach House', 'Palm Jumeirah', 'launched', 'tower', null],
    ['DT1', 'Downtown Dubai', 'completed', 'tower', null],
  ]},
  { id: 'danube', name: 'Danube Properties', hq: 'Dubai', projects: [
    ['Bayz', 'Business Bay', 'completed', 'tower', null],
    ['Gemz', 'Al Furjan', 'completed', 'tower', null],
    ['Jewelz', 'Arjan', 'ongoing', 'tower', null],
    ['Elitz', 'JVC', 'ongoing', 'tower', null],
    ['Oceanz', 'Dubai Maritime City', 'ongoing', 'tower', null],
  ]},
  { id: 'azizi', name: 'Azizi Developments', hq: 'Dubai', projects: [
    ['Azizi Riviera', 'MBR City', 'ongoing', 'mixed', null],
    ['Azizi Venice', 'Dubai South', 'ongoing', 'mixed', null],
    ['Azizi Mina', 'Palm Jumeirah', 'ongoing', 'tower', null],
    ['Azizi Beach Oasis', 'Dubai Studio City', 'ongoing', 'tower', null],
    ['Azizi Park Avenue', 'MBR City', 'ongoing', 'tower', null],
  ]},
  { id: 'binghatti', name: 'Binghatti', hq: 'Dubai', projects: [
    ['Burj Binghatti Jacob & Co', 'Business Bay', 'ongoing', 'tower', null],
    ['Binghatti Hills', 'Dubai Science Park', 'ongoing', 'tower', null],
    ['Mercedes-Benz Places by Binghatti', 'Business Bay', 'launched', 'tower', null],
    ['Bugatti Residences by Binghatti', 'Business Bay', 'launched', 'tower', null],
    ['Binghatti Canal', 'Business Bay', 'completed', 'tower', null],
  ]},
  { id: 'omniyat', name: 'Omniyat', hq: 'Dubai', projects: [
    ['The Opus', 'Business Bay', 'completed', 'tower', null],
    ['One Palm', 'Palm Jumeirah', 'ongoing', 'tower', null],
    ['Orla Dubai', 'Palm Jumeirah', 'ongoing', 'tower', null],
    ['Dorchester Collection Dubai', 'Business Bay', 'ongoing', 'tower', null],
    ['Atelier House', 'Business Bay', 'launched', 'tower', null],
  ]},
  { id: 'select', name: 'Select Group', hq: 'Dubai', projects: [
    ['Marina Gate', 'Dubai Marina', 'completed', 'tower', null],
    ['The Peninsula', 'Business Bay', 'ongoing', 'tower', null],
    ['Peninsula Four', 'Business Bay', 'ongoing', 'tower', null],
  ]},
  { id: 'imtiaz', name: 'Imtiaz Developments', hq: 'Dubai', projects: [
    ['Raw District 2', 'Sheikh Zayed Road', 'launched', 'tower', null],
  ]},
  { id: 'arada', name: 'Arada', hq: 'Sharjah', projects: [
    ['Aljada', 'Sharjah', 'ongoing', 'mixed', null],
    ['Masaar', 'Sharjah', 'ongoing', 'villa', null],
    ['Armani Beach Residences', 'Palm Jumeirah', 'launched', 'tower', null],
  ]},
  { id: 'deyaar', name: 'Deyaar', hq: 'Dubai', projects: [
    ['Midtown', 'Dubai Production City', 'completed', 'mixed', null],
    ['Regalia', 'Business Bay', 'completed', 'tower', null],
    ['The Atria', 'Business Bay', 'completed', 'tower', null],
  ]},
  { id: 'union', name: 'Union Properties', hq: 'Dubai', projects: [
    ['Motor City', 'Dubai', 'completed', 'mixed', null],
    ['Green Community', 'Dubai Investments Park', 'completed', 'villa', null],
    ['Falcon City of Wonders', 'Dubailand', 'ongoing', 'mixed', null],
  ]},
  { id: 'mag', name: 'MAG Property', hq: 'Dubai', projects: [
    ['MAG City', 'MBR City', 'ongoing', 'mixed', null],
    ['Keturah Reserve', 'MBR City', 'ongoing', 'villa', null],
    ['MAG 5 Boulevard', 'Dubai South', 'completed', 'tower', null],
  ]},
  { id: 'samana', name: 'Samana Developers', hq: 'Dubai', projects: [
    ['Samana Golf Avenue', 'Dubai Studio City', 'ongoing', 'tower', null],
    ['Samana Hills', 'Arjan', 'completed', 'tower', null],
    ['Samana Waves', 'JVC', 'ongoing', 'tower', null],
    ['Samana Park Views', 'Arjan', 'ongoing', 'tower', null],
  ]},
  { id: 'wasl', name: 'Wasl Properties', hq: 'Dubai', projects: [
    ['Wasl 1', 'Sheikh Zayed Road', 'completed', 'tower', null],
    ['Wasl Gate', 'Jebel Ali', 'ongoing', 'mixed', null],
  ]},
  { id: 'bloom', name: 'Bloom Holding', hq: 'Abu Dhabi', projects: [
    ['Bloom Towers', 'JVC', 'completed', 'tower', null],
    ['Bloom Heights', 'JVC', 'ongoing', 'tower', null],
    ['Bloom Living', 'Zayed City', 'ongoing', 'villa', null],
  ]},
  { id: 'eaglehills', name: 'Eagle Hills', hq: 'Abu Dhabi', projects: [
    ['Maryam Island', 'Sharjah', 'ongoing', 'island', null],
    ['Sharjah Waterfront City', 'Sharjah', 'ongoing', 'island', null],
  ]},
  { id: 'modon', name: 'Modon Holding', hq: 'Abu Dhabi', projects: [
    ['Hudayriyat Island', 'Abu Dhabi', 'ongoing', 'island', null],
    ['Reem Hills', 'Al Reem Island', 'ongoing', 'villa', null],
    ['Makers District', 'Al Reem Island', 'ongoing', 'mixed', null],
  ]},
  { id: 'maf', name: 'Majid Al Futtaim', hq: 'Dubai', projects: [
    ['Tilal Al Ghaf', 'Dubailand', 'ongoing', 'villa', null],
    ['Mall of the Emirates', 'Al Barsha', 'completed', 'retail', null],
    ['City Centre Mirdif', 'Mirdif', 'completed', 'retail', null],
  ]},
  { id: 'meydan', name: 'Meydan', hq: 'Dubai', projects: [
    ['Meydan Racecourse', 'Nad Al Sheba', 'completed', 'retail', null],
    ['Meydan One', 'Meydan', 'ongoing', 'mixed', null],
    ['Meydan Horizon', 'Meydan', 'ongoing', 'villa', null],
  ]},
  { id: 'rakprop', name: 'RAK Properties', hq: 'Ras Al Khaimah', projects: [
    ['Mina Al Arab', 'Ras Al Khaimah', 'ongoing', 'mixed', null],
    ['Bay Residences', 'Mina Al Arab', 'completed', 'tower', null],
  ]},
  { id: 'marjan', name: 'Marjan', hq: 'Ras Al Khaimah', projects: [
    ['Marjan Island', 'Ras Al Khaimah', 'ongoing', 'island', null],
    ['Wynn Al Marjan Island', 'Ras Al Khaimah', 'launched', 'island', null],
  ]},
  { id: 'nshama', name: 'Nshama', hq: 'Dubai', projects: [
    ['Town Square', 'Dubailand', 'ongoing', 'mixed', null],
    ['Hayat Townhouses', 'Town Square', 'completed', 'villa', null],
    ['Zahra Apartments', 'Town Square', 'completed', 'tower', null],
  ]},
  { id: 'imkan', name: 'Imkan Properties', hq: 'Abu Dhabi', projects: [
    ['Mamsha Al Saadiyat', 'Saadiyat Island', 'completed', 'tower', null],
    ['Gardenia Bay', 'Yas Island', 'ongoing', 'villa', null],
  ]},
  { id: 'habtoor', name: 'Al Habtoor Group', hq: 'Dubai', projects: [
    ['Habtoor City', 'Sheikh Zayed Road', 'completed', 'tower', null],
    ['Al Habtoor Tower', 'Dubai Marina', 'ongoing', 'tower', null],
  ]},
  { id: 'diamond', name: 'Diamond Developers', hq: 'Dubai', projects: [
    ['The Sustainable City', 'Al Sufouh', 'completed', 'villa', null],
    ['Sharjah Sustainable City', 'Sharjah', 'completed', 'villa', null],
  ]},
  { id: 'alzorah', name: 'Al Zorah Development', hq: 'Ajman', projects: [
    ['Al Zorah', 'Ajman', 'ongoing', 'mixed', null],
  ]},
];

export const STATUS = {
  completed: { label: 'Completed', color: '#e8c98b' },
  ongoing: { label: 'Ongoing', color: '#4fd1ff' },
  launched: { label: 'Newly launched', color: '#c58bff' },
};

export const totals = () => {
  const t = { developers: DEVELOPERS.length, projects: 0, completed: 0, ongoing: 0, launched: 0 };
  for (const d of DEVELOPERS) for (const p of d.projects) { t.projects++; t[p[2]]++; }
  return t;
};

// SWK's own live listings (from the SWK Properties site data). Images are the
// supplied listing photography. Prices are "from" prices as published there.
export const LISTINGS = [
  { id: 'golf-fields', title: 'Golf Fields', developer: 'Emaar Properties', community: 'Dubai South',
    type: 'Apartment · 1, 2 & 3 BR', status: 'Off-Plan', price: 1260000, payment: '80/20', handover: 'Q3 2030',
    img: 'assets/golf-fields.webp',
    blurb: 'Green living wrapped around landscaped golf fairways, with a resident pool, BBQ deck and course views.' },
  { id: 'raw-district-2', title: 'Raw District 2', developer: 'Imtiaz Developments', community: 'Sheikh Zayed Road',
    type: 'Apartment', status: 'Off-Plan', price: 680000, payment: 'Flexible plan', handover: 'Q2 2029',
    img: 'assets/raw-district-2.webp',
    blurb: 'An entry-point address on the Sheikh Zayed Road corridor, minutes from the metro line.' },
  { id: 'river-cove', title: 'River Cove Residences', developer: 'Sobha Realty', community: 'Waterfront',
    type: 'Apartment', status: 'Off-Plan', price: 1400000, payment: 'Developer plan', handover: 'Q4 2029',
    img: 'assets/river-cove-residences.webp',
    blurb: 'Waterfront apartments from Sobha Realty, set around a landscaped cove.' },
];

// Team: names, roles and portraits are the real SWK Properties team.
export const TEAM = [
  { id: 'talha', name: 'Talha Shabbir', role: 'Business Development Manager', photo: 'assets/team/talha-shabbir.webp',
    bio: 'The first conversation behind new relationships at SWK — turns a broad brief into a practical discussion about location, budget and timing.' },
  { id: 'fareed', name: 'Fareed Choudhary', role: 'Senior Property Consultant', photo: 'assets/team/fareed-choudhary.webp',
    bio: 'Helps buyers look beyond a striking photograph: layout, neighbourhood, running costs and the questions to settle before an offer.' },
  { id: 'issaadi', name: 'Issaadi Chahrazed', role: 'Off-Plan Property Consultant', photo: 'assets/team/issaadi-chahrazed.webp',
    bio: 'Specialises in Dubai off-plan — new launches, payment plans and market trends for confident investment decisions.' },
  { id: 'haseeb', name: 'Mohammad Haseeb', role: 'Sales & Operations Manager', photo: 'assets/team/haseeb.webp',
    bio: 'Keeps the property search, paperwork and handover moving in the same direction, with a clear next step for every client.' },
  { id: 'shahid', name: 'Mohd Shahid Khan', role: 'Office Admin & IT Executive', photo: 'assets/team/mohd-shahid-khan.webp',
    bio: 'Runs day-to-day office operations and the systems behind them so the whole team stays fast and reliable.' },
];

// ILLUSTRATIVE ONLY. No deal ledger was supplied, so these are sample entries that show how
// the portfolio panel works. Replace with real closed deals before launch (set SHOW_SAMPLE_NOTE false after).
export const SHOW_SAMPLE_NOTE = true;
export const DEALS = {
  talha: [
    { kind: 'Sale', title: 'Off-plan apartment', area: 'Business Bay', value: 'AED 1.9M' },
    { kind: 'Rental', title: '2 BR, 12-month lease', area: 'Downtown Dubai', value: 'AED 165K / yr' },
    { kind: 'Sale', title: 'Investor 3-unit bundle', area: 'JVC', value: 'AED 3.2M' },
  ],
  fareed: [
    { kind: 'Sale', title: '4 BR townhouse', area: 'Dubai Hills Estate', value: 'AED 4.8M' },
    { kind: 'Rental', title: 'Family villa', area: 'Arabian Ranches', value: 'AED 260K / yr' },
    { kind: 'Sale', title: 'Resale apartment', area: 'Dubai Marina', value: 'AED 2.4M' },
  ],
  issaadi: [
    { kind: 'Sale', title: 'Launch-day off-plan unit', area: 'Dubai South', value: 'AED 1.26M' },
    { kind: 'Sale', title: 'Waterfront off-plan', area: 'Waterfront', value: 'AED 1.4M' },
    { kind: 'Rental', title: 'Studio, short lease', area: 'JLT', value: 'AED 68K / yr' },
  ],
  haseeb: [
    { kind: 'Sale', title: 'Commercial unit', area: 'Sheikh Zayed Road', value: 'AED 2.1M' },
    { kind: 'Rental', title: 'Office suite', area: 'Business Bay', value: 'AED 190K / yr' },
    { kind: 'Sale', title: 'Off-plan apartment', area: 'Sheikh Zayed Road', value: 'AED 680K' },
  ],
  shahid: [
    { kind: 'Ops', title: 'CRM & listing feed live', area: 'Company-wide', value: '—' },
    { kind: 'Ops', title: 'Digital onboarding for tenants', area: 'Company-wide', value: '—' },
  ],
};

export const AREAS = [
  ['Downtown Dubai', 'Burj Khalifa, Dubai Mall and the fountains — the city’s most recognisable address.'],
  ['Dubai Marina', 'Waterfront towers, promenade living and strong rental demand.'],
  ['Business Bay', 'Canal-side towers a short drive from Downtown and the SZR corridor.'],
  ['Palm Jumeirah', 'Beachfront villas and branded residences on the iconic island.'],
  ['JVC', 'Entry-point apartments and townhouses in a fast-growing community.'],
  ['Dubai Hills Estate', 'Golf-course views, schools and parks within a master-planned estate.'],
  ['Dubai Creek Harbour', 'A new waterfront district beside the Creek and wildlife sanctuary.'],
  ['Sheikh Zayed Road', 'The city’s spine: Emirates Towers, DIFC and direct metro access.'],
];

export const FAQ = [
  ['Can foreigners buy property in Dubai?', 'Yes. Non-UAE nationals can buy freehold property in designated areas. We confirm the area’s freehold status and ownership rules for you before you commit.'],
  ['What are the main costs when buying?', 'Typically a Dubai Land Department transfer fee (currently 4% of the price), an administrative fee, brokerage, and for mortgages a registration fee. We give you an itemised estimate up front.'],
  ['How does buying off-plan work?', 'You pay in stages against a payment plan, and developer payments are held in a regulated escrow account. The sale is registered through DLD (Oqood). We explain the plan, escrow and handover timeline before you sign.'],
  ['Do you help with mortgages?', 'We introduce you to lenders and help you compare indicative terms. Approval and final rates are decided by the bank.'],
  ['Can I rent out my property through SWK?', 'Yes — we handle tenant search, viewings, tenancy contracts and Ejari registration, with optional ongoing property management.'],
  ['Is there a property route to a UAE residence visa?', 'Qualifying property purchases can support a residence visa application. Eligibility and thresholds are set by the authorities, so we point you to current requirements rather than promise an outcome.'],
];
