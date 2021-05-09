// Modules
const express = require('express')
const router = express.Router()

const Logger = require('../utilities/logger')
const logger = new Logger()

const UserAuth = require('../utilities/userauth')

const Crawler = require('./crawler')
const crawler = new Crawler()

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
  res.send(crawler.fetch())
})

router.post('/', (req, res) => {
  res.send(crawler.start())
})

router.delete('/', (req, res) => {
  res.send(crawler.stop())
})

module.exports = router
