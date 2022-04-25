const app = require('./app')
const mongoose = require('mongoose')

const { HTTP_PORT } = process.env

const { MONGO_URL } = process.env

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

app.listen(HTTP_PORT, () => console.log(`Rodando na porta ${HTTP_PORT}`))
