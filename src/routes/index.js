const express = require('express')

const AppointmentRouter = require('./appointment.route')

const Routes = express.Router()

Routes.use('/appointment', AppointmentRouter)

module.exports = Routes
