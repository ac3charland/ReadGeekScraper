const fs = require('fs')
const cheerio = require('cheerio')
require('dotenv').config();
const keys = require('./keys') 



const $ = cheerio.load(fs.readFileSync(keys.list.path));
$('.media').each((i, element) => {
    console.log($(element).text())
})



