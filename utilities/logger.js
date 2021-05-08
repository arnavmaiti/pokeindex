// Modules
const chalk = require('chalk')

// Constants
const info = 'Info'
const error = 'Error'
const success = 'Success'

class Logger {
  info(message) {
    message = chalk.yellow(`[${info}]`) + message
    console.log(message)
  }
  error(message) {
    message = chalk.red(`[${error}]`) + message
    console.log(message)
  }
  success(message) {
    message = chalk.green(`[${success}]`) + message
    console.log(message)
  }
}

// Export Logger
module.exports = Logger
