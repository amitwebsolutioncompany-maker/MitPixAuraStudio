const Course = require('../models/Course');
const CourseEnrollment = require('../models/CourseEnrollment');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

exports.listCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ courses });
});

exports.enroll = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course);
  if (!course || !course.isActive) throw new ApiError(404, 'Course not found');

  const enrollment = await CourseEnrollment.create({ customer: req.user._id, course: course._id });
  res.status(201).json({ enrollment });
});

exports.createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ course });
});

