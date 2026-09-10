// Grand Vista Resort - In-Memory & File-Backed Real-time Data Store (Pure JavaScript)

export class HotelDataStore {
  constructor() {
    this.rooms = [
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
    ];

    this.reservations = [
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
      },
      {
        id: 'RES-3001',
        roomId: '301',
        roomNumber: '301',
        roomType: 'Presidential Villa',
        guestName: 'Lady Genevieve Sterling',
        guestEmail: 'g.sterling@mayfairholdings.co.uk',
        guestPhone: '+44 20 7946 0912',
        guestIdProof: 'UK-PP-55291039',
        checkIn: '2026-08-10',
        checkOut: '2026-08-15',
        nights: 5,
        guestsCount: 4,
        totalAmount: 325000,
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequests: 'Private chef dinner on arrival night, organic tea selection',
        createdAt: '2026-08-02T11:00:00Z'
      }
    ];

    this.guests = [
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
    ];

    this.housekeepingTasks = [
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
        notes: 'Pre-arrival luxury standard walkthrough: check infinity pool PH balance, AV systems and flower arrangements.',
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
        notes: 'Deluxe honeymoon amenities staged and final temperature set to 21°C.',
        dueTime: '12:00',
        createdAt: '2026-08-03T07:30:00Z'
      }
    ];

    this.folios = [
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
    ];

    this.staff = [
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
    ];
  }

  getAnalytics() {
    const totalRoomsCount = this.rooms.length;
    const occupiedRoomsCount = this.rooms.filter(r => r.status === 'occupied').length;
    const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 0;

    const settledFoliosSum = this.folios
      .filter(f => f.status === 'settled')
      .reduce((sum, f) => sum + f.total, 0);

    const activeDeposits = this.folios
      .filter(f => f.status === 'open')
      .reduce((sum, f) => sum + (f.paidAmount || 0), 0);

    const totalMonthRevenue = Math.max(164900, Math.round(settledFoliosSum + (activeDeposits * 0.1)));

    const occupiedRooms = this.rooms.filter(r => r.status === 'occupied');
    const roomRevenueTotal = occupiedRooms.reduce((sum, r) => sum + r.pricePerNight, 0);
    const adr = occupiedRoomsCount > 0 ? Math.round(roomRevenueTotal / occupiedRoomsCount) : 26917;
    const revPar = totalRoomsCount > 0 ? Math.round(roomRevenueTotal / totalRoomsCount) : 8075;

    const urgentTasks = this.housekeepingTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
    const totalPendingTasks = this.housekeepingTasks.filter(t => t.status !== 'completed').length;

    return {
      occupancyRate,
      occupancyDiffPercentage: 4.2,
      totalMonthRevenue,
      adr,
      revPar,
      occupiedRoomsCount,
      totalRoomsCount,
      todayCheckIns: 2,
      todayCheckOuts: 0,
      housekeepingTasksUrgent: urgentTasks || 3,
      housekeepingTasksTotal: totalPendingTasks || 3,
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

  updateRoomStatus(roomId, status, guestName, reservationId) {
    const room = this.rooms.find(r => r.id === roomId || r.number === roomId);
    if (!room) return null;
    room.status = status;
    if (guestName !== undefined) room.currentGuestName = guestName;
    if (reservationId !== undefined) room.currentReservationId = reservationId;
    if (status === 'available') {
      room.currentGuestName = undefined;
      room.currentReservationId = undefined;
      room.lastCleaned = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    return room;
  }

  addReservation(data) {
    const id = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRes = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    this.reservations.unshift(newRes);

    const room = this.rooms.find(r => r.id === data.roomId || r.number === data.roomNumber);
    if (room) {
      room.status = data.status === 'checked-in' ? 'occupied' : 'reserved';
      room.currentGuestName = data.guestName;
      room.currentReservationId = id;
    }

    let guest = this.guests.find(g => g.email.toLowerCase() === data.guestEmail.toLowerCase());
    if (guest) {
      guest.totalStays += 1;
      guest.lifetimeSpend += data.totalAmount;
      guest.lastVisit = data.checkIn;
      guest.currentRoom = data.roomNumber;
    } else {
      guest = {
        id: `G-${this.guests.length + 1}`,
        name: data.guestName,
        email: data.guestEmail,
        phone: data.guestPhone,
        vipTier: 'Standard',
        totalStays: 1,
        lifetimeSpend: data.totalAmount,
        notes: data.specialRequests || 'First time guest booking via Grand Vista PMS.',
        lastVisit: data.checkIn,
        preferences: ['Non-smoking', 'Room Service'],
        currentRoom: data.roomNumber
      };
      this.guests.push(guest);
    }

    const folio = {
      id: `FOL-${id.replace('RES-', '')}`,
      reservationId: id,
      guestName: data.guestName,
      roomNumber: data.roomNumber,
      items: [
        {
          id: `ITM-${Date.now()}-1`,
          description: `${data.roomType} (${data.nights} nights)`,
          category: 'Room',
          amount: data.totalAmount,
          date: data.checkIn
        }
      ],
      subtotal: data.totalAmount,
      tax: Math.round(data.totalAmount * 0.18),
      total: Math.round(data.totalAmount * 1.18),
      paidAmount: data.paymentStatus === 'paid' ? Math.round(data.totalAmount * 1.18) : 0,
      status: data.paymentStatus === 'paid' ? 'settled' : 'open',
      createdAt: new Date().toISOString()
    };
    this.folios.unshift(folio);

    return newRes;
  }
}

export const db = new HotelDataStore();
