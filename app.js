const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const bodyParser = require('body-parser')
const session = require('express-session')
const uuid = require('uuid/v4')
const FileStore = require('session-file-store')(session)
const app = express()

require('./config/passport')(passport)
require('dotenv').config()

const db = require('./config/keys').mongoURI

mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))


app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(
  session({
    genid: (req) => {
      return uuid()
    },
    cookie: { expires: new Date(253402300000000) },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new FileStore()
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use('/', require('./routes/index.js'))
app.use('/users', require('./routes/users.js'))
app.use('/reports', require('./routes/reports.js'))

const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server started on port ${PORT}`))
