const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    status: { type: String, enum: ['requested', 'approved', 'completed', 'cancelled'], default: 'requested' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CourseEnrollment', courseEnrollmentSchema);
