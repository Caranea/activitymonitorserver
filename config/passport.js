const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const promiseErrorHandler = require('../handlers/promiseErrorHandler.js')
const throwError = require('../handlers/promiseErrorHandler.js')

const User = require('../models/user')

module.exports = passport => {
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      const user = await promiseErrorHandler(User.findOne({ email: email }))
      user ? matchUsersPassword(password, user, done) : returnEmailError(done)
    }))

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (error, user) => { done(error, user) })
  })
}

async function matchUsersPassword (password, user, done) {
  const isMatch = await promiseErrorHandler(bcrypt.compare(password, user.password))
  isMatch.error && throwError('Error while comparing passwords')
  return isMatch ? done(null, user, { success: true }) : done(null, false, { passwordFail: true })
}

function returnEmailError (done) {
  return done(null, false, { emailNotThere: true })
}
