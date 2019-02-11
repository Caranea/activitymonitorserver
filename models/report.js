const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: false
  }
})
const Report = mongoose.model('Report', ReportSchema)

module.exports = Report
