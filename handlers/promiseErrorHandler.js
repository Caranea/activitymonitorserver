const promiseErrorHandler = promise => (
  promise
    .then(data => data)
    .catch(error => ({ error, data: null }))
)

module.exports = promiseErrorHandler
