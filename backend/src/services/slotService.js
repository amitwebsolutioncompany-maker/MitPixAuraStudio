const Slot = require('../models/Slot');
const Employee = require('../models/Employee');

const SLOT_MINUTES = 30;

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

async function generateSlotsForEmployee(employeeId, date = todayIso()) {
  const employee = await Employee.findById(employeeId).populate('salon');
  if (!employee || !employee.salon) return [];

  const opening = toMinutes(employee.salon.openingTime || '10:00');
  const closing = toMinutes(employee.salon.closingTime || '22:00');
  const slots = [];

  for (let current = opening; current < closing; current += SLOT_MINUTES) {
    slots.push({
      salon: employee.salon._id,
      employee: employee._id,
      admin: employee.admin || employee.salon.admin,
      date,
      startTime: toTime(current),
      endTime: toTime(current + SLOT_MINUTES),
      status: 'available'
    });
  }

  await Slot.bulkWrite(
    slots.map((slot) => ({
      updateOne: {
        filter: { employee: slot.employee, date: slot.date, startTime: slot.startTime },
        update: { $setOnInsert: slot },
        upsert: true
      }
    }))
  );

  return Slot.find({ employee: employee._id, date }).sort({ startTime: 1 });
}

async function generateSlotsForSalon(salonId, date = todayIso()) {
  const employees = await Employee.find({ salon: salonId, isActive: true });
  const results = await Promise.all(employees.map((employee) => generateSlotsForEmployee(employee._id, date)));
  return results.flat();
}

module.exports = { generateSlotsForEmployee, generateSlotsForSalon, todayIso };
