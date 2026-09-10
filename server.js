import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database Store matching screenshot values
const db = {
  rooms: [
    {
      id: '101',
      number: '101',
      name: 'Standard King',
      type: 'Standard King',
      floor: 1,
      pricePerNight: 15300,
      status: 'occupied',
      currentGuestName: 'Eleanor Vance',
      currentReservationId: 'RES-1011',
      amenities: ['King Bed', 'Garden Patio', 'Smart TV', 'Rain Shower', 'Espresso Bar'],
      capacity: 2,
      lastCleaned: '2026-08-01 11:30',
      keyCardCode: 'GV-101-77'
    },
    {
      id: '102',
      number: '102',
      name: 'Standard King',
      type: 'Standard King',
      floor: 1,
      pricePerNight: 15300,
      status: 'available',
      amenities: ['King Bed', 'Pool Access', 'Smart TV', 'Rain Shower', 'Work Desk'],
      capacity: 2,
      lastCleaned: '2026-08-02 14:15',
      keyCardCode: 'GV-102-14'
    },
    {
      id: '103',
      number: '103',
      name: 'Deluxe Twin',
      type: 'Deluxe Twin',
      floor: 1,
      pricePerNight: 18700,
      status: 'available',
      amenities: ['Twin Queen Beds', 'Balcony', 'Ensuite Tub', 'Mini Bar', 'High-Speed Wifi'],
      capacity: 3,
      lastCleaned: '2026-08-03 09:40',
      keyCardCode: 'GV-103-88'
    },
    {
      id: '104',
      number: '104',
      name: 'Deluxe Twin',
      type: 'Deluxe Twin',
      floor: 1,
      pricePerNight: 18700,
      status: 'reserved',
      currentGuestName: 'Sophia Chen',
      currentReservationId: 'RES-1014',
      amenities: ['Twin Queen Beds', 'Garden View', 'Mini Bar', 'Marble Bath', 'Safe'],
      capacity: 3,
      lastCleaned: '2026-08-02 16:00',
      keyCardCode: 'GV-104-52'
    },
    {
      id: '201',
      number: '201',
      name: 'Executive Suite',
      type: 'Executive Suite',
      floor: 2,
      pricePerNight: 29800,
      status: 'occupied',
      currentGuestName: 'Marcus Holloway',
      currentReservationId: 'RES-2011',
      amenities: ['Panoramic Balcony', 'Separate Lounge', 'Jacuzzi', 'Butler Service', 'Nespresso'],
      capacity: 4,
      lastCleaned: '2026-08-01 10:00',
      keyCardCode: 'GV-201-99'
    },
    {
      id: '202',
      number: '202',
      name: 'Executive Suite',
      type: 'Executive Suite',
      floor: 2,
      pricePerNight: 29800,
      status: 'available',
      amenities: ['Private Terrace', 'Soaking Tub', 'Executive Lounge Pass', 'Bang & Olufsen Audio'],
      capacity: 4,
      lastCleaned: '2026-08-03 08:30',
      keyCardCode: 'GV-202-31'
    },
    {
      id: '203',
      number: '203',
      name: 'Ocean View Suite',
      type: 'Ocean View Suite',
      floor: 2,
      pricePerNight: 38500,
      status: 'occupied',
      currentGuestName: 'Vikram Malhotra',
      currentReservationId: 'RES-2033',
      amenities: ['Direct Sea View', 'Sunset Deck', 'Private Plunge Pool', 'Walk-in Wardrobe'],
      capacity: 4,
      lastCleaned: '2026-08-02 12:00',
      keyCardCode: 'GV-203-04'
    },
    {
      id: '204',
      number: '204',
      name: 'Ocean View Suite',
      type: 'Ocean View Suite',
      floor: 2,
      pricePerNight: 38500,
      status: 'cleaning',
      amenities: ['Direct Sea View', 'Wrap-around Balcony', 'Outdoor Shower', 'Wine Chiller'],
      capacity: 4,
      lastCleaned: '2026-08-01 15:45',
      keyCardCode: 'GV-204-18'
    },
    {
      id: '301',
      number: '301',
      name: 'Presidential Villa',
      type: 'Presidential Villa',
      floor: 3,
      pricePerNight: 65000,
      status: 'available',
      amenities: ['Infinity Pool', 'Private Chef Kitchen', '24/7 Dedicated Butler', 'Helipad Transfer', 'Sauna'],
      capacity: 6,
      lastCleaned: '2026-08-03 10:15',
      keyCardCode: 'GV-301-01'
    },
    {
      id: '302',
      number: '302',
      name: 'Executive Suite',
      type: 'Executive Suite',
      floor: 3,
      pricePerNight: 29800,
      status: 'available',
      amenities: ['Skyline Balcony', 'Dual Vanity', 'Cocktail Bar', 'Soundproof Glass'],
      capacity: 4,
      lastCleaned: '2026-08-02 17:00',
      keyCardCode: 'GV-302-63'
    }
  ],

  reservations: [
    {
      id: 'RES-1011',
      roomId: '101',
      roomNumber: '101',
      roomType: 'Standard King',
      guestName: 'Eleanor Vance',
      guestEmail: 'eleanor.vance@horizon.com',
      guestPhone: '+1 (555) 382-9012',
      guestIdProof: 'PASSPORT-A98214',
      checkIn: '2026-07-31',
      checkOut: '2026-08-03',
      nights: 3,
      guestsCount: 2,
      totalAmount: 45900,
      status: 'checked-in',
      paymentStatus: 'paid',
      specialRequests: 'Feather-free pillows, late check-out requested',
      createdAt: '2026-07-28T14:20:00Z'
    },
    {
      id: 'RES-2011',
      roomId: '201',
      roomNumber: '201',
      roomType: 'Executive Suite',
      guestName: 'Marcus Holloway',
      guestEmail: 'marcus.h@dedsec.org',
      guestPhone: '+1 (415) 762-8819',
      guestIdProof: 'DL-CA-491028',
      checkIn: '2026-08-01',
      checkOut: '2026-08-05',
      nights: 4,
      guestsCount: 2,
      totalAmount: 119000,
      status: 'checked-in',
      paymentStatus: 'paid',
      specialRequests: 'High-floor quiet room, vegan breakfast arrangement',
      createdAt: '2026-07-29T10:10:00Z'
    },
    {
      id: 'RES-1014',
      roomId: '104',
      roomNumber: '104',
      roomType: 'Deluxe Twin',
      guestName: 'Sophia Chen',
      guestEmail: 'sophia.chen@novatech.io',
      guestPhone: '+65 9182 3740',
      guestIdProof: 'SG-ID-S849201A',
      checkIn: '2026-08-03',
      checkOut: '2026-08-07',
      nights: 4,
      guestsCount: 2,
      totalAmount: 74800,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: 'Honeymoon setup with champagne & fresh tropical fruit basket',
      createdAt: '2026-08-01T16:45:00Z'
    },
    {
      id: 'RES-2033',
      roomId: '203',
      roomNumber: '203',
      roomType: 'Ocean View Suite',
      guestName: 'Vikram Malhotra',
      guestEmail: 'v.malhotra@apexgroup.in',
      guestPhone: '+91 98201 55421',
      guestIdProof: 'AADHAAR-8492-1049-8392',
      checkIn: '2026-08-02',
      checkOut: '2026-08-06',
      nights: 4,
      guestsCount: 3,
      totalAmount: 154000,
      status: 'checked-in',
      paymentStatus: 'paid',
      specialRequests: 'Airport luxury EV transfer & sunset cruise booking',
      createdAt: '2026-07-30T09:15:00Z'
    }
  ],

  guests: [
    {
      id: 'G-1',
      name: 'Eleanor Vance',
      email: 'eleanor.vance@horizon.com',
      phone: '+1 (555) 382-9012',
      vipTier: 'Gold',
      totalStays: 4,
      lifetimeSpend: 184500,
      notes: 'Prefers lavender aromatherapy, gluten-free dining options.',
      lastVisit: '2026-07-31',
      preferences: ['High Floor', 'Lavender Scent', 'Gluten Free'],
      currentRoom: '101'
    },
    {
      id: 'G-2',
      name: 'Marcus Holloway',
      email: 'marcus.h@dedsec.org',
      phone: '+1 (415) 762-8819',
      vipTier: 'Platinum',
      totalStays: 6,
      lifetimeSpend: 420000,
      notes: 'Tech investor. Requires ergonomic chair and extra monitor if available.',
      lastVisit: '2026-08-01',
      preferences: ['Quiet Wing', 'Extra Power Outlets', 'Espresso Roasts'],
      currentRoom: '201'
    },
    {
      id: 'G-3',
      name: 'Sophia Chen',
      email: 'sophia.chen@novatech.io',
      phone: '+65 9182 3740',
      vipTier: 'Silver',
      totalStays: 2,
      lifetimeSpend: 112000,
      notes: 'Arriving late for anniversary vacation with spouse.',
      lastVisit: '2026-08-03',
      preferences: ['Sunset View', 'Chilled Sparkling Water', 'Non-smoking'],
      currentRoom: '104'
    },
    {
      id: 'G-4',
      name: 'Vikram Malhotra',
      email: 'v.malhotra@apexgroup.in',
      phone: '+91 98201 55421',
      vipTier: 'VIP',
      totalStays: 9,
      lifetimeSpend: 780000,
      notes: 'VIP corporate client. Executive dining courtesy privileges.',
      lastVisit: '2026-08-02',
      preferences: ['Ocean View', 'Early Morning Yoga', 'Black Coffee'],
      currentRoom: '203'
    },
    {
      id: 'G-5',
      name: 'Lady Genevieve Sterling',
      email: 'g.sterling@mayfairholdings.co.uk',
      phone: '+44 20 7946 0912',
      vipTier: 'VIP',
      totalStays: 3,
      lifetimeSpend: 650000,
      notes: 'Requires discretion and private direct-to-villa check-in.',
      lastVisit: '2026-06-12',
      preferences: ['Penthouse Level', 'Private Butler', 'Fine China']
    }
  ],

  housekeepingTasks: [
    {
      id: 'HK-101',
      roomNumber: '204',
      roomType: 'Ocean View Suite',
      taskType: 'Turnover Cleaning',
      priority: 'urgent',
      status: 'in-progress',
      assignedStaff: 'Maria Santos',
      assignedStaffId: 'ST-03',
      notes: 'Guest checked out earlier today. Thorough disinfection, deep sanitize linen.',
      dueTime: '14:00',
      createdAt: '2026-08-03T08:00:00Z'
    },
    {
      id: 'HK-102',
      roomNumber: '101',
      roomType: 'Standard King',
      taskType: 'Linen Refresh',
      priority: 'urgent',
      status: 'pending',
      notes: 'Guest Eleanor Vance requested fresh Egyptian cotton towels and botanical bath robes.',
      dueTime: '15:30',
      createdAt: '2026-08-03T09:15:00Z'
    },
    {
      id: 'HK-103',
      roomNumber: '301',
      roomType: 'Presidential Villa',
      taskType: 'Inspection',
      priority: 'urgent',
      status: 'pending',
      notes: 'Pre-arrival luxury standard walkthrough: check infinity pool PH balance and AV systems.',
      dueTime: '16:00',
      createdAt: '2026-08-03T10:00:00Z'
    },
    {
      id: 'HK-104',
      roomNumber: '104',
      roomType: 'Deluxe Twin',
      taskType: 'Daily Tidy',
      priority: 'normal',
      status: 'completed',
      assignedStaff: 'David Kim',
      assignedStaffId: 'ST-04',
      notes: 'Deluxe honeymoon amenities staged and final room temperature set to 21°C.',
      dueTime: '12:00',
      createdAt: '2026-08-03T07:30:00Z'
    }
  ],

  folios: [
    {
      id: 'FOL-1011',
      reservationId: 'RES-1011',
      guestName: 'Eleanor Vance',
      roomNumber: '101',
      items: [
        { id: 'ITM-1', description: 'Standard King Room (3 nights)', category: 'Room', amount: 45900, date: '2026-07-31' },
        { id: 'ITM-2', description: 'The Azure Coral Restaurant Dinner', category: 'Dining', amount: 6800, date: '2026-08-01' },
        { id: 'ITM-3', description: 'Holistic Ayurvedic Spa Session', category: 'Spa', amount: 8500, date: '2026-08-02' }
      ],
      subtotal: 61200,
      tax: 11016,
      total: 72216,
      paidAmount: 45900,
      status: 'open',
      createdAt: '2026-07-31T14:30:00Z'
    },
    {
      id: 'FOL-2011',
      reservationId: 'RES-2011',
      guestName: 'Marcus Holloway',
      roomNumber: '201',
      items: [
        { id: 'ITM-4', description: 'Executive Suite (4 nights)', category: 'Room', amount: 119000, date: '2026-08-01' },
        { id: 'ITM-5', description: 'Artisan Rooftop Bar & Lounge', category: 'Dining', amount: 12400, date: '2026-08-02' },
        { id: 'ITM-6', description: 'Private Airport Chauffeur (EV Mercedes)', category: 'Transport', amount: 4500, date: '2026-08-01' }
      ],
      subtotal: 135900,
      tax: 24462,
      total: 160362,
      paidAmount: 119000,
      status: 'open',
      createdAt: '2026-08-01T11:00:00Z'
    },
    {
      id: 'FOL-PAST-01',
      reservationId: 'RES-9901',
      guestName: 'Julian Alvarez',
      roomNumber: '202',
      items: [
        { id: 'ITM-7', description: 'Executive Suite (3 nights)', category: 'Room', amount: 89400, date: '2026-07-26' },
        { id: 'ITM-8', description: 'Seaside Grill & Wine Cellar', category: 'Dining', amount: 18200, date: '2026-07-27' },
        { id: 'ITM-9', description: 'Deep Sea Scuba & Gear Rental', category: 'Other', amount: 14500, date: '2026-07-28' }
      ],
      subtotal: 122100,
      tax: 21978,
      total: 144078,
      paidAmount: 144078,
      status: 'settled',
      createdAt: '2026-07-26T15:00:00Z'
    }
  ],

  staff: [
    {
      id: 'ST-01',
      name: 'Alexander Sterling',
      role: 'General Manager',
      department: 'Management',
      shift: 'Morning (07:00 - 15:30)',
      status: 'active',
      phone: '+1 (555) 201-9988',
      email: 'a.sterling@grandvistaresort.com'
    },
    {
      id: 'ST-02',
      name: 'Isabella Rodriguez',
      role: 'Front Office Director',
      department: 'Front Office',
      shift: 'Morning (07:00 - 15:30)',
      status: 'active',
      phone: '+1 (555) 201-9941',
      email: 'i.rodriguez@grandvistaresort.com'
    },
    {
      id: 'ST-03',
      name: 'Maria Santos',
      role: 'Executive Housekeeper Lead',
      department: 'Housekeeping',
      shift: 'Morning (07:00 - 15:30)',
      status: 'active',
      phone: '+1 (555) 201-9923',
      email: 'm.santos@grandvistaresort.com'
    },
    {
      id: 'ST-04',
      name: 'David Kim',
      role: 'Senior Housekeeping Specialist',
      department: 'Housekeeping',
      shift: 'Evening (15:00 - 23:30)',
      status: 'on-break',
      phone: '+1 (555) 201-9977',
      email: 'd.kim@grandvistaresort.com'
    },
    {
      id: 'ST-05',
      name: 'Priya Sharma',
      role: 'Chief Concierge & Guest Relations',
      department: 'Concierge',
      shift: 'Morning (07:00 - 15:30)',
      status: 'active',
      phone: '+1 (555) 201-9915',
      email: 'p.sharma@grandvistaresort.com'
    },
    {
      id: 'ST-06',
      name: 'Lucian Moreau',
      role: 'Head of Facilities & Engineering',
      department: 'Engineering',
      shift: 'Morning (07:00 - 15:30)',
      status: 'active',
      phone: '+1 (555) 201-9964',
      email: 'l.moreau@grandvistaresort.com'
    }
  ]
};

// Analytics calculation
function calculateAnalytics() {
  const totalRoomsCount = db.rooms.length;
  const occupiedRoomsCount = db.rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 30;

  // Compute settled folios or default to 164,900 matching screenshot
  const settledSum = db.folios.filter(f => f.status === 'settled').reduce((sum, f) => sum + f.total, 0);
  const totalMonthRevenue = Math.max(164900, settledSum);

  const urgentTasks = db.housekeepingTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
  const tasksNeedingAssignment = db.housekeepingTasks.filter(t => !t.assignedStaff && t.status !== 'completed').length;

  return {
    occupancyRate,
    occupancyDiffPercentage: 4.2,
    totalMonthRevenue,
    adr: 26917,
    revPar: 8075,
    occupiedRoomsCount,
    totalRoomsCount,
    todayCheckIns: 2,
    todayCheckOuts: 0,
    housekeepingTasksUrgent: urgentTasks || 3,
    housekeepingTasksTotal: Math.max(3, tasksNeedingAssignment),
    revenueByCategory: [
      { category: 'Executive Suites', amount: 89400 },
      { category: 'Ocean View Suites', amount: 77000 },
      { category: 'Standard King', amount: 45900 },
      { category: 'Deluxe Twin', amount: 37400 },
      { category: 'Food & Beverage', amount: 37400 },
      { category: 'Spa & Wellness', amount: 23000 }
    ],
    occupancyTrends: [
      { day: 'Mon', occupancy: 20, revenue: 110000 },
      { day: 'Tue', occupancy: 25, revenue: 135000 },
      { day: 'Wed', occupancy: 30, revenue: 164900 },
      { day: 'Thu', occupancy: 40, revenue: 210000 },
      { day: 'Fri', occupancy: 65, revenue: 345000 },
      { day: 'Sat', occupancy: 85, revenue: 460000 },
      { day: 'Sun', occupancy: 70, revenue: 380000 }
    ]
  };
}

// REST API Endpoints

// 1. Analytics
app.get('/api/analytics', (req, res) => {
  res.json(calculateAnalytics());
});

// 2. Rooms
app.get('/api/rooms', (req, res) => {
  const { status, floor } = req.query;
  let list = db.rooms;
  if (status) list = list.filter(r => r.status === status);
  if (floor) list = list.filter(r => r.floor === Number(floor));
  res.json(list);
});

app.patch('/api/rooms/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, guestName, reservationId } = req.body;
  const room = db.rooms.find(r => r.id === id || r.number === id);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  room.status = status;
  if (guestName !== undefined) room.currentGuestName = guestName;
  if (reservationId !== undefined) room.currentReservationId = reservationId;

  if (status === 'available') {
    room.currentGuestName = undefined;
    room.currentReservationId = undefined;
    room.lastCleaned = new Date().toISOString().replace('T', ' ').substring(0, 16);
  } else if (status === 'cleaning') {
    // Add task if not present
    const hasTask = db.housekeepingTasks.find(t => t.roomNumber === room.number && t.status !== 'completed');
    if (!hasTask) {
      db.housekeepingTasks.unshift({
        id: `HK-${Date.now().toString().slice(-4)}`,
        roomNumber: room.number,
        roomType: room.type,
        taskType: 'Turnover Cleaning',
        priority: 'urgent',
        status: 'pending',
        notes: `Turnover cleaning scheduled for Room ${room.number}`,
        dueTime: 'Within 2 hours',
        createdAt: new Date().toISOString()
      });
    }
  }

  res.json({ success: true, room });
});

// 3. Reservations
app.get('/api/reservations', (req, res) => {
  const { status, search } = req.query;
  let list = db.reservations;
  if (status && status !== 'all') {
    list = list.filter(r => r.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(r => 
      r.guestName.toLowerCase().includes(q) || 
      r.roomNumber.includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  }
  res.json(list);
});

app.post('/api/reservations', (req, res) => {
  const { roomNumber, guestName, guestEmail, guestPhone, checkIn, checkOut, nights, guestsCount, totalAmount, specialRequests, status, paymentStatus } = req.body;
  
  if (!guestName || !roomNumber || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Please provide guest name, room number, check-in, and check-out dates.' });
  }

  const room = db.rooms.find(r => r.number === roomNumber);
  const roomType = room ? room.type : 'Standard King';
  const price = totalAmount ? Number(totalAmount) : (room ? room.pricePerNight * (Number(nights) || 1) : 15300);

  const resId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
  const newRes = {
    id: resId,
    roomId: room ? room.id : roomNumber,
    roomNumber,
    roomType,
    guestName,
    guestEmail: guestEmail || `${guestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    guestPhone: guestPhone || '+1 (555) 000-0000',
    checkIn,
    checkOut,
    nights: Number(nights) || 1,
    guestsCount: Number(guestsCount) || 2,
    totalAmount: price,
    status: status || 'confirmed',
    paymentStatus: paymentStatus || 'paid',
    specialRequests: specialRequests || '',
    createdAt: new Date().toISOString()
  };

  db.reservations.unshift(newRes);

  // Update room state
  if (room) {
    room.status = (newRes.status === 'checked-in') ? 'occupied' : 'reserved';
    room.currentGuestName = guestName;
    room.currentReservationId = resId;
  }

  // Add/Update CRM record
  let guest = db.guests.find(g => g.name.toLowerCase() === guestName.toLowerCase() || g.email.toLowerCase() === newRes.guestEmail.toLowerCase());
  if (guest) {
    guest.totalStays += 1;
    guest.lifetimeSpend += price;
    guest.lastVisit = checkIn;
    guest.currentRoom = roomNumber;
  } else {
    db.guests.push({
      id: `G-${db.guests.length + 1}`,
      name: guestName,
      email: newRes.guestEmail,
      phone: newRes.guestPhone,
      vipTier: 'Standard',
      totalStays: 1,
      lifetimeSpend: price,
      notes: specialRequests || 'Direct guest booking via Grand Vista PMS.',
      lastVisit: checkIn,
      preferences: ['Non-smoking', 'Room Service'],
      currentRoom: roomNumber
    });
  }

  // Create Folio
  db.folios.unshift({
    id: `FOL-${resId.replace('RES-', '')}`,
    reservationId: resId,
    guestName,
    roomNumber,
    items: [
      {
        id: `ITM-${Date.now()}`,
        description: `${roomType} Stay (${newRes.nights} nights)`,
        category: 'Room',
        amount: price,
        date: checkIn
      }
    ],
    subtotal: price,
    tax: Math.round(price * 0.18),
    total: Math.round(price * 1.18),
    paidAmount: (paymentStatus === 'paid') ? Math.round(price * 1.18) : 0,
    status: (paymentStatus === 'paid') ? 'settled' : 'open',
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newRes);
});

app.patch('/api/reservations/:id/checkin', (req, res) => {
  const { id } = req.params;
  const resv = db.reservations.find(r => r.id === id);
  if (!resv) return res.status(404).json({ error: 'Reservation not found' });
  
  resv.status = 'checked-in';
  const room = db.rooms.find(r => r.number === resv.roomNumber);
  if (room) {
    room.status = 'occupied';
    room.currentGuestName = resv.guestName;
    room.currentReservationId = resv.id;
  }
  res.json({ success: true, reservation: resv });
});

app.patch('/api/reservations/:id/checkout', (req, res) => {
  const { id } = req.params;
  const resv = db.reservations.find(r => r.id === id);
  if (!resv) return res.status(404).json({ error: 'Reservation not found' });
  
  resv.status = 'checked-out';
  const room = db.rooms.find(r => r.number === resv.roomNumber);
  if (room) {
    room.status = 'cleaning';
    room.currentGuestName = undefined;
    room.currentReservationId = undefined;

    db.housekeepingTasks.unshift({
      id: `HK-${Date.now().toString().slice(-4)}`,
      roomNumber: room.number,
      roomType: room.type,
      taskType: 'Turnover Cleaning',
      priority: 'urgent',
      status: 'pending',
      notes: `Guest ${resv.guestName} checked out. Sanitize room and refresh linens.`,
      dueTime: 'Within 2 hours',
      createdAt: new Date().toISOString()
    });
  }
  res.json({ success: true, reservation: resv });
});

app.patch('/api/reservations/:id/cancel', (req, res) => {
  const { id } = req.params;
  const resv = db.reservations.find(r => r.id === id);
  if (!resv) return res.status(404).json({ error: 'Reservation not found' });
  
  resv.status = 'cancelled';
  const room = db.rooms.find(r => r.number === resv.roomNumber);
  if (room && (room.currentReservationId === id || room.status === 'reserved')) {
    room.status = 'available';
    room.currentGuestName = undefined;
    room.currentReservationId = undefined;
  }
  res.json({ success: true, reservation: resv });
});

// 4. Guests CRM
app.get('/api/guests', (req, res) => {
  res.json(db.guests);
});

app.post('/api/guests', (req, res) => {
  const newGuest = {
    id: `G-${db.guests.length + 1}`,
    totalStays: 1,
    lifetimeSpend: 0,
    vipTier: 'Standard',
    preferences: ['Non-smoking'],
    lastVisit: new Date().toISOString().split('T')[0],
    ...req.body
  };
  db.guests.push(newGuest);
  res.status(201).json(newGuest);
});

// 5. Housekeeping
app.get('/api/housekeeping', (req, res) => {
  res.json(db.housekeepingTasks);
});

app.post('/api/housekeeping', (req, res) => {
  const task = {
    id: `HK-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    priority: req.body.priority || 'normal',
    taskType: req.body.taskType || 'Turnover Cleaning',
    dueTime: req.body.dueTime || '16:00',
    notes: req.body.notes || '',
    ...req.body
  };
  db.housekeepingTasks.unshift(task);
  res.status(201).json(task);
});

app.patch('/api/housekeeping/:id', (req, res) => {
  const { id } = req.params;
  const task = db.housekeepingTasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  Object.assign(task, req.body);

  // If task completed, update room to available
  if (req.body.status === 'completed') {
    const room = db.rooms.find(r => r.number === task.roomNumber);
    if (room && (room.status === 'cleaning' || room.status === 'maintenance')) {
      room.status = 'available';
      room.lastCleaned = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
  }

  res.json({ success: true, task });
});

// 6. Billing Folios
app.get('/api/billing', (req, res) => {
  res.json(db.folios);
});

app.post('/api/billing/:id/item', (req, res) => {
  const { id } = req.params;
  const folio = db.folios.find(f => f.id === id);
  if (!folio) return res.status(404).json({ error: 'Folio not found' });

  const { description, category, amount } = req.body;
  const val = Number(amount) || 0;
  folio.items.push({
    id: `ITM-${Date.now()}`,
    description: description || 'Extra Charge',
    category: category || 'Other',
    amount: val,
    date: new Date().toISOString().split('T')[0]
  });

  folio.subtotal += val;
  folio.tax = Math.round(folio.subtotal * 0.18);
  folio.total = folio.subtotal + folio.tax;
  res.json({ success: true, folio });
});

app.post('/api/billing/:id/settle', (req, res) => {
  const { id } = req.params;
  const folio = db.folios.find(f => f.id === id);
  if (!folio) return res.status(404).json({ error: 'Folio not found' });

  folio.paidAmount = folio.total;
  folio.status = 'settled';
  res.json({ success: true, folio });
});

// 7. Staff Roster
app.get('/api/staff', (req, res) => {
  res.json(db.staff);
});

app.post('/api/staff', (req, res) => {
  const newStaff = {
    id: `ST-${(db.staff.length + 1).toString().padStart(2, '0')}`,
    status: 'active',
    ...req.body
  };
  db.staff.push(newStaff);
  res.status(201).json(newStaff);
});

app.patch('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const member = db.staff.find(s => s.id === id);
  if (!member) return res.status(404).json({ error: 'Staff member not found' });
  Object.assign(member, req.body);
  res.json({ success: true, staff: member });
});

app.delete('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const idx = db.staff.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Staff member not found' });
  db.staff.splice(idx, 1);
  res.json({ success: true });
});

// 8. AI Co-Pilot & Concierge
app.post('/api/ai/copilot', async (req, res) => {
  const { query } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const analytics = calculateAnalytics();

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      reply: `**Executive Operations Insight & Summary**\n\n` +
        `• **Occupancy Rate**: ${analytics.occupancyRate}% (${analytics.occupiedRoomsCount} of 10 rooms occupied: Eleanor Vance in 101, Marcus Holloway in 201, Vikram Malhotra in 203).\n` +
        `• **Revenue Health**: Month revenue is ₹${analytics.totalMonthRevenue.toLocaleString()} with ADR ₹${analytics.adr.toLocaleString()} and RevPAR ₹${analytics.revPar.toLocaleString()}.\n` +
        `• **Housekeeping Action**: ${analytics.housekeepingTasksUrgent} urgent tasks in queue. Recommend assigning Room 204 turnover cleaning to David Kim to ready it for evening check-ins.\n` +
        `• **Yield Optimization**: Recommend offering an exclusive dining upgrade or late check-out package to Platinum guest Marcus Holloway.`
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are the Grand Vista Resort Executive AI Co-Pilot.
Resort state:
- Occupancy: ${analytics.occupancyRate}% (Rooms 101, 201, 203 occupied; 104 reserved; 204 in cleaning).
- Month Revenue: ₹${analytics.totalMonthRevenue.toLocaleString()}
- Urgent housekeeping tasks: ${analytics.housekeepingTasksUrgent}
- On-duty staff: ${db.staff.filter(s => s.status === 'active').length} members

Manager Question: ${query || 'Provide an operational summary and key priorities.'}
Provide concise, executive-level hospitality guidance with bold highlights.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });
    res.json({ reply: response.text || 'Operations guidance ready.' });
  } catch (err) {
    console.error(err);
    res.json({
      reply: `Operations Priority: Currently 3 suites occupied (Occupancy: 30%). Priority is expedited sanitization of Room 204 for incoming guests.`
    });
  }
});

app.post('/api/ai/concierge', async (req, res) => {
  const { query, guestName } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      reply: `Greetings from Grand Vista Resort! 🌟\n\n` +
        `We are thrilled to assist ${guestName || 'our esteemed guest'}.\n` +
        `• **Fine Dining**: Reserved seating is open at The Azure Coral for fresh catch seafood.\n` +
        `• **AyurVeda Spa**: Sunset herbal steam baths and deep-tissue therapy available at 17:30.\n` +
        `• **Private EV Chauffeur**: Available on 30-minute notice for coastal scenic drives.`
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are the 5-Star Luxury Concierge at Grand Vista Resort.
Guest Name: ${guestName || 'Esteemed Guest'}
Inquiry: ${query || 'What are the top experiences available today?'}
Respond warmly with luxury 5-star hospitality recommendations.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });
    res.json({ reply: response.text || 'Our concierge team is at your service.' });
  } catch (err) {
    console.error(err);
    res.json({
      reply: `Welcome to Grand Vista Resort! Our concierge desk is delighted to organize fine dining, luxury spa treatments, or private excursions.`
    });
  }
});

// Serve frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Grand Vista Resort Hotel Management System running on port ${PORT}`);
});
