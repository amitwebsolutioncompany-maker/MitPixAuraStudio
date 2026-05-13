import {todayIso} from './date';

export function slotStart(slot) {
  return new Date(`${slot.date || todayIso()}T${slot.startTime}:00`);
}

export function slotEnd(slot) {
  return new Date(`${slot.date || todayIso()}T${slot.endTime}:00`);
}

export function isPastSlot(slot, now = new Date()) {
  return slotStart(slot) <= now;
}

export function isSlotEnded(slot, now = new Date()) {
  return slotEnd(slot) <= now;
}

export function isBookedNoShowEditable(slot, now = new Date()) {
  return slot.status === 'booked' && now >= new Date(slotStart(slot).getTime() + 10000) && !isSlotEnded(slot, now);
}

export function bookingCustomerName(slot) {
  const booking = slot.booking || {};
  return booking.customerName || booking.customer?.name || slot.offlineCustomerName || 'Customer';
}

export function bookingCustomerPhone(slot) {
  const booking = slot.booking || {};
  return booking.customerPhone || booking.customer?.phone || slot.offlineCustomerPhone || 'No number';
}

export function bookingServiceName(slot) {
  const booking = slot.booking || {};
  return booking.completedServiceName || booking.service?.name || 'Service not updated';
}

export function bookingPaidAmount(slot) {
  return Number(slot.booking?.paymentAmount || 0);
}

export function formatPaidAmount(amount) {
  return `Rs ${Number(amount || 0)}`;
}

export function slotStatusLabel(slot, now = new Date()) {
  if (slot.status === 'available') {
    return isPastSlot(slot, now) ? 'Not booking' : 'Available';
  }
  if (slot.status === 'booked') {
    return isBookedNoShowEditable(slot, now) ? 'No-show editable' : 'Customer booking';
  }
  if (slot.status === 'occupied') {
    return 'Walk-in booking';
  }
  if (slot.status === 'completed') {
    return 'Completed';
  }
  if (slot.status === 'break') {
    const reason = slot.breakReason || 'Break';
    return reason.toLowerCase().includes('leave') ? 'Leave' : reason;
  }
  return slot.status || 'Slot';
}

export function slotDetailLines(slot) {
  if (['booked', 'occupied', 'completed'].includes(slot.status)) {
    const staffName = slot.employee?.user?.name;
    return [
      `${bookingCustomerName(slot)} | ${bookingCustomerPhone(slot)}`,
      `Service: ${bookingServiceName(slot)}`,
      `Paid: ${formatPaidAmount(bookingPaidAmount(slot))}`,
      staffName ? `Staff: ${staffName}` : null,
    ].filter(Boolean);
  }
  if (slot.status === 'break') {
    return [slot.breakReason || 'Break'];
  }
  if (slot.status === 'available' && isPastSlot(slot)) {
    return ['No booking was made for this time.'];
  }
  return ['Open for booking.'];
}
