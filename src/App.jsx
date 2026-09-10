import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  Plus, 
  BedDouble, 
  IndianRupee, 
  Calendar, 
  CalendarDays,
  Broom, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Filter, 
  Layers, 
  DoorClosed, 
  X, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  ChevronRight, 
  Send, 
  Phone, 
  Mail, 
  RefreshCw,
  Award,
  ArrowUpRight,
  LogOut,
  SlidersHorizontal,
  Bot
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Live Data State
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [housekeeping, setHousekeeping] = useState([]);
  const [folios, setFolios] = useState([]);
  const [staff, setStaff] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [showAiConciergeModal, setShowAiConciergeModal] = useState(false);
  const [showAiCopilotModal, setShowAiCopilotModal] = useState(false);
  const [selectedRoomForQuickEdit, setSelectedRoomForQuickEdit] = useState(null);
  const [selectedGuestDetail, setSelectedGuestDetail] = useState(null);

  // AI Chat States
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([
    {
      role: 'assistant',
      text: 'Good day, Executive Director. Grand Vista Resort is operating smoothly at 30% occupancy today. RevPAR is at ₹8,075. How may I assist your operations or revenue optimization today?'
    }
  ]);

  const [conciergeQuery, setConciergeQuery] = useState('');
  const [conciergeLoading, setConciergeLoading] = useState(false);
  const [conciergeMessages, setConciergeMessages] = useState([
    {
      role: 'assistant',
      text: 'Welcome to Grand Vista 5-Star Concierge. May I reserve dinner at The Azure Coral, arrange private EV chauffeur transfers, or book our sunset yacht charter?'
    }
  ]);

  // Reservation Form State
  const [newResvData, setNewResvData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestIdProof: '',
    roomNumber: '102',
    checkIn: '2026-08-04',
    checkOut: '2026-08-07',
    guestsCount: 2,
    specialRequests: '',
    paymentStatus: 'paid'
  });

  // Filter States
  const [roomFilterFloor, setRoomFilterFloor] = useState('all');
  const [roomFilterStatus, setRoomFilterStatus] = useState('all');
  const [reservationSearch, setReservationSearch] = useState('');

  // Initial Fetch & Periodic Auto-refresh for real-time synchronization
  const fetchAllData = async () => {
    try {
      const [roomsRes, resvRes, guestsRes, hkRes, foliosRes, staffRes, analyticsRes] = await Promise.all([
        fetch('/api/rooms').then(r => r.json()),
        fetch('/api/reservations').then(r => r.json()),
        fetch('/api/guests').then(r => r.json()),
        fetch('/api/housekeeping').then(r => r.json()),
        fetch('/api/billing').then(r => r.json()),
        fetch('/api/staff').then(r => r.json()),
        fetch('/api/analytics').then(r => r.json())
      ]);

      setRooms(roomsRes);
      setReservations(resvRes);
      setGuests(guestsRes);
      setHousekeeping(hkRes);
      setFolios(foliosRes);
      setStaff(staffRes);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Error fetching hotel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Room Status Change
  const handleRoomStatusUpdate = async (roomId, newStatus) => {
    try {
      await fetch(`/api/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setSelectedRoomForQuickEdit(null);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Reservation Actions: Check In, Check Out, Cancel
  const handleCheckIn = async (resvId) => {
    try {
      await fetch(`/api/reservations/${resvId}/checkin`, { method: 'PATCH' });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async (resvId) => {
    try {
      await fetch(`/api/reservations/${resvId}/checkout`, { method: 'PATCH' });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelReservation = async (resvId) => {
    try {
      await fetch(`/api/reservations/${resvId}/cancel`, { method: 'PATCH' });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Housekeeping Task Status
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await fetch(`/api/housekeeping/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Settle Folio
  const handleSettleFolio = async (folioId) => {
    try {
      await fetch(`/api/billing/${folioId}/settle`, { method: 'POST' });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Reservation
  const handleCreateReservation = async (e) => {
    e.preventDefault();
    const chosenRoom = rooms.find(r => r.number === newResvData.roomNumber);
    const nights = Math.max(1, Math.round((new Date(newResvData.checkOut) - new Date(newResvData.checkIn)) / (1000 * 60 * 60 * 24)));
    const pricePerNight = chosenRoom ? chosenRoom.pricePerNight : 18000;
    const totalAmount = pricePerNight * nights;

    try {
      const payload = {
        ...newResvData,
        roomId: chosenRoom ? chosenRoom.id : newResvData.roomNumber,
        roomType: chosenRoom ? chosenRoom.type : 'Standard King',
        nights,
        totalAmount,
        status: 'confirmed'
      };

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowNewReservationModal(false);
        setNewResvData({
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          guestIdProof: '',
          roomNumber: '102',
          checkIn: '2026-08-04',
          checkOut: '2026-08-07',
          guestsCount: 2,
          specialRequests: '',
          paymentStatus: 'paid'
        });
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle AI Copilot submit
  const handleCopilotSubmit = async (e) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;

    const userMsg = { role: 'user', text: copilotQuery };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotQuery('');
    setCopilotLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.text })
      });
      const data = await res.json();
      setCopilotMessages(prev => [...prev, { role: 'assistant', text: data.reply || 'Analysis completed.' }]);
    } catch (err) {
      setCopilotMessages(prev => [...prev, { role: 'assistant', text: 'Operational query logged. Resort systems normal.' }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Handle AI Concierge submit
  const handleConciergeSubmit = async (e) => {
    e.preventDefault();
    if (!conciergeQuery.trim()) return;

    const userMsg = { role: 'user', text: conciergeQuery };
    setConciergeMessages(prev => [...prev, userMsg]);
    setConciergeQuery('');
    setConciergeLoading(true);

    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.text })
      });
      const data = await res.json();
      setConciergeMessages(prev => [...prev, { role: 'assistant', text: data.reply || 'Concierge team at your service.' }]);
    } catch (err) {
      setConciergeMessages(prev => [...prev, { role: 'assistant', text: 'Concierge request recorded. A host will contact you shortly.' }]);
    } finally {
      setConciergeLoading(false);
    }
  };

  // Style helper for room card matching user's screenshot
  const getRoomCardStyle = (room) => {
    switch (room.status) {
      case 'occupied':
        return {
          cardBg: 'bg-[#eef2ff] border-indigo-200/80 hover:border-indigo-400',
          titleColor: 'text-indigo-900',
          dotColor: 'bg-indigo-600',
          badgeColor: 'text-indigo-700',
          badgeText: 'Occupied'
        };
      case 'available':
        return {
          cardBg: 'bg-[#ecfdf5] border-emerald-200/80 hover:border-emerald-400',
          titleColor: 'text-emerald-950',
          dotColor: 'bg-emerald-500',
          badgeColor: 'text-emerald-700',
          badgeText: 'Available'
        };
      case 'reserved':
        return {
          cardBg: 'bg-[#fffbeb] border-amber-200/80 hover:border-amber-400',
          titleColor: 'text-amber-950',
          dotColor: 'bg-amber-500',
          badgeColor: 'text-amber-700',
          badgeText: 'Reserved'
        };
      case 'cleaning':
      case 'maintenance':
      default:
        return {
          cardBg: 'bg-[#fff1f2] border-rose-200/80 hover:border-rose-400',
          titleColor: 'text-rose-950',
          dotColor: 'bg-rose-500',
          badgeColor: 'text-rose-700',
          badgeText: room.status === 'cleaning' ? 'Cleaning' : 'Maintenance'
        };
    }
  };

  // Fallback metrics if loading
  const stats = analytics || {
    occupancyRate: 30,
    occupancyDiffPercentage: 4.2,
    totalMonthRevenue: 164900,
    adr: 26917,
    revPar: 8075,
    occupiedRoomsCount: 3,
    totalRoomsCount: 10,
    todayCheckIns: 2,
    todayCheckOuts: 0,
    housekeepingTasksUrgent: 3,
    housekeepingTasksTotal: 3
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-slate-800 flex flex-col font-sans">
      {/* 1. TOP HEADER - EXACT MATCH TO SCREENSHOT */}
      <header className="bg-[#0b1322] border-b border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between shadow-md">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b] text-[#0b1322] flex items-center justify-center font-black shadow-md">
            <Building2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-white font-bold text-lg md:text-xl tracking-tight font-display">
                Grand Vista Resort
              </h1>
              <span className="bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/40 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                5-Star PMS
              </span>
            </div>
            <p className="text-slate-400 text-xs font-normal">
              Smart Hotel Operations & Guest Experience
            </p>
          </div>
        </div>

        {/* Right Status & Primary Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Occupancy Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-[#121e36] border border-slate-700/70 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Occupancy: <strong className="text-emerald-400 font-bold">{stats.occupancyRate}%</strong></span>
          </div>

          {/* AI Concierge Button */}
          <button
            id="btn-ai-concierge"
            onClick={() => setShowAiConciergeModal(true)}
            className="flex items-center gap-1.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-xs md:text-sm font-medium px-3.5 py-1.5 rounded-xl shadow-sm transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Concierge</span>
          </button>

          {/* New Reservation Button */}
          <button
            id="btn-new-reservation-top"
            onClick={() => setShowNewReservationModal(true)}
            className="flex items-center gap-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs md:text-sm font-bold px-4 py-1.5 rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Reservation</span>
          </button>
        </div>
      </header>

      {/* 2. NAVIGATION BAR - DASHBOARD AND ALL PMS MODULES */}
      <nav className="bg-[#0b1322] border-b border-slate-800/80 px-4 md:px-8 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Layers },
          { id: 'rooms', label: 'Rooms & Floors', icon: BedDouble },
          { id: 'reservations', label: 'Reservations', icon: CalendarDays },
          { id: 'crm', label: 'Guest CRM', icon: Users },
          { id: 'housekeeping', label: 'Housekeeping', icon: Broom },
          { id: 'billing', label: 'Billing & Folios', icon: CreditCard },
          { id: 'staff', label: 'Staff Roster', icon: UserCheck },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#f59e0b] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
        {/* TAB 1: DASHBOARD (EXACT SCREENSHOT LAYOUT) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* HERO CARD: EXECUTIVE OPERATIONS DASHBOARD */}
            <div className="bg-gradient-to-r from-[#0d1424] via-[#111d38] to-[#16274b] rounded-2xl p-6 md:p-7 text-white shadow-lg border border-slate-800/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30 px-3 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Smart Operations Active</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
                  Executive Operations Dashboard
                </h2>
                <p className="text-slate-300 text-xs md:text-sm font-normal leading-relaxed">
                  Real-time monitoring of room statuses, active reservations, guest billing, and housekeeping schedules at Grand Vista Resort.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  id="btn-ask-copilot"
                  onClick={() => setShowAiCopilotModal(true)}
                  className="flex items-center gap-2 bg-[#1b2845] hover:bg-[#25375d] text-slate-200 border border-slate-700/80 text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <Bot className="w-4 h-4 text-amber-300" />
                  <span>Ask AI Co-Pilot</span>
                </button>
                <button
                  id="btn-new-reservation-hero"
                  onClick={() => setShowNewReservationModal(true)}
                  className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Reservation</span>
                </button>
              </div>
            </div>

            {/* 4 KPI METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Occupancy Rate */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium text-xs">Occupancy Rate</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BedDouble className="w-4 h-4 stroke-[2]" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-bold text-slate-900 font-display">
                      {stats.occupancyRate}%
                    </span>
                    <span className="text-emerald-600 text-xs font-semibold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5 inline" /> +{stats.occupancyDiffPercentage}% vs last week
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats.occupiedRoomsCount} of {stats.totalRoomsCount} rooms occupied
                  </p>
                </div>
              </div>

              {/* Card 2: Total Month Revenue */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium text-xs">Total Month Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 stroke-[2.2]" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-bold text-slate-900 font-display">
                      ₹{stats.totalMonthRevenue.toLocaleString()}
                    </span>
                    <span className="text-emerald-600 text-xs font-semibold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5 inline" /> Settled Folios
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    ADR: ₹{stats.adr} | RevPAR: ₹{stats.revPar}
                  </p>
                </div>
              </div>

              {/* Card 3: Today's Check-Ins */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium text-xs">Today's Check-Ins</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4 stroke-[2]" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-bold text-slate-900 font-display">
                      {stats.todayCheckIns} Guests
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats.todayCheckOuts} Check-Outs scheduled today
                  </p>
                </div>
              </div>

              {/* Card 4: Housekeeping Queue */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium text-xs">Housekeeping Queue</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Broom className="w-4 h-4 stroke-[2]" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-bold text-slate-900 font-display">
                      {stats.housekeepingTasksUrgent} Tasks
                    </span>
                    <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-500" /> Urgent
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats.housekeepingTasksTotal} tasks needing staff assignment
                  </p>
                </div>
              </div>
            </div>

            {/* MAIN TWO-COLUMN SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 Cols: LIVE ROOM AVAILABILITY MATRIX */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Live Room Availability Matrix
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Overview of all resort accommodation statuses
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>Manage Rooms</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Grid of Room Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
                  {rooms.slice(0, 8).map((room) => {
                    const style = getRoomCardStyle(room);
                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoomForQuickEdit(room)}
                        className={`${style.cardBg} border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition shadow-xs hover:shadow-md active:scale-98`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`font-bold text-sm md:text-base ${style.titleColor}`}>
                              Room {room.number}
                            </span>
                            <span className={`w-2.5 h-2.5 rounded-full ${style.dotColor}`}></span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 truncate font-normal">
                            {room.type}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-5 pt-2 border-t border-slate-200/50">
                          <span className="text-slate-700 font-semibold text-xs">
                            ₹{room.pricePerNight}/night
                          </span>
                          <span className={`text-xs font-bold ${style.badgeColor}`}>
                            {style.badgeText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 4 Cols: TODAY'S GUESTS */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Today's Guests
                  </h3>
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {/* Stacked Guest Cards */}
                <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {reservations.slice(0, 4).map((resv) => (
                    <div
                      key={resv.id}
                      className="bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl p-3.5 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {resv.guestName}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                            Room {resv.roomNumber}
                          </span>
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          resv.status === 'checked-in'
                            ? 'bg-emerald-100 text-emerald-800'
                            : resv.status === 'confirmed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {resv.status === 'checked-in' ? 'Checked-In' : 'Confirmed'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {resv.checkIn} to {resv.checkOut}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          ₹{resv.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROOMS & FLOORS */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Rooms & Floors Inventory</h2>
                <p className="text-slate-500 text-xs mt-1">Live resort accommodation matrix, floor controls, and operational turnarounds</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={roomFilterFloor}
                  onChange={(e) => setRoomFilterFloor(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Floors</option>
                  <option value="1">Floor 1 (Ground Garden)</option>
                  <option value="2">Floor 2 (Executive Wing)</option>
                  <option value="3">Floor 3 (Penthouse Level)</option>
                </select>

                <select
                  value={roomFilterStatus}
                  onChange={(e) => setRoomFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>

                <button
                  onClick={() => setShowNewReservationModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Booking</span>
                </button>
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {rooms
                .filter(r => roomFilterFloor === 'all' || r.floor === Number(roomFilterFloor))
                .filter(r => roomFilterStatus === 'all' || r.status === roomFilterStatus)
                .map(room => {
                  const style = getRoomCardStyle(room);
                  return (
                    <div
                      key={room.id}
                      className={`${style.cardBg} border rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition relative`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-base font-bold ${style.titleColor}`}>
                            Room {room.number}
                          </span>
                          <span className={`w-3 h-3 rounded-full ${style.dotColor}`}></span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-semibold">{room.type}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Floor {room.floor} • Capacity {room.capacity} Guests</p>

                        {room.currentGuestName && (
                          <div className="mt-3 bg-white/80 rounded-lg p-2 border border-slate-200/60">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Guest</span>
                            <span className="text-xs font-bold text-slate-800 truncate block">{room.currentGuestName}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="font-bold text-slate-900">₹{room.pricePerNight}/night</span>
                          <span className={`font-bold ${style.badgeColor}`}>{style.badgeText}</span>
                        </div>

                        {/* Quick Action Button */}
                        <button
                          onClick={() => setSelectedRoomForQuickEdit(room)}
                          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 rounded-lg shadow-2xs transition"
                        >
                          Change Status
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3: RESERVATIONS */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Guest Reservations & Front Desk</h2>
                <p className="text-slate-500 text-xs mt-1">Real-time check-in ledger, automated folio generation, and room assignments</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search guest name, room..."
                    value={reservationSearch}
                    onChange={(e) => setReservationSearch(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs w-64 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  onClick={() => setShowNewReservationModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Booking</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Folio / Res ID</th>
                      <th className="p-4">Guest Details</th>
                      <th className="p-4">Room & Type</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reservations
                      .filter(r => !reservationSearch || r.guestName.toLowerCase().includes(reservationSearch.toLowerCase()) || r.roomNumber.includes(reservationSearch))
                      .map(resv => (
                        <tr key={resv.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-4 font-bold text-slate-900 font-mono">{resv.id}</td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{resv.guestName}</div>
                            <div className="text-slate-400 text-[11px]">{resv.guestEmail} • {resv.guestPhone}</div>
                          </td>
                          <td className="p-4">
                            <span className="inline-block bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-800 mr-2">
                              {resv.roomNumber}
                            </span>
                            <span className="text-slate-600">{resv.roomType}</span>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-800">{resv.checkIn} to {resv.checkOut}</div>
                            <div className="text-slate-400 text-[11px]">{resv.nights} nights • {resv.guestsCount} guests</div>
                          </td>
                          <td className="p-4 font-bold text-slate-900">₹{resv.totalAmount.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              resv.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {resv.paymentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              resv.status === 'checked-in' ? 'bg-indigo-100 text-indigo-800' :
                              resv.status === 'confirmed' ? 'bg-amber-100 text-amber-800' :
                              resv.status === 'checked-out' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {resv.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {resv.status === 'confirmed' && (
                                <button
                                  onClick={() => handleCheckIn(resv.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                                >
                                  Check In
                                </button>
                              )}
                              {resv.status === 'checked-in' && (
                                <button
                                  onClick={() => handleCheckOut(resv.id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                                >
                                  Check Out
                                </button>
                              )}
                              {resv.status !== 'cancelled' && resv.status !== 'checked-out' && (
                                <button
                                  onClick={() => handleCancelReservation(resv.id)}
                                  className="text-rose-600 hover:text-rose-800 px-2 py-1 text-[11px] font-semibold transition"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GUEST CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Guest CRM & VIP Loyalty Directory</h2>
                <p className="text-slate-500 text-xs mt-1">Profile tracking, preferences, lifetime valuation, and bespoke service tags</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {guests.map(guest => (
                <div key={guest.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900 font-display">{guest.name}</h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        guest.vipTier === 'VIP' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        guest.vipTier === 'Platinum' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {guest.vipTier} Member
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{guest.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{guest.phone}</span>
                      </div>
                    </div>

                    {guest.preferences && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {guest.preferences.map((p, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <strong>Notes:</strong> {guest.notes}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Stays</span>
                      <strong className="text-slate-800">{guest.totalStays} visits</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Lifetime Spend</span>
                      <strong className="text-emerald-600 font-bold">₹{guest.lifetimeSpend.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: HOUSEKEEPING */}
        {activeTab === 'housekeeping' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Housekeeping & Hygiene Queue</h2>
                <p className="text-slate-500 text-xs mt-1">Real-time room sanitization schedules, turnover tasks, and quality inspections</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{housekeeping.filter(t => t.priority === 'urgent' && t.status !== 'completed').length} Urgent Tasks</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {housekeeping.map(task => (
                <div key={task.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        Room {task.roomNumber}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        task.priority === 'urgent' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-2">{task.taskType}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{task.roomType}</p>
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{task.notes}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span>Assigned: <strong>{task.assignedStaff || 'Unassigned'}</strong></span>
                      <span>Due: <strong>{task.dueTime}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleTaskStatusChange(task.id, 'completed')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Clean & Ready</span>
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <div className="w-full bg-emerald-50 text-emerald-800 text-xs font-bold py-2 rounded-xl text-center flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" /> Room Ready for Guests
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BILLING & FOLIOS */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Guest Billing & Digital Folios</h2>
                <p className="text-slate-500 text-xs mt-1">Room charges, fine dining, spa treatments, taxes, and checkout settlements</p>
              </div>
            </div>

            <div className="space-y-4">
              {folios.map(folio => (
                <div key={folio.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{folio.id}</span>
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded">
                          Room {folio.roomNumber}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">{folio.guestName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        folio.status === 'settled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {folio.status.toUpperCase()}
                      </span>
                      {folio.status !== 'settled' && (
                        <button
                          onClick={() => handleSettleFolio(folio.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition"
                        >
                          Settle Folio
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Folio Items */}
                  <div className="mt-3 divide-y divide-slate-100">
                    {folio.items.map(item => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-semibold">
                            {item.category}
                          </span>
                          <span className="text-slate-700">{item.description}</span>
                        </div>
                        <span className="font-semibold text-slate-900">₹{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <span className="text-slate-400">Subtotal: ₹{folio.subtotal.toLocaleString()} • GST (18%): ₹{folio.tax.toLocaleString()}</span>
                    <div className="text-base font-bold text-slate-900">
                      Total: <span className="text-indigo-600 font-display">₹{folio.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: STAFF ROSTER */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Resort Staff & Operations Roster</h2>
                <p className="text-slate-500 text-xs mt-1">Personnel management, department assignments, shift timings, and active status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map(member => (
                <div key={member.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 font-display">{member.name}</h4>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        member.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{member.role}</p>
                    <p className="text-xs text-slate-400">{member.department}</p>
                    <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                      <div>Shift: <strong>{member.shift}</strong></div>
                      <div>Contact: {member.phone}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 font-display">Grand Vista Executive Analytics</h2>
              <p className="text-slate-500 text-xs mt-1">Detailed revenue by accommodation tier, RevPAR trends, and room yield analysis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm font-display mb-4">Revenue Breakdown by Department & Tier</h3>
                <div className="space-y-3">
                  {stats.revenueByCategory && stats.revenueByCategory.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.category}</span>
                        <span className="text-slate-900">₹{item.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.round((item.amount / 100000) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Occupancy trends */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm font-display mb-4">Weekly Occupancy Forecast</h3>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {stats.occupancyTrends && stats.occupancyTrends.map((t, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col justify-between h-40">
                      <span className="text-xs font-bold text-slate-700">{t.day}</span>
                      <div className="w-full bg-indigo-100 rounded-lg flex items-end justify-center h-20 overflow-hidden">
                        <div
                          className="bg-indigo-600 w-full rounded-t-lg transition-all"
                          style={{ height: `${t.occupancy}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-indigo-700">{t.occupancy}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. MODAL: NEW RESERVATION */}
      {showNewReservationModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">New Guest Reservation</h3>
                  <p className="text-slate-500 text-xs">Create secure booking and auto-assign room</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewReservationModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lord Charles Sterling"
                    value={newResvData.guestName}
                    onChange={e => setNewResvData({ ...newResvData, guestName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="guest@domain.com"
                    value={newResvData.guestEmail}
                    onChange={e => setNewResvData({ ...newResvData, guestEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={newResvData.guestPhone}
                    onChange={e => setNewResvData({ ...newResvData, guestPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ID / Passport Proof</label>
                  <input
                    type="text"
                    placeholder="Passport # / Driving License"
                    value={newResvData.guestIdProof}
                    onChange={e => setNewResvData({ ...newResvData, guestIdProof: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assign Room *</label>
                  <select
                    value={newResvData.roomNumber}
                    onChange={e => setNewResvData({ ...newResvData, roomNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-amber-500"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.number}>
                        Room {r.number} - {r.type} (₹{r.pricePerNight}) [{r.status}]
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Check-In *</label>
                  <input
                    type="date"
                    required
                    value={newResvData.checkIn}
                    onChange={e => setNewResvData({ ...newResvData, checkIn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Check-Out *</label>
                  <input
                    type="date"
                    required
                    value={newResvData.checkOut}
                    onChange={e => setNewResvData({ ...newResvData, checkOut: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Special Requests & Preferences</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Feather-free pillows, late airport pickup, high floor..."
                  value={newResvData.specialRequests}
                  onChange={e => setNewResvData({ ...newResvData, specialRequests: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewReservationModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-sm transition"
                >
                  Confirm & Reserve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: QUICK ROOM STATUS EDIT */}
      {selectedRoomForQuickEdit && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Room {selectedRoomForQuickEdit.number} Status
                </h3>
                <p className="text-xs text-slate-500">{selectedRoomForQuickEdit.type} • Floor {selectedRoomForQuickEdit.floor}</p>
              </div>
              <button onClick={() => setSelectedRoomForQuickEdit(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {[
                { status: 'available', label: 'Set as Available (Ready)', color: 'hover:bg-emerald-50 text-emerald-700 border-emerald-200' },
                { status: 'occupied', label: 'Set as Occupied', color: 'hover:bg-indigo-50 text-indigo-700 border-indigo-200' },
                { status: 'reserved', label: 'Set as Reserved', color: 'hover:bg-amber-50 text-amber-700 border-amber-200' },
                { status: 'cleaning', label: 'Set as Cleaning (Urgent Turnover)', color: 'hover:bg-rose-50 text-rose-700 border-rose-200' }
              ].map(item => (
                <button
                  key={item.status}
                  onClick={() => handleRoomStatusUpdate(selectedRoomForQuickEdit.id, item.status)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${item.color}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: AI CONCIERGE */}
      {showAiConciergeModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">5-Star AI Concierge</h3>
                  <p className="text-slate-500 text-xs">Dining reservations, luxury transfers & experiences</p>
                </div>
              </div>
              <button onClick={() => setShowAiConciergeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
              {conciergeMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 text-slate-800 rounded-tl-xs whitespace-pre-line'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {conciergeLoading && (
                <div className="text-slate-400 italic text-xs">Consulting concierge desk...</div>
              )}
            </div>

            <form onSubmit={handleConciergeSubmit} className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about restaurant menus, spa timings, private yacht..."
                value={conciergeQuery}
                onChange={e => setConciergeQuery(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={conciergeLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: ASK AI CO-PILOT */}
      {showAiCopilotModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1322] text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Executive Operations Co-Pilot</h3>
                  <p className="text-slate-400 text-xs">RevPAR optimization, housekeeping expediting & staff insights</p>
                </div>
              </div>
              <button onClick={() => setShowAiCopilotModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
              {copilotMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-xs'
                      : 'bg-slate-800/90 text-slate-200 rounded-tl-xs whitespace-pre-line border border-slate-700/60'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="text-amber-400/80 italic text-xs">Analyzing live property metrics...</div>
              )}
            </div>

            <form onSubmit={handleCopilotSubmit} className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about occupancy yield, turnarounds for Room 204..."
                value={copilotQuery}
                onChange={e => setCopilotQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={copilotLoading}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2.5 rounded-xl font-bold transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
