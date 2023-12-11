const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Reservation", reservationSchema);
