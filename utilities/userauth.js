// Modules
const Logger = require('./logger')
const logger = new Logger()

let crawlauths = []

class UserAuth {

  static addcrawlauth(crawls) {
    crawlauths = crawls
  }

  static docrawlauth(username, password) {
    // Loop through the list to check if the username exists.
    for (let i = 0; i < crawlauths.length; i++) {
      if (crawlauths[i].user == username && crawlauths[i].pass == password) {
        return username
      }
    }
    logger.error(`User ${username} does not exist in the authentication list or username and password do not match.`)
    return null
  }
}

module.exports = UserAuth
