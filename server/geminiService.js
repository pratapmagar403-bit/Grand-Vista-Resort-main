import { GoogleGenAI } from '@google/genai';
import { db } from './dataStore.js';

let aiClient = null;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function askAiCopilot(query) {
  const ai = getAiClient();
  const analytics = db.getAnalytics();
  const occupiedRooms = db.rooms.filter(r => r.status === 'occupied').map(r => `Room ${r.number} (${r.type}, Guest: ${r.currentGuestName || 'Unknown'})`).join(', ');
  const availableRooms = db.rooms.filter(r => r.status === 'available').map(r => `Room ${r.number} (${r.type}, ₹${r.pricePerNight})`).join(', ');
  const urgentCleaning = db.housekeepingTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').map(t => `Room ${t.roomNumber} (${t.taskType})`).join(', ');

  const context = `
You are the Grand Vista Resort Executive AI Co-Pilot, an intelligent hotel operations assistant.
Current Resort Metrics:
- Occupancy Rate: ${analytics.occupancyRate}% (${analytics.occupiedRoomsCount} of ${analytics.totalRoomsCount} rooms occupied)
- Total Month Revenue: ₹${analytics.totalMonthRevenue.toLocaleString()} (ADR: ₹${analytics.adr.toLocaleString()}, RevPAR: ₹${analytics.revPar.toLocaleString()})
- Occupied Rooms: ${occupiedRooms || 'None'}
- Available Rooms: ${availableRooms || 'None'}
- Urgent Housekeeping Tasks: ${urgentCleaning || 'None'}
- Total Staff on duty: ${db.staff.filter(s => s.status === 'active').length} members.

Guidelines:
- Provide concise, actionable, hospitality-executive answers.
- Offer operational recommendations, guest satisfaction improvements, revenue optimization, or housekeeping expediting where appropriate.
- Format with clean bullet points or bold highlights.
  `;

  if (!ai) {
    return `**Executive Operations Summary & Recommendations**\n\n` +
      `• **Current Occupancy**: ${analytics.occupancyRate}% with ${analytics.occupiedRoomsCount} occupied suites.\n` +
      `• **Revenue Pulse**: Month revenue is ₹${analytics.totalMonthRevenue.toLocaleString()} with ADR at ₹${analytics.adr.toLocaleString()} and RevPAR at ₹${analytics.revPar.toLocaleString()}.\n` +
      `• **Housekeeping Status**: ${db.housekeepingTasks.filter(t => t.status !== 'completed').length} tasks pending, notably room turnarounds for Room 204 to ensure expedited check-in availability.\n` +
      `• **Operational Advice**: Consider promoting dynamic weekend package pricing for available Executive Suites (Rooms 202 and 302) to lift RevPAR past ₹10,000.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${context}\n\nHotel Manager Inquiry: ${query}`
    });
    return response.text || 'Unable to generate co-pilot advice at this time.';
  } catch (error) {
    console.error('Gemini Co-Pilot error:', error);
    return `Operations Insight: Currently managing ${analytics.totalRoomsCount} rooms with ${analytics.occupancyRate}% occupancy. Please check housekeeping queues for Room 204 to ensure expedited check-in availability.`;
  }
}

export async function askAiConcierge(query, guestName) {
  const ai = getAiClient();
  const guest = guestName ? db.guests.find(g => g.name.toLowerCase().includes(guestName.toLowerCase())) : null;

  const context = `
You are the 5-Star AI Concierge for Grand Vista Resort & Spa.
Guest: ${guest ? `${guest.name} (${guest.vipTier} tier, preferred: ${guest.preferences.join(', ')})` : 'Esteemed Resort Guest'}
Resort Amenities:
- The Azure Coral: 5-star Mediterranean & Coastal Seafood dining (Open 18:30 - 23:00)
- AyurVeda Spa & Wellness Pavilions: Ayurvedic massage, steam baths, sunset ocean yoga
- Infinity Sky Pool: Heated panoramic rooftop pool (Open 06:00 - 22:00)
- Luxury Private EV Chauffeur: Airport transfers and private city heritage tours
- Water Sports & Yacht Charters: Sunset catamaran cruise, deep reef snorkeling

Tone: Warm, luxurious, polite, helpful 5-star hotel concierge. Provide specific times, dress codes, or booking offers.
  `;

  if (!ai) {
    return `Greetings from Grand Vista Resort! 🌟\n\n` +
      `Our concierge desk is delighted to assist you. Tonight we recommend dinner at **The Azure Coral** (exceptional coastal seafood pairing with our signature vintage cellar), followed by sunset cocktails on the Sky Deck.\n\n` +
      `Would you like me to reserve a private cabana by the infinity pool or arrange your spa sanctuary appointment for tomorrow morning?`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${context}\n\nGuest Request: ${query}`
    });
    return response.text || 'Our concierge team is at your immediate service.';
  } catch (error) {
    console.error('Gemini Concierge error:', error);
    return `Welcome to Grand Vista Resort! Our concierge team is pleased to assist with dining reservations, private yacht charters, or spa experiences. How may we delight your stay today?`;
  }
}
