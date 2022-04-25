const { request } = require('express')
const AppointmentModel = require('../models/appointment.model')
const Yup = require('yup')

class Appointment {
  async index(req, res) {
    try {
      const appointments = await AppointmentModel.find()

      res.send({ appointments })
    } catch (e) {
      res.status(400).json({ message: 'ERRO' })
    }
  }

  async getByDate(req, res) {
    const body = {
      ...req.body,
      selectedDate: new Date(req.body.selectedDate),
    }

    const firstDate = new Date(body.selectedDate)

    firstDate.setHours(21)
    firstDate.setMinutes(0)

    const secondDate = new Date(
      body.selectedDate.setDate(body.selectedDate.getDate() + 1)
    )
    const response = await AppointmentModel.find({
      selectedDate: {
        $gte: new Date(firstDate),
        $lte: new Date(secondDate),
      },
    })

    return res.json(response)
  }

  async store(req, res) {
    const body = {
      ...req.body,
      birthday: new Date(req.body.birthday),
      selectedDate: new Date(req.body.selectedDate),
    }

    const schema = Yup.object().shape({
      name: Yup.string()
        .min(3)
        .required('Name field required')
        .matches(/^[A-Za-zà-úÀ-Ú ]+$/, 'Name must be only characters'),
      birthday: Yup.date()
        .max(new Date(), 'Data inválida')
        .required('Birthday field required'),
      selectedDate: Yup.date()
        .min(new Date(), 'Data inválida')
        .required('Selected date required'),
    })

    try {
      await schema.validate(body, { abortEarly: false })
    } catch (error) {
      return res.status(400).json({ message: error.message })
    }

    if (
      body.selectedDate.getHours() < 6 ||
      (body.selectedDate.getMinutes() > 0 &&
        body.selectedDate.getMinutes() < 30) ||
      (body.selectedDate.getMinutes() > 30 &&
        body.selectedDate.getMinutes() <= 59) ||
      body.selectedDate.getHours() > 18
    ) {
      return res.status(400).json({ message: 'Horário inválido' })
    }
    body.attended = false

    const firstDate = new Date(body.selectedDate)

    firstDate.setHours(0)
    firstDate.setMinutes(0)

    const secondDate = new Date(firstDate)
    secondDate.setDate(secondDate.getDate() + 1)

    const appointmentsToday = await AppointmentModel.find({
      selectedDate: {
        $gte: new Date(firstDate),
        $lte: new Date(secondDate),
      },
    })

    if (appointmentsToday.length >= 20) {
      return res
        .status(400)
        .json({ message: 'Não existem mais vagas nessa data selecionada.' })
    }

    const appointmentsInSelectedHour = await AppointmentModel.find({
      selectedDate: body.selectedDate,
    })

    if (appointmentsInSelectedHour.length == 2) {
      return res.status(400).json({message: "Não existem mais vagas para esse horário."})
    }

    if (
      appointmentsToday.length >= 20 &&
      appointmentsInSelectedHour.length == 0
    ) {
      return res
        .status(400)
        .json({ message: 'Não há mais vagas na data selecionada' })
    }

    try {
      const appointment = await AppointmentModel.create(body)

      res.send({ appointment })
    } catch (e) {
      res.status(400).json({ message: 'ERROR' })
    }
  }

  async update(req, res) {
    const {
      body,
      params: { id },
    } = req

    const appointment = await AppointmentModel.findByIdAndUpdate(id, body, {
      new: true,
    })

    res.send({ appointment })
  }

  async remove(req, res) {
    const { id } = req.params

    try {
      const appointment = await AppointmentModel.findById(id)

      if (!appointment) {
        return res.send({ message: 'Appointment does not exist.' })
      }

      await appointment.remove()

      res.send({ message: 'Appointment Removed' })
    } catch (e) {
      res.status(400).send({ message: 'ERROR' })
    }
  }
}

module.exports = new Appointment()
