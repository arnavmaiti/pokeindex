// Modules
var express = require('express')
var router = express.Router()

const Logger = require('../utilities/logger')
const logger = new Logger()

const UserAuth = require('../utilities/userauth')

// Authentication middleware
router.use((req, res, next) => {
  logger.info(`Crawl authentication by ${req.connection.remoteAddress} at ${Date.now()}`)

  // check for basic auth header
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
      return res.status(401).json({ message: 'Missing Authorization Header' });
  }

  // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const user = UserAuth.docrawlauth(username, password)
    if (!user) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }

    // attach user to request object
    req.user = user

    next();
})

router.get('/', (req, res) => {
  // TODO: Implement current crawl status similar to how it shows when server starts.
  res.send('test')
})

router.post('/', (req, res) => {

})

module.exports = router
