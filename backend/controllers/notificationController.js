const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get the logged-in user's notifications (most recent first)
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.status(200).json({ success: true, data: { notifications, unreadCount } });
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.status(200).json({ success: true, data: notification });
});

// @desc    Mark all of the logged-in user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, data: {} });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
