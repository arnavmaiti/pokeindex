// Modules
const https = require('https')
const cheerio = require('cheerio')

const Logger = require('../utilities/logger')
const logger = new Logger()

// Constants
const pokeurl = 'https://www.pokemon.com'
const bulbaurl = 'https://www.pokemon.com/us/pokedex/bulbasaur'

const nextnode = 'div.pokedex-pokemon-pagination>a.next'
const name = 'div.pokedex-pokemon-pagination-title>div'
const number = 'div.pokedex-pokemon-pagination-title span.pokemon-number'
const type = 'div.pokedex-pokemon-attributes.active>div.dtm-type>ul>li>a'
const stats = 'div.pokemon-stats-info.active>ul>li'

// Parsed data
let data = {
  'pokemon': [],
  'ability': []
}
let current = 'Bulbasaur'
let error = ''
let cancel = false

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
      cancel = false
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
      return {
        'status': 'Completed',
        'message': `Crawling completed`
      }
    }
  }

  stop() {
    cancel = true
    return {
      'status': 'Completed',
      'message': `Crawling completed. Last crawled Pokémon was ${current}`
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
        poke.number = parseInt($(number).text().trim().replace('#', ""))
        current = poke.name

        // Type
        let types = $(type)
        poke.type = []
        for (let i = 0; i < types.length; i++) {
          poke.type.push($(types[i]).text().trim())
        }

        // Stats
        let stat = $(stats)
        poke.stats = {
          'HP': 0,
          'Attack': 0,
          'Defense': 0,
          'Special Attack': 0,
          'Special Defense': 0,
          'Speed': 0
        }
        console.log(stat.length)
        poke.stats['HP'] = parseInt($(stat[0]).find('ul li.meter').attr('data-value'))
        poke.stats['Attack'] = parseInt($(stat[1]).find('ul li.meter').attr('data-value'))
        poke.stats['Defense'] = parseInt($(stat[2]).find('ul li.meter').attr('data-value'))
        poke.stats['Special Attack'] = parseInt($(stat[3]).find('ul li.meter').attr('data-value'))
        poke.stats['Special Defense'] = parseInt($(stat[4]).find('ul li.meter').attr('data-value'))
        poke.stats['Speed'] = parseInt($(stat[5]).find('ul li.meter').attr('data-value'))



        // Add to pokeentry
        console.log(poke)
        data.pokemon.push(poke)

        // Implement next in a way that if next is bulaurl then exit
        if (!cancel && nexturl != bulbaurl) {
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
