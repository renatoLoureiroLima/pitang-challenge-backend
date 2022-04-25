const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const dateFNS = require('date-fns')

require('dotenv').config()

const { MONGO_TEST_URL } = process.env

describe('Appointment tests', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_TEST_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
  })

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase()
    await mongoose.connection.close()
  })

  test('Should be able to create a new appointment', async () => {
    const response = await request(app)
      .post('/appointment')
      .send({
        name: 'testeIdoso',
        birthday: '1940-04-10T00:00:00.000Z',
        selectedDate: dateFNS.addDays(
          dateFNS.setHours(
            dateFNS.setMinutes(
              dateFNS.setSeconds(dateFNS.setMilliseconds(new Date(), 0), 0),
              30
            ),
            15
          ),
          2
        ),
      })
    expect(response.status).toBe(200)
  })

  test('Should not be able to create a new appointment without name', async () => {
    const response = await request(app).post('/appointment').send({
      birthday: '1940-04-10T00:00:00.000Z',
      selectedDate: '2021-04-23T09:00:00.000Z',
    })
    expect(response.status).toBe(400)
  })

  test('Should not be able to create a new appointment without birthday', async () => {
    const response = await request(app).post('/appointment').send({
      name: 'testeIdoso',
      selectedDate: '2021-04-23T09:00:00.000Z',
    })
    expect(response.status).toBe(400)
  })

  test('Should not be able to create a new appointment without selectedDate', async () => {
    const response = await request(app).post('/appointment').send({
      name: 'testeIdoso',
      birthday: '1940-04-10T00:00:00.000Z',
    })
    expect(response.status).toBe(400)
  })

  test('Should not be able to create a new appointment with a invalid birthday', async () => {
    const response = await request(app)
      .post('/appointment')
      .send({
        name: 'testeIdoso',
        birthday: dateFNS.addDays(new Date(), 1),
        selectedDate: '2021-04-23T09:00:00.000Z',
      })
    expect(response.status).toBe(400)
  })

  test('Should not be able to create a new appointment with a invalid hour in selectedDate', async () => {
    const response = await request(app)
      .post('/appointment')
      .send({
        name: 'testeIdoso',
        birthday: dateFNS.setDate(new Date(), -1),
        selectedDate: dateFNS.addDays(dateFNS.setHours(new Date(), 0), 1),
      })
    expect(response.status).toBe(400)
  })

  test('Should not be able to create a new appointment with a invalid minutes in selectedDate', async () => {
    const response = await request(app)
      .post('/appointment')
      .send({
        name: 'testeIdoso',
        birthday: dateFNS.setDate(new Date(), -1),
        selectedDate: dateFNS.addDays(
          dateFNS.setHours(dateFNS.setMinutes(new Date(), 29), 6),
          1
        ),
      })
    expect(response.status).toBe(400)
  })

  test('Should not be able to create more than two appointments in the same schedule', async () => {
    await request(app)
      .post('/appointment')
      .send({
        name: 'testeNovo',
        birthday: '1940-04-10T00:00:00.000Z',
        selectedDate: dateFNS.addDays(
          dateFNS.setHours(
            dateFNS.setMinutes(
              dateFNS.setSeconds(dateFNS.setMilliseconds(new Date(), 0), 0),
              30
            ),
            15
          ),
          2
        ),
      })

    const response = await request(app)
      .post('/appointment')
      .send({
        name: 'testeNovo',
        birthday: '1940-04-10T00:00:00.000Z',
        selectedDate: dateFNS.addDays(
          dateFNS.setHours(
            dateFNS.setMinutes(
              dateFNS.setSeconds(dateFNS.setMilliseconds(new Date(), 0), 0),
              30
            ),
            15
          ),
          2
        ),
      })
    expect(response.status).toBe(400)
  })

  test('Should not be able to create more than twenty appointments in the same day', async () => {
    const dateForAppointments = dateFNS.addDays(
      dateFNS.setHours(
        dateFNS.setMinutes(
          dateFNS.setSeconds(dateFNS.setMilliseconds(new Date(), 0), 0),
          30
        ),
        6
      ),
      5
    )
    for (let i = 0; i <= 10; i++) {
      await request(app)
        .post('/appointment')
        .send({
          name: 'testeNovo',
          birthday: '1940-04-10T00:00:00.000Z',
          selectedDate: dateFNS.addMinutes(dateForAppointments, i * 30),
        })
      await request(app)
        .post('/appointment')
        .send({
          name: 'testeNovo',
          birthday: '1940-04-10T00:00:00.000Z',
          selectedDate: dateFNS.addMinutes(dateForAppointments, i * 30),
        })
    }

    const response = await request(app)
      .post('/appointment')
      .send({
        name: 'testeNovo',
        birthday: '1932-04-10T00:00:00.000Z',
        selectedDate: dateFNS.addDays(
          dateFNS.setHours(dateFNS.setMinutes(new Date(), 0), 18),
          5
        ),
      })

    expect(response.status).toBe(400)
  })

  test('Should be able to replace an young person with a elderly person during a full schedule', async () => {
    const dateForAppointments = dateFNS.addDays(
      dateFNS.setHours(
        dateFNS.setMinutes(
          dateFNS.setSeconds(dateFNS.setMilliseconds(new Date(), 0), 0),
          0
        ),
        6
      ),
      3
    )
    for (let i = 0; i <= 2; i++) {
      await request(app).post('/appointment').send({
        name: 'testeNovo',
        birthday: '1999-04-10T00:00:00.000Z',
        selectedDate: dateForAppointments,
      })
    }

    const response = await request(app).post('/appointment').send({
      name: 'testeVelho',
      birthday: '1932-04-10T00:00:00.000Z',
      selectedDate: dateForAppointments,
    })

    expect(response.status).toBe(200)
  })

  test('Should not be able to replace an elderly person with another elderly person during a full schedule', async () => {
    const dateForAppointments = dateFNS.addDays(
      dateFNS.setHours(
        dateFNS.setMinutes(
          dateFNS.setSeconds(dateFNS.setMilliseconds(new Date(), 0), 0),
          0
        ),
        6
      ),
      6
    )
    for (let i = 0; i <= 2; i++) {
      await request(app).post('/appointment').send({
        name: 'testeNovo',
        birthday: '1932-04-10T00:00:00.000Z',
        selectedDate: dateForAppointments,
      })
    }

    const response = await request(app).post('/appointment').send({
      name: 'testeVelho',
      birthday: '1932-04-10T00:00:00.000Z',
      selectedDate: dateForAppointments,
    })

    expect(response.status).toBe(400)
  })
})
