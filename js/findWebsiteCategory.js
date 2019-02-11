
const Webshrinker = require("webshrinker")
const Report = require('../models/report')
const key = require('../config/keys').webShrinkerKey
const secret = require('../config/keys').webShrinkerSecret
const promiseErrorHandler = require('../handlers/promiseErrorHandler.js')

async function findWebsiteCategory(url) {
  const report = await promiseErrorHandler(Report.findOne({ url: url }))
  return report && report.category ? report.category : await getWebShrinkerCategory(url)
}

async function getWebShrinkerCategory (url) {
    const webshrinker = new Webshrinker({key: key, secret: secret})
    let category = await promiseErrorHandler(webshrinker.getCategories(url))
    return category[0] ? category[0].label : 'Uncategorized'
}

module.exports = findWebsiteCategory
