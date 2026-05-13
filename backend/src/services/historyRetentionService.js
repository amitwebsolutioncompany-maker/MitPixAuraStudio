const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

let lastPurgeKey = '';

function activeHistoryWindow(now = new Date()) {
  const resetWindowReached = now.getMonth() === 11 && now.getDate() >= 31;
  const activeYear = resetWindowReached ? now.getFullYear() + 1 : now.getFullYear();

  return {
    activeYear,
    startDate: `${activeYear}-01-01`,
    endDate: `${activeYear}-12-30`,
    cutoffAt: new Date(activeYear, 0, 1, 0, 0, 0, 0),
  };
}

async function purgeExpiredHistory({ force = false } = {}) {
  const todayKey = new Date().toISOString().slice(0, 10);
  if (!force && lastPurgeKey === todayKey) {
    return { skipped: true, ...activeHistoryWindow() };
  }

  lastPurgeKey = todayKey;
  const window = activeHistoryWindow();
  const [bookingResult, slotResult] = await Promise.all([
    Booking.deleteMany({ createdAt: { $lt: window.cutoffAt } }),
    Slot.deleteMany({ date: { $lt: window.startDate } }),
  ]);

  return {
    ...window,
    deletedBookings: bookingResult.deletedCount || 0,
    deletedSlots: slotResult.deletedCount || 0,
  };
}

module.exports = {
  activeHistoryWindow,
  purgeExpiredHistory,
};
