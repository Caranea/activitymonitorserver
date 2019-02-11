const express = require('express')
const router = express.Router()
const rateLimit = require("express-rate-limit");

const { ensureAuthenticated } = require('../config/auth')

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  });
  

router.get('/dashboard', ensureAuthenticated, apiLimiter, (req, res) => res.status(200).json({ user: req.user })
)

module.exports = router
