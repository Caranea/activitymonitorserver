const express = require('express')
const router = express.Router()
const moment = require('moment')
const rateLimit = require("express-rate-limit");

const Report = require('../models/report')
const {ensureAuthenticated} = require('../config/auth')
const promiseErrorHandler = require('../handlers/promiseErrorHandler.js')
const findWebsiteCategory  = require('../js/findWebsiteCategory.js')

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});

router.post('/', ensureAuthenticated, apiLimiter, async (req, res) => {
  const { userId, time, url, timeSpent } = req.body
  const fieldsMissing = (!time || !userId || !url || !timeSpent)
  fieldsMissing && res.status(422).json({ error: 'missing report info' })
  let savedReport
  !fieldsMissing && (savedReport = await promiseErrorHandler(createReport(userId, time, url, timeSpent)))
  savedReport && savedReport.error && res.status(500).json({ message: 'Failed to create new Report' }) && console.log(savedReport.error)
  savedReport && !savedReport.error && res.status(200).json({ message: 'Report successfully created' })
})

router.get('/:userId', ensureAuthenticated, apiLimiter, async (req, res) => {
  const timeInMilliseconds = JSON.parse(req.query.milliseconds.toLowerCase())
  const reports = await promiseErrorHandler(Report.find({
    userId: req.params.userId,
    time: {
      $gte: new Date(req.query.from),
      $lt: new Date(req.query.to)
    }
  }))
  reports.error ? res.status(500).json('Failed to fetch websites') : res.status(200).json({ websites: calculateWebsiteStats(reports, timeInMilliseconds) })
})

function createReport (userId, time, url, timeSpent) {
  return new Promise(async (resolve, reject) => {
    const category = await promiseErrorHandler(findWebsiteCategory(url))
    const newReport = new Report({ userId, time, url, timeSpent, category })
    const savedReport = await promiseErrorHandler(newReport.save())
    savedReport && resolve(savedReport)
  })
}

function calculateWebsiteStats (reports, timeInMilliseconds) {
  let websites = []
  reports.forEach(report => {
    let websiteVisited = websites.some(website => {
      return website.url === report.url
    })
    !websiteVisited ? websites.push({ url: report.url, timeSpent: report.timeSpent, category: report.category })
      : websites[websites.map(website => { return website.url }).indexOf(report.url)].timeSpent += report.timeSpent
  })
  if (timeInMilliseconds === false) {
    websites.forEach(website => {
      website.timeSpent = moment(website.timeSpent).utc().format('HH:mm:ss')
    })
  }
  return websites
}


module.exports = router
