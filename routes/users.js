const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const rateLimit = require("express-rate-limit");

const promiseErrorHandler = require('../handlers/promiseErrorHandler.js')
const throwError = require('../handlers/promiseErrorHandler.js')

const User = require('../models/user')

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: {error: 'Too many failures. Try again in 5 minutes.'}
});

const registrationLimiter = rateLimit({
  windowMs: 12 * 60 * 60 * 1000,
  max: 5,
  message: {error: 'Too many accounts created. Try again in 12 hours.'}
});

router.post('/register', registrationLimiter, async (req, res) => {
  const { name, email, password, password2 } = req.body
  const fieldsMissing = (!name || !email || !password || !password2)
  const passwordsDontMatch = password !== password2
  const shortPassword = password && password.length < 6
  const emailRegistered = email && await promiseErrorHandler(User.findOne({ email: email }))

  let savedUser
  let errors = []

  fieldsMissing && errors.push({ error: 'Please enter all fields' })
  passwordsDontMatch && errors.push({ error: 'Passwords do not match' })
  shortPassword && errors.push({ error: 'Password must be at least 6 characters' })
  emailRegistered && errors.push({ error: 'Email already registered' })

  errors.length > 0 && respondWithErrors(res, errors)
  errors.length === 0 && (savedUser = await promiseErrorHandler(createUser(name, email, password)))

  savedUser && savedUser.error && res.status(500).json({ message: 'Failed to create new user' })
  savedUser && res.status(200).json({ message: 'User successfully created. You can now log in' })
})

router.post('/login', loginLimiter, (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    return info.success ? login(req, res, user)
      : (info.passwordFail && res.status(401).json({ error: 'Authentication error' })) ||
      (info.emailNotThere && res.status(422).json({ error: 'Email not there' })) ||
      (error && res.status(500).json({ error: 'Server error' }))
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  req.logout()
  res.status(200).json({ status: 'logged out' })
})

function respondWithErrors (res, errors) {
  res.status(422).json(errors)
}

function createUser (name, email, password) {
  return new Promise((resolve, reject) => {
    const newUser = new User({ name, email, password })
    bcrypt.genSalt(10, (error, salt) => {
      error && resolve(error)
      bcrypt.hash(newUser.password, salt, async (error, hash) => {
        error && reject(error)
        newUser.password = hash
        const savedUser = await promiseErrorHandler(newUser.save())
        savedUser.error && throwError('Error while saving new user')
        savedUser && resolve(savedUser)
      })
    })
  })
}

function login (req, res, user) {
  req.login(user, error => {
    error && res.status(500).json({ error: 'Server error' })
    res.status(200).json({ user: user })
  })
}

module.exports = router
