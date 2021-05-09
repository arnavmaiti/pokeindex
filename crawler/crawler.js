// Modules
const https = require('https')
const cheerio = require('cheerio')

const Logger = require('../utilities/logger')
const logger = new Logger()

// Constants
const pokeurl = 'https://www.pokemon.com'
const bulbaurl = 'https://www.pokemon.com/us/pokedex/bulbasaur'

const nextnode = 'div.pokedex-pokemon-pagination a.next'
const name = 'div.pokedex-pokemon-pagination-title div'
const number = 'div.pokedex-pokemon-pagination-title span.pokemon-number'

// Parsed data
let data = {
  'pokemon': [],
  'ability': []
}
let current = 'Bulbasaur'
let error = ''

// Job status:
// 0 - completed
// 1 - already running
// -1 - failed
let status = 0

// Class definition
class Crawler {
  /**
   * Checks if a crawl is already in progress. If not, starts a new run.
  **/
  start() {
    if (status > 0) {
      logger.info(`Crawling already in progress. The current crawled Pokémon is ${current}`)
      return {
        'status': 'Running',
        'message': `Crawling in progress. Current crawled Pokémon is ${current}`
      }
    } else {
      // Start with Bulba
      this.crawl(bulbaurl)
      return {
        'status': 'Running',
        'message': `Crawling started. Current crawled Pokémon is ${current}`
      }
    }
  }

  /**
   * Fetches the current status of crawling.
  **/
  fetch() {
    if (status > 0) {
      return {
        'status': 'Running',
        'message': `Crawling in progress. Current crawled Pokémon is ${current}`
      }
    } else if (status < 0) {
      return {
        'status': 'Failed',
        'message': `Crawling failed on ${current} with the message - ${error}`
      }
    } else {
      return `Crawling completed`
    }
  }

  /**
   * Recursive function that crawls a single page and stops once it reaches bulbaurl as the next page
  **/
  crawl(purl) {
    // Fetch the contents of url
    https.get(purl, (res) => {
      let da = ''
      res.on('data', (d) => {
        da += d
      })
      res.on('end', () => {
        // Cheerio load the page
        let $ = cheerio.load(da)
        // Create a new poke entry
        let poke = {}
        // Next url
        let nexturl = pokeurl + $(nextnode).attr('href')
        console.log(nexturl)
        // Name and number
        poke.name = $(name).clone().children().remove().end().text().trim().replace('\n', "")
        poke.number = $(number).text().trim().replace('#', "")
        console.log(poke)

        // Add to pokeentry
        data.pokemon.push(poke)

        // Implement next in a way that if next is bulaurl then exit
        if (nexturl != bulbaurl) {
          status = 1
          error = ''
          this.crawl(nexturl)
        } else {
          status = 0
          error = ''
        }
      });
    }).on('error', (e) => {
      status = -1
      error = err.message
    });
  }
}

module.exports = Crawler
