const express = require('express');
const AppointmentController = require('../controllers/appointment.controller');
const Routes = express.Router();

Routes.get('/', AppointmentController.index);
Routes.post('/', AppointmentController.store);
Routes.delete('/:id', AppointmentController.remove);
Routes.put('/:id', AppointmentController.update);
Routes.post('/getByDate', AppointmentController.getByDate);

module.exports = Routes;
