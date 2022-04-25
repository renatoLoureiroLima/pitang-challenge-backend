const express = require('express')
const app = express()
const cors = require('cors')

const Routes = require('./routes/index')

require('dotenv').config()

app.use(express.json())
app.use(cors())
app.use(Routes)

module.exports = app
