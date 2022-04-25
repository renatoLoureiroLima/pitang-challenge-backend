const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema(
  {
    name: String,
    birthday: Date,
    selectedDate: Date,
    attended: Boolean,
  },
  {
    timestamps: true,
  }
)

const AppointmentModel = new mongoose.model('appointment', AppointmentSchema)

module.exports = AppointmentModel
