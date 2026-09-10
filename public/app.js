// Grand Vista Resort PMS - Frontend Application Logic (Pure JavaScript)

let state = {
  activeTab: 'dashboard',
  analytics: null,
  rooms: [],
  reservations: [],
  guests: [],
  housekeeping: [],
  billing: [],
  staff: [],
  selectedRoomForEdit: null,
  selectedFolioId: null
};

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  fetchAllData();
  initFormDates();
  // Poll periodically every 10 seconds for real-time synchronization
  setInterval(fetchAnalyticsAndRoomsOnly, 10000);
});

// Initial date setups for reservation modal
function initFormDates() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const inCheck = document.getElementById('resCheckIn');
  const outCheck = document.getElementById('resCheckOut');
  if (inCheck && outCheck) {
    inCheck.value = today;
    outCheck.value = tomorrow;
  }
}

// Fetch all resources from Node.js backend
async function fetchAllData() {
  try {
    const [analyticsRes, roomsRes, reservationsRes, guestsRes, housekeepingRes, billingRes, staffRes] = await Promise.all([
      fetch('/api/analytics'),
      fetch('/api/rooms'),
      fetch('/api/reservations'),
      fetch('/api/guests'),
      fetch('/api/housekeeping'),
      fetch('/api/billing'),
      fetch('/api/staff')
    ]);

    state.analytics = await analyticsRes.json();
    state.rooms = await roomsRes.json();
    state.reservations = await reservationsRes.json();
    state.guests = await guestsRes.json();
    state.housekeeping = await housekeepingRes.json();
    state.billing = await billingRes.json();
    state.staff = await staffRes.json();

    renderDashboard();
    renderRoomsView();
    renderReservationsView();
    renderGuestsView();
    renderHousekeepingView();
    renderBillingView();
    renderStaffView();
    renderAnalyticsView();
    populateAvailableRoomsDropdown();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Lightweight poll
async function fetchAnalyticsAndRoomsOnly() {
  try {
    const [analyticsRes, roomsRes] = await Promise.all([
      fetch('/api/analytics'),
      fetch('/api/rooms')
    ]);
    state.analytics = await analyticsRes.json();
    state.rooms = await roomsRes.json();
    renderDashboardKPIs();
    renderDashboardRoomMatrix();
  } catch (err) {
    console.warn('Real-time sync paused:', err);
  }
}

// Navigation Tabs Switcher
function switchTab(tabName) {
  state.activeTab = tabName;

  // Update nav buttons
  const buttons = document.querySelectorAll('#mainNavTabs .tab-btn');
  buttons.forEach(btn => {
    btn.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold', 'active');
    btn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/50');
  });

  const activeBtn = document.getElementById(`tab-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/50');
    activeBtn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold', 'active');
  }

  // Toggle views
  const panels = document.querySelectorAll('.view-panel');
  panels.forEach(p => p.classList.add('hidden'));

  const activePanel = document.getElementById(`view-${tabName}`);
  if (activePanel) {
    activePanel.classList.remove('hidden');
  }

  // Render view-specific content if needed
  if (tabName === 'rooms') renderRoomsView();
  if (tabName === 'reservations') renderReservationsView();
  if (tabName === 'crm') renderGuestsView();
  if (tabName === 'housekeeping') renderHousekeepingView();
  if (tabName === 'billing') renderBillingView();
  if (tabName === 'staff') renderStaffView();
  if (tabName === 'analytics') renderAnalyticsView();
}

// ----------------------------------------------------
// 1. DASHBOARD RENDERING (Matching Screenshot)
// ----------------------------------------------------
function renderDashboard() {
  renderDashboardKPIs();
  renderDashboardRoomMatrix();
  renderDashboardGuests();
}

function renderDashboardKPIs() {
  if (!state.analytics) return;
  const a = state.analytics;

  // Top header occupancy
  const headerOccupancy = document.getElementById('headerOccupancyText');
  if (headerOccupancy) headerOccupancy.textContent = `${a.occupancyRate}%`;

  // KPI 1: Occupancy Rate
  const kpiOccupancyRate = document.getElementById('kpiOccupancyRate');
  const kpiOccupancyRooms = document.getElementById('kpiOccupancyRooms');
  if (kpiOccupancyRate) kpiOccupancyRate.textContent = `${a.occupancyRate}%`;
  if (kpiOccupancyRooms) kpiOccupancyRooms.textContent = `${a.occupiedRoomsCount} of ${a.totalRoomsCount} rooms occupied`;

  // KPI 2: Total Month Revenue
  const kpiTotalRevenue = document.getElementById('kpiTotalRevenue');
  const kpiAdrRevpar = document.getElementById('kpiAdrRevpar');
  if (kpiTotalRevenue) kpiTotalRevenue.textContent = `₹${a.totalMonthRevenue.toLocaleString()}`;
  if (kpiAdrRevpar) kpiAdrRevpar.textContent = `ADR: ₹${a.adr} | RevPAR: ₹${a.revPar}`;

  // KPI 3: Today's Check-Ins
  const kpiTodayCheckins = document.getElementById('kpiTodayCheckins');
  const kpiTodayCheckouts = document.getElementById('kpiTodayCheckouts');
  if (kpiTodayCheckins) kpiTodayCheckins.textContent = `${a.todayCheckIns} Guests`;
  if (kpiTodayCheckouts) kpiTodayCheckouts.textContent = `${a.todayCheckOuts} Check-Outs scheduled today`;

  // KPI 4: Housekeeping Queue
  const kpiHousekeepingTasks = document.getElementById('kpiHousekeepingTasks');
  const kpiHousekeepingSubtitle = document.getElementById('kpiHousekeepingSubtitle');
  if (kpiHousekeepingTasks) kpiHousekeepingTasks.textContent = `${a.housekeepingTasksUrgent} Tasks`;
  if (kpiHousekeepingSubtitle) kpiHousekeepingSubtitle.textContent = `${a.housekeepingTasksTotal} tasks needing staff assignment`;
}

function renderDashboardRoomMatrix() {
  const container = document.getElementById('dashboardRoomMatrix');
  if (!container) return;

  container.innerHTML = state.rooms.map(room => {
    let cardClasses = '';
    let dotColor = '';
    let statusText = '';
    let statusTextColor = '';

    if (room.status === 'occupied') {
      cardClasses = 'bg-[#f5f3ff] border-[#ddd6fe]';
      dotColor = 'bg-[#6366f1]';
      statusText = 'Occupied';
      statusTextColor = 'text-[#4f46e5]';
    } else if (room.status === 'available') {
      cardClasses = 'bg-[#ecfdf5] border-[#a7f3d0]';
      dotColor = 'bg-[#10b981]';
      statusText = 'Available';
      statusTextColor = 'text-[#059669]';
    } else if (room.status === 'reserved') {
      cardClasses = 'bg-[#fffbeb] border-[#fde68a]';
      dotColor = 'bg-[#f59e0b]';
      statusText = 'Reserved';
      statusTextColor = 'text-[#d97706]';
    } else if (room.status === 'cleaning') {
      cardClasses = 'bg-[#fff1f2] border-[#fecdd3]';
      dotColor = 'bg-[#f43f5e]';
      statusText = 'Cleaning';
      statusTextColor = 'text-[#e11d48]';
    } else {
      cardClasses = 'bg-slate-50 border-slate-200';
      dotColor = 'bg-slate-400';
      statusText = 'Maintenance';
      statusTextColor = 'text-slate-600';
    }

    return `
      <div onclick="openRoomStatusModal('${room.id}')" class="p-3.5 rounded-2xl border ${cardClasses} room-card-hover cursor-pointer flex flex-col justify-between h-[104px]">
        <div class="flex items-start justify-between">
          <div>
            <h4 class="text-sm font-bold text-slate-900 tracking-tight font-heading">Room ${room.number}</h4>
            <p class="text-[11px] text-slate-500 font-medium">${room.type}</p>
          </div>
          <span class="w-2.5 h-2.5 rounded-full ${dotColor} mt-1"></span>
        </div>

        <div class="flex items-center justify-between text-xs font-semibold pt-2 border-t border-black/5">
          <span class="text-slate-800 font-medium">₹${room.pricePerNight.toLocaleString()}/night</span>
          <span class="${statusTextColor} capitalize">${statusText}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderDashboardGuests() {
  const container = document.getElementById('dashboardGuestsList');
  if (!container) return;

  // Active checked-in or upcoming confirmed reservations
  const activeReservations = state.reservations.slice(0, 3);

  container.innerHTML = activeReservations.map(resv => {
    const isCheckedIn = resv.status === 'checked-in';
    const statusPill = isCheckedIn 
      ? `<span class="bg-[#dcfce7] text-[#15803d] font-bold text-[11px] px-2 py-0.5 rounded-md">Checked-In</span>`
      : `<span class="bg-[#fef3c7] text-[#b45309] font-bold text-[11px] px-2 py-0.5 rounded-md">Confirmed</span>`;

    return `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-100/90 flex flex-col justify-between hover:bg-slate-100/70 transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-xs">${resv.guestName}</span>
            <span class="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">Room ${resv.roomNumber}</span>
          </div>
          ${statusPill}
        </div>
        
        <div class="flex items-center justify-between mt-2.5 text-[11px]">
          <span class="text-slate-500 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${resv.checkIn} to ${resv.checkOut}
          </span>
          <span class="font-bold text-slate-900 text-xs">₹${resv.totalAmount.toLocaleString()}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// 2. ROOMS & FLOORS VIEW
// ----------------------------------------------------
function renderRoomsView(filterFloor = 'all') {
  const container = document.getElementById('roomsFullGrid');
  if (!container) return;

  let roomsToRender = state.rooms;
  if (filterFloor !== 'all') {
    roomsToRender = roomsToRender.filter(r => r.floor === Number(filterFloor));
  }

  container.innerHTML = roomsToRender.map(room => {
    let badgeBg = 'bg-emerald-100 text-emerald-800';
    if (room.status === 'occupied') badgeBg = 'bg-indigo-100 text-indigo-800';
    if (room.status === 'reserved') badgeBg = 'bg-amber-100 text-amber-800';
    if (room.status === 'cleaning') badgeBg = 'bg-rose-100 text-rose-800';

    return `
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-slate-900 font-heading">Room ${room.number}</span>
              <span class="text-xs text-slate-400 font-medium">Floor ${room.floor}</span>
            </div>
            <p class="text-xs text-slate-600 font-semibold mt-0.5">${room.type}</p>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] ${badgeBg}">${room.status}</span>
        </div>

        <div class="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
          <p><span class="text-slate-400 font-medium">Guest:</span> <strong class="text-slate-800">${room.currentGuestName || 'None (Vacant)'}</strong></p>
          <p><span class="text-slate-400 font-medium">Capacity:</span> ${room.capacity} Guests | Key: ${room.keyCardCode || 'GV-KEY'}</p>
          <p><span class="text-slate-400 font-medium">Last Cleaned:</span> ${room.lastCleaned || 'Today'}</p>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Nightly Tariff</span>
            <p class="text-base font-bold text-slate-900 font-heading">₹${room.pricePerNight.toLocaleString()}</p>
          </div>
          <button onclick="openRoomStatusModal('${room.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-all">
            Edit Status
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterRooms(floor) {
  const pills = document.querySelectorAll('#floorFilterGroup .floor-pill');
  pills.forEach(p => {
    p.classList.remove('active', 'bg-white', 'text-slate-900', 'shadow-sm');
    p.classList.add('text-slate-500');
  });
  event.target.classList.add('active', 'bg-white', 'text-slate-900', 'shadow-sm');
  event.target.classList.remove('text-slate-500');
  renderRoomsView(floor);
}

// ----------------------------------------------------
// 3. RESERVATIONS VIEW
// ----------------------------------------------------
function renderReservationsView(filtered = null) {
  const tbody = document.getElementById('reservationsTableBody');
  if (!tbody) return;

  const data = filtered || state.reservations;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 text-xs">No reservations matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(resv => {
    let statusClass = 'bg-slate-100 text-slate-700';
    if (resv.status === 'checked-in') statusClass = 'bg-emerald-100 text-emerald-800 font-bold';
    if (resv.status === 'confirmed') statusClass = 'bg-amber-100 text-amber-800 font-bold';
    if (resv.status === 'checked-out') statusClass = 'bg-indigo-100 text-indigo-800 font-semibold';
    if (resv.status === 'cancelled') statusClass = 'bg-rose-100 text-rose-800';

    return `
      <tr class="hover:bg-slate-50/80 transition-all">
        <td class="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px]">${resv.id}</td>
        <td class="py-3.5 px-4">
          <p class="font-bold text-slate-900">${resv.guestName}</p>
          <span class="text-[11px] text-slate-400">${resv.guestEmail}</span>
        </td>
        <td class="py-3.5 px-4">
          <span class="font-semibold text-slate-800">Room ${resv.roomNumber}</span>
          <p class="text-[11px] text-slate-400">${resv.roomType}</p>
        </td>
        <td class="py-3.5 px-4 text-[11px] text-slate-600">
          ${resv.checkIn} to ${resv.checkOut}
          <span class="text-slate-400 block">${resv.nights} nights</span>
        </td>
        <td class="py-3.5 px-4 font-bold text-slate-900">
          ₹${resv.totalAmount.toLocaleString()}
          <span class="block text-[10px] font-normal text-emerald-600">${resv.paymentStatus}</span>
        </td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider ${statusClass}">${resv.status}</span>
        </td>
        <td class="py-3.5 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${resv.status === 'confirmed' ? `
              <button onclick="checkInReservation('${resv.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold">Check-In</button>
            ` : ''}
            ${resv.status === 'checked-in' ? `
              <button onclick="checkOutReservation('${resv.id}')" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold">Check-Out</button>
            ` : ''}
            ${resv.status !== 'cancelled' && resv.status !== 'checked-out' ? `
              <button onclick="cancelReservation('${resv.id}')" class="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px]">Cancel</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function searchReservations(query) {
  if (!query) {
    renderReservationsView();
    return;
  }
  const q = query.toLowerCase();
  const filtered = state.reservations.filter(r => 
    r.guestName.toLowerCase().includes(q) ||
    r.roomNumber.includes(q) ||
    r.id.toLowerCase().includes(q)
  );
  renderReservationsView(filtered);
}

// Check-In API
async function checkInReservation(id) {
  try {
    const res = await fetch(`/api/reservations/${id}/checkin`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      await fetchAllData();
      alert(`Guest successfully checked-in to Room!`);
    }
  } catch (e) {
    console.error(e);
  }
}

// Check-Out API
async function checkOutReservation(id) {
  if (!confirm('Confirm guest check-out? This will finalize the stay and dispatch an urgent housekeeping turnover task.')) return;
  try {
    const res = await fetch(`/api/reservations/${id}/checkout`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      await fetchAllData();
      alert('Guest checked-out. Room status set to Cleaning, housekeeping notified.');
    }
  } catch (e) {
    console.error(e);
  }
}

// Cancel reservation API
async function cancelReservation(id) {
  if (!confirm('Cancel this booking? Room availability will be released.')) return;
  try {
    const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      await fetchAllData();
    }
  } catch (e) {
    console.error(e);
  }
}

// ----------------------------------------------------
// 4. GUEST CRM VIEW
// ----------------------------------------------------
function renderGuestsView() {
  const container = document.getElementById('guestsDirectoryGrid');
  if (!container) return;

  container.innerHTML = state.guests.map(g => {
    let tierColor = 'bg-slate-100 text-slate-800';
    if (g.vipTier === 'VIP') tierColor = 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
    if (g.vipTier === 'Platinum') tierColor = 'bg-indigo-100 text-indigo-800 font-bold';
    if (g.vipTier === 'Gold') tierColor = 'bg-amber-50 text-amber-700 font-semibold';

    return `
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-base font-bold text-slate-900 font-heading">${g.name}</h4>
              <p class="text-xs text-slate-500">${g.email}</p>
            </div>
            <span class="text-xs px-2.5 py-0.5 rounded-full ${tierColor}">${g.vipTier}</span>
          </div>

          <div class="mt-3 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl text-slate-700">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-semibold">Total Stays</span>
              <strong>${g.totalStays} visits</strong>
            </div>
            <div class="text-right">
              <span class="text-slate-400 block text-[10px] uppercase font-semibold">Lifetime Spend</span>
              <strong>₹${g.lifetimeSpend.toLocaleString()}</strong>
            </div>
          </div>

          <div class="mt-3">
            <span class="text-[11px] font-semibold text-slate-500">Preferences & Notes:</span>
            <p class="text-xs text-slate-600 italic mt-0.5">"${g.notes || 'No specific preferences recorded.'}"</p>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Phone: ${g.phone}</span>
          ${g.currentRoom ? `<span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">In Room ${g.currentRoom}</span>` : '<span>Past Guest</span>'}
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// 5. HOUSEKEEPING VIEW
// ----------------------------------------------------
function renderHousekeepingView() {
  const pendingCol = document.getElementById('hkPendingColumn');
  const inProgressCol = document.getElementById('hkInProgressColumn');
  const completedCol = document.getElementById('hkCompletedColumn');

  if (!pendingCol || !inProgressCol || !completedCol) return;

  const pendingTasks = state.housekeeping.filter(t => t.status === 'pending');
  const inProgTasks = state.housekeeping.filter(t => t.status === 'in-progress');
  const doneTasks = state.housekeeping.filter(t => t.status === 'completed');

  document.getElementById('hkPendingCount').textContent = pendingTasks.length;
  document.getElementById('hkInProgressCount').textContent = inProgTasks.length;
  document.getElementById('hkCompletedCount').textContent = doneTasks.length;

  const renderCard = (t) => {
    const isUrgent = t.priority === 'urgent';
    return `
      <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-slate-900 text-xs">Room ${t.roomNumber}</span>
            <span class="text-[11px] text-slate-500">(${t.roomType})</span>
          </div>
          ${isUrgent ? `<span class="bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded">Urgent</span>` : ''}
        </div>

        <p class="text-xs font-semibold text-slate-800">${t.taskType}</p>
        <p class="text-xs text-slate-500 leading-relaxed">${t.notes || 'Routine cleaning standard.'}</p>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-400 text-[11px]">Due: ${t.dueTime}</span>
          ${t.status === 'pending' ? `
            <button onclick="updateHousekeepingStatus('${t.id}', 'in-progress')" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-semibold">Start</button>
          ` : t.status === 'in-progress' ? `
            <button onclick="updateHousekeepingStatus('${t.id}', 'completed')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold">Mark Done</button>
          ` : `
            <span class="text-emerald-600 font-bold text-[11px]">✓ Ready</span>
          `}
        </div>
      </div>
    `;
  };

  pendingCol.innerHTML = pendingTasks.map(renderCard).join('') || '<p class="text-xs text-slate-400 py-4 text-center">No pending cleaning tasks.</p>';
  inProgressCol.innerHTML = inProgTasks.map(renderCard).join('') || '<p class="text-xs text-slate-400 py-4 text-center">No in-progress tasks.</p>';
  completedCol.innerHTML = doneTasks.map(renderCard).join('') || '<p class="text-xs text-slate-400 py-4 text-center">No completed tasks today.</p>';
}

async function updateHousekeepingStatus(taskId, newStatus) {
  try {
    const res = await fetch(`/api/housekeeping/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      await fetchAllData();
    }
  } catch (err) {
    console.error(err);
  }
}

// ----------------------------------------------------
// 6. BILLING & FOLIOS VIEW
// ----------------------------------------------------
function renderBillingView() {
  const container = document.getElementById('foliosList');
  const detailContainer = document.getElementById('folioDetailView');
  if (!container || !detailContainer) return;

  container.innerHTML = state.billing.map(folio => {
    const isSettled = folio.status === 'settled';
    const isSelected = folio.id === (state.selectedFolioId || state.billing[0]?.id);

    return `
      <div onclick="selectFolio('${folio.id}')" class="p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400' : 'bg-white border-slate-200 hover:bg-slate-50'}">
        <div class="flex items-start justify-between">
          <div>
            <h4 class="font-bold text-slate-900 text-xs">${folio.guestName}</h4>
            <span class="text-[11px] text-slate-500 font-medium">Room ${folio.roomNumber}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${folio.status}</span>
        </div>

        <div class="mt-2.5 flex items-center justify-between text-xs">
          <span class="font-mono text-slate-400 text-[10px]">${folio.id}</span>
          <strong class="text-slate-900 font-bold">₹${folio.total.toLocaleString()}</strong>
        </div>
      </div>
    `;
  }).join('');

  const currentFolio = state.billing.find(f => f.id === (state.selectedFolioId || state.billing[0]?.id));
  if (!currentFolio) {
    detailContainer.innerHTML = `<p class="text-slate-400 text-xs">Select a folio to inspect charges.</p>`;
    return;
  }

  detailContainer.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-slate-200">
      <div>
        <span class="text-xs text-slate-400 uppercase font-semibold">Resort Guest Folio</span>
        <h3 class="text-lg font-bold text-slate-900 font-heading">${currentFolio.guestName} - Room ${currentFolio.roomNumber}</h3>
        <p class="text-xs text-slate-500">Folio Ref: ${currentFolio.id} | Booking: ${currentFolio.reservationId}</p>
      </div>

      <div class="text-right">
        <span class="text-xs text-slate-400">Total Balance</span>
        <p class="text-2xl font-extrabold text-slate-900 font-heading">₹${currentFolio.total.toLocaleString()}</p>
      </div>
    </div>

    <!-- Itemized List -->
    <div class="mt-5 space-y-2">
      <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Itemized Resort Consumption:</span>
      <div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
        ${currentFolio.items.map(item => `
          <div class="p-3 flex items-center justify-between">
            <div>
              <p class="font-semibold text-slate-800">${item.description}</p>
              <span class="text-[10px] text-slate-400">${item.category} • ${item.date}</span>
            </div>
            <strong class="text-slate-900">₹${item.amount.toLocaleString()}</strong>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Summary & GST -->
    <div class="mt-4 bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
      <div class="flex justify-between text-slate-600">
        <span>Subtotal:</span>
        <span>₹${currentFolio.subtotal.toLocaleString()}</span>
      </div>
      <div class="flex justify-between text-slate-600">
        <span>Resort GST & Luxury Cess (18%):</span>
        <span>₹${currentFolio.tax.toLocaleString()}</span>
      </div>
      <div class="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">
        <span>Total Payable:</span>
        <span>₹${currentFolio.total.toLocaleString()}</span>
      </div>
      <div class="flex justify-between text-emerald-600 font-semibold text-xs">
        <span>Amount Paid / Deposited:</span>
        <span>₹${currentFolio.paidAmount.toLocaleString()}</span>
      </div>
    </div>

    <!-- Folio Actions -->
    <div class="mt-5 flex items-center justify-end gap-3">
      <button onclick="addChargePrompt('${currentFolio.id}')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs">
        + Post Extra Charge (Dining/Spa)
      </button>
      ${currentFolio.status !== 'settled' ? `
        <button onclick="settleFolio('${currentFolio.id}')" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm">
          Settle & Issue Tax Invoice
        </button>
      ` : `
        <span class="bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs">✓ Fully Settled</span>
      `}
    </div>
  `;
}

function selectFolio(id) {
  state.selectedFolioId = id;
  renderBillingView();
}

async function addChargePrompt(folioId) {
  const desc = prompt('Enter charge description (e.g. In-Room Dining, Coral Reef Excursion, Nespresso Bar):', 'In-Room Gourmet Dinner');
  if (!desc) return;
  const amountStr = prompt('Enter amount in ₹:', '3500');
  if (!amountStr || isNaN(amountStr)) return;

  try {
    const res = await fetch(`/api/billing/${folioId}/item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: desc, category: 'Dining', amount: Number(amountStr) })
    });
    const data = await res.json();
    if (data.success) {
      await fetchAllData();
      renderBillingView();
    }
  } catch (e) {
    console.error(e);
  }
}

async function settleFolio(folioId) {
  if (!confirm('Settle this guest folio in full and clear outstanding balance?')) return;
  try {
    const res = await fetch(`/api/billing/${folioId}/settle`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      await fetchAllData();
      alert('Folio fully settled! Payment recorded.');
    }
  } catch (e) {
    console.error(e);
  }
}

// ----------------------------------------------------
// 7. STAFF ROSTER VIEW
// ----------------------------------------------------
function renderStaffView() {
  const container = document.getElementById('staffRosterGrid');
  if (!container) return;

  container.innerHTML = state.staff.map(member => {
    let statusPill = 'bg-emerald-100 text-emerald-800';
    if (member.status === 'on-break') statusPill = 'bg-amber-100 text-amber-800';
    if (member.status === 'off-duty') statusPill = 'bg-slate-100 text-slate-600';

    return `
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-base font-bold text-slate-900 font-heading">${member.name}</h4>
              <p class="text-xs text-slate-600 font-semibold">${member.role}</p>
              <span class="text-[11px] text-indigo-600 font-medium">${member.department}</span>
            </div>
            <span class="text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold ${statusPill}">${member.status}</span>
          </div>

          <div class="mt-3 bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 space-y-1">
            <p><span class="text-slate-400">Shift:</span> <strong>${member.shift}</strong></p>
            <p><span class="text-slate-400">Email:</span> ${member.email}</p>
            <p><span class="text-slate-400">Phone:</span> ${member.phone}</p>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button onclick="toggleStaffStatus('${member.id}')" class="text-indigo-600 hover:text-indigo-800 font-semibold text-xs">
            Toggle Status
          </button>
          <button onclick="deleteStaffMember('${member.id}')" class="text-rose-500 hover:text-rose-700 text-xs">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleStaffStatus(id) {
  const member = state.staff.find(s => s.id === id);
  if (!member) return;
  const nextStatus = member.status === 'active' ? 'on-break' : member.status === 'on-break' ? 'off-duty' : 'active';
  try {
    await fetch(`/api/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    await fetchAllData();
  } catch (e) {
    console.error(e);
  }
}

async function deleteStaffMember(id) {
  if (!confirm('Remove this staff member from active roster?')) return;
  try {
    await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    await fetchAllData();
  } catch (e) {
    console.error(e);
  }
}

// ----------------------------------------------------
// 8. ANALYTICS VIEW
// ----------------------------------------------------
function renderAnalyticsView() {
  const container = document.getElementById('analyticsCategoryBreakdown');
  if (!container || !state.analytics) return;

  const categories = state.analytics.revenueByCategory || [];
  const max = Math.max(...categories.map(c => c.amount), 100000);

  container.innerHTML = categories.map(cat => {
    const pct = Math.round((cat.amount / max) * 100);
    return `
      <div>
        <div class="flex justify-between text-xs font-semibold mb-1">
          <span class="text-slate-700">${cat.category}</span>
          <span class="text-slate-900 font-bold">₹${cat.amount.toLocaleString()}</span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div class="h-full bg-amber-500 rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// MODALS & ACTIONS
// ----------------------------------------------------
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('hidden');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('hidden');
}

// Available rooms selector in reservation modal
function populateAvailableRoomsDropdown() {
  const select = document.getElementById('resRoomSelect');
  if (!select) return;

  select.innerHTML = state.rooms.map(r => {
    const statusNote = r.status !== 'available' ? ` (${r.status})` : ' (Ready)';
    return `<option value="${r.number}" data-price="${r.pricePerNight}" data-type="${r.type}">Room ${r.number} - ${r.type} - ₹${r.pricePerNight.toLocaleString()}${statusNote}</option>`;
  }).join('');

  calculateReservationCost();
}

function calculateReservationCost() {
  const select = document.getElementById('resRoomSelect');
  const inDateVal = document.getElementById('resCheckIn')?.value;
  const outDateVal = document.getElementById('resCheckOut')?.value;
  if (!select || !inDateVal || !outDateVal) return;

  const option = select.selectedOptions[0];
  const price = option ? Number(option.getAttribute('data-price') || 15300) : 15300;

  const start = new Date(inDateVal);
  const end = new Date(outDateVal);
  const diffTime = Math.max(end - start, 86400000);
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const baseTotal = price * nights;
  const grandTotal = Math.round(baseTotal * 1.18);

  const nightsCalc = document.getElementById('resNightsCalculation');
  const estTotal = document.getElementById('resEstimatedTotal');
  if (nightsCalc) nightsCalc.textContent = `${nights} night(s) @ ₹${price.toLocaleString()}/night`;
  if (estTotal) estTotal.textContent = `₹${grandTotal.toLocaleString()}`;
}

function openNewReservationModal() {
  populateAvailableRoomsDropdown();
  openModal('modalNewReservation');
}

async function submitNewReservation(e) {
  e.preventDefault();
  const roomSelect = document.getElementById('resRoomSelect');
  const option = roomSelect.selectedOptions[0];
  const roomNumber = roomSelect.value;
  const roomType = option.getAttribute('data-type');
  const pricePerNight = Number(option.getAttribute('data-price'));

  const inDate = document.getElementById('resCheckIn').value;
  const outDate = document.getElementById('resCheckOut').value;
  const start = new Date(inDate);
  const end = new Date(outDate);
  const nights = Math.max(1, Math.round(Math.max(end - start, 86400000) / (1000 * 60 * 60 * 24)));
  const total = pricePerNight * nights;

  const payload = {
    roomNumber,
    roomType,
    guestName: document.getElementById('resGuestName').value,
    guestEmail: document.getElementById('resGuestEmail').value,
    guestPhone: document.getElementById('resGuestPhone').value,
    checkIn: inDate,
    checkOut: outDate,
    nights,
    guestsCount: document.getElementById('resGuestsCount').value,
    totalAmount: total,
    specialRequests: document.getElementById('resSpecialRequests').value,
    status: 'confirmed',
    paymentStatus: 'paid'
  };

  try {
    const btn = document.getElementById('btnSubmitRes');
    btn.disabled = true;
    btn.textContent = 'Securing Booking...';

    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    btn.disabled = false;
    btn.textContent = 'Confirm Booking';

    if (res.ok) {
      closeModal('modalNewReservation');
      await fetchAllData();
      alert(`Booking Confirmed! Reservation ID: ${data.id}. Room ${roomNumber} reserved.`);
    } else {
      alert(data.error || 'Failed to reserve room.');
    }
  } catch (err) {
    console.error(err);
    alert('Network error when processing reservation.');
  }
}

// Room Status Modal
function openRoomStatusModal(roomId) {
  const room = state.rooms.find(r => r.id === roomId || r.number === roomId);
  if (!room) return;

  state.selectedRoomForEdit = room;
  document.getElementById('modalRoomTitle').textContent = `Room ${room.number}`;
  document.getElementById('modalRoomType').textContent = room.type;
  document.getElementById('modalRoomRate').textContent = `₹${room.pricePerNight.toLocaleString()}/night`;
  document.getElementById('modalRoomStatusSelect').value = room.status;

  openModal('modalRoomStatus');
}

async function saveRoomStatusChange() {
  if (!state.selectedRoomForEdit) return;
  const newStatus = document.getElementById('modalRoomStatusSelect').value;

  try {
    const res = await fetch(`/api/rooms/${state.selectedRoomForEdit.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modalRoomStatus');
      await fetchAllData();
    }
  } catch (e) {
    console.error(e);
  }
}

// AI Co-Pilot
function openCopilotModal() {
  openModal('modalCopilot');
}

async function askCopilotPrompt(promptText) {
  document.getElementById('copilotInput').value = promptText;
  sendCopilotQuery();
}

async function sendCopilotQuery() {
  const input = document.getElementById('copilotInput');
  const query = input.value.trim();
  if (!query) return;

  const box = document.getElementById('copilotResponseBox');
  const btn = document.getElementById('btnSendCopilot');
  btn.disabled = true;
  btn.textContent = 'Analyzing...';
  box.textContent = 'Generating executive operational briefing...';

  try {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    box.innerHTML = formatMarkdownHighlights(data.reply);
  } catch (e) {
    box.textContent = 'Unable to reach Co-Pilot service.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ask';
  }
}

// AI Concierge
function openConciergeModal() {
  openModal('modalConcierge');
}

function askConciergePreset(query) {
  document.getElementById('conciergeInput').value = query;
  sendConciergeQuery();
}

async function sendConciergeQuery() {
  const input = document.getElementById('conciergeInput');
  const query = input.value.trim();
  if (!query) return;

  const guestName = document.getElementById('conciergeGuestSelect')?.value;
  const box = document.getElementById('conciergeResponseBox');
  const btn = document.getElementById('btnSendConcierge');
  btn.disabled = true;
  btn.textContent = 'Inquiring...';
  box.textContent = 'Consulting 5-Star Concierge desk...';

  try {
    const res = await fetch('/api/ai/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, guestName })
    });
    const data = await res.json();
    box.innerHTML = formatMarkdownHighlights(data.reply);
  } catch (e) {
    box.textContent = 'Concierge service temporarily unavailable.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Inquire';
  }
}

function formatMarkdownHighlights(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/•\s/g, '• ')
    .replace(/\n/g, '<br/>');
}

// Add Guest modal
function openAddGuestModal() {
  const name = prompt('Guest Full Name:', 'Alexander Pierce');
  if (!name) return;
  const email = prompt('Guest Email:', 'a.pierce@example.com');
  const phone = prompt('Guest Phone:', '+1 (555) 304-9821');

  fetch('/api/guests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, notes: 'VIP Guest added via CRM' })
  }).then(() => fetchAllData());
}

// Add Room modal
function openNewRoomModal() {
  const num = prompt('Enter Room Number (e.g. 303):', '303');
  if (!num) return;
  const type = prompt('Room Category (Standard King / Deluxe Twin / Executive Suite / Ocean View Suite / Presidential Villa):', 'Executive Suite');
  const price = prompt('Nightly Rate in ₹:', '29800');

  fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      number: num,
      name: type,
      type,
      floor: Number(num[0]) || 3,
      pricePerNight: Number(price) || 25000,
      status: 'available',
      capacity: 4,
      amenities: ['Smart TV', 'Balcony', 'Ensuite Jacuzzi', 'Minibar']
    })
  }).then(() => fetchAllData());
}

// Add Staff modal
function openAddStaffModal() {
  const name = prompt('Staff Member Name:', 'Elena Rostova');
  if (!name) return;
  const role = prompt('Role:', 'Front Desk Supervisor');
  const department = prompt('Department (Front Office, Housekeeping, Concierge, Engineering, Management):', 'Front Office');

  fetch('/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      role,
      department,
      shift: 'Morning (07:00 - 15:30)',
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@grandvistaresort.com`,
      phone: '+1 (555) 201-9955'
    })
  }).then(() => fetchAllData());
}

// Add Housekeeping task
function openNewHousekeepingModal() {
  const roomNum = prompt('Room Number for Housekeeping Task (e.g. 102, 201, 204):', '102');
  if (!roomNum) return;
  const taskType = prompt('Task Type (Turnover Cleaning / Linen Refresh / Inspection / Deep Clean & Sanitize):', 'Turnover Cleaning');
  const priority = prompt('Priority (urgent / normal / high):', 'urgent');

  fetch('/api/housekeeping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomNumber: roomNum,
      roomType: 'Deluxe Suite',
      taskType,
      priority,
      notes: 'Priority room sanitization and replenishment requested from front desk.'
    })
  }).then(() => fetchAllData());
}
