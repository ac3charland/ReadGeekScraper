const fs = require('fs')
const cheerio = require('cheerio')
const moment = require('moment')
const readline = require('readline')
const { google } = require('googleapis')
require('dotenv').config()
const keys = require('./keys')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err)
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), scrapeBooks)
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback)
        oAuth2Client.setCredentials(JSON.parse(token))
        callback(oAuth2Client)
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err)
            oAuth2Client.setCredentials(token)
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err)
                console.log('Token stored to', TOKEN_PATH)
            })
            callback(oAuth2Client)
        })
    })
}

function readTest(auth) {
    const sheets = google.sheets({ version: 'v4', auth })
    sheets.spreadsheets.values.get({
        spreadsheetId: keys.list.spreadsheetId,
        range: 'Books!A1:E1',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err)
        const rows = res.data.values
        if (rows.length) {
            console.log('Column header:')
            rows.map(row => console.log(row))
        } else {
            console.log('No entries found')
        }
    })
}

function writeTest(auth) {
    const sheets = google.sheets({ version: 'v4', auth })
    const testBooks = [
        {
            title: 'Captain Underpants',
            author: 'Dav Pilkey',
            dateFinished: '12/25/2014',
            rating: '10'
        },
        {
            title: '1984',
            author: 'George Orwell',
            dateFinished: '1/25/2017',
            rating: '9'
        },
    ]

    const titles = testBooks.map(book => [book.title])
    const authors = testBooks.map(book => [book.author])
    const datesFinished = testBooks.map(book => [book.dateFinished])
    const ratings = testBooks.map(book => [book.rating])

    const data = [
        {
            range: 'Books!A2:A',
            values: titles
        },
        {
            range: 'Books!B2:B',
            values: authors
        },
        {
            range: 'Books!D2:D',
            values: datesFinished
        },
        {
            range: 'Books!E2:E',
            values: ratings
        },
    ]

    const resource = {
        data,
        valueInputOption: 'RAW',
    }

    sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: keys.list.spreadsheetId,
        resource: resource,
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err)
        console.log('%d cells updated.', res.totalUpdatedCells)
    })
}

function scrapeBooks(auth) {
    const sheets = google.sheets({ version: 'v4', auth })
    
    let books = []

    const $ = cheerio.load(fs.readFileSync(keys.list.path));
    $('.media').each((i, element) => {
        const title = $(element).find('.media-body a').first().text()
        const author = $(element).find('.media-heading').text()
        const rating = $(element).find('.rating').text()
        const rawDate = $(element).find('em').text().slice(10)
        const dateRated = moment(rawDate, 'MMM-DD-YYYY').format('M/D/YYYY')
        const book = { title, author, rating, dateRated }
        books.push(book)
    })

    const titles = books.map(book => [book.title])
    const authors = books.map(book => [book.author])
    const datesFinished = books.map(book => [book.dateRated])
    const ratings = books.map(book => [book.rating])

    const data = [
        {
            range: 'Books!A2:A',
            values: titles
        },
        {
            range: 'Books!B2:B',
            values: authors
        },
        {
            range: 'Books!D2:D',
            values: datesFinished
        },
        {
            range: 'Books!E2:E',
            values: ratings
        },
    ]

    const resource = {
        data,
        valueInputOption: 'USER_ENTERED',
    }

    sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: keys.list.spreadsheetId,
        resource: resource,
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err)
        console.log('Update successful!')
    })

}