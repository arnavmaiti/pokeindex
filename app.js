// Modules
const express = require('express')
const app = express()

const Logger = require('./utilities/logger')
const logger = new Logger()

const UserAuth = require('./utilities/userauth')

const crawler = require('./crawler/crawl')

// Constants
const port = 80

// Process command line arguments
// Argument structure is type:user/pass
const argregex = /(.*)\:(.*)\/(.*)/
const args = process.argv.slice(2)
let crawlauths = []
// Crawler usernames and passwords
for (let i = 0; i < args.length; i++) {
  let parts = argregex.exec(args[i])
  // Parse if crawlauth and store as crawl auth users and passes
  if (parts && parts[1] == 'crawlauth') {
    auth = {
      'user': parts[2],
      'pass': parts[3]
    }
    crawlauths.push(auth)
  }
}
UserAuth.addcrawlauth(crawlauths)

// Register routes
app.use(express.static('public'))

// Register crawler router
app.use('/crawler', crawler)

// Create the server
const http = app.listen(port, () => {
  logger.info("Pokeindex successfully started. Please use the crawler API to crawl through Pokemon data. Search will only be available once the indexing is complete.")
  // Add current status of crawling here based on the crawling data.
  // TODO: Complete this once crawler is implemented. Show basic information as success such as number of pokemon as well as last crawl time.
  logger.error("No Pokemon crawl data found. Please use the crawl API to crawl the latest data from Pokemon official site.")
})
