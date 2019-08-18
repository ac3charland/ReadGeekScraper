const fs = require('fs')
const cheerio = require('cheerio')
require('dotenv').config();
const keys = require('./keys') 
const moment = require('moment')



const $ = cheerio.load(fs.readFileSync(keys.list.path));
$('.media').each((i, element) => {
    const title = $(element).find('.media-body a').first().text()
    const author = $(element).find('.media-heading').text()
    const rating = $(element).find('.rating').text()
    const rawDate = $(element).find('em').text().slice(10)
    const dateRated = moment(rawDate, 'MMM-DD-YYYY').format('M/D/YYYY')
    const book = {title, author, rating, dateRated}
    console.log(book)
})



