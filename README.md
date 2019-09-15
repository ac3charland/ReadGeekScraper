# ReadGeekScraper

## The Problem:

For past five years, I've used the site [ReadGeek.com](https://www.readgeek.com/) to keep track of the books I've read and how much I've liked them. However, two issues have come up that are motivating me to track my books elsewhere:

1. ### I want to track more fields than just the date I finished a book and my rating on a scale of 1-10.

A few ideas include tags, page length, links to Google Docs with notes for a book, and others. Currently ReadGeek does not provide this functionality.

2. ### As ReadGeek has aged, it has become less stable.

This makes me concerned that my reading data will not be safe there indefinitely. Among the more likely risks is the site closing down due to a lack of use.

## The Solution?

I've come to realize a basic [Google Sheets](https://www.google.com/sheets/about/) spreadsheet would work quite nicely to track the books I've read. It's:

- **Extensible:** Adding a new field to track is as easy as adding a new column.
- **Reliable:** Unlike ReadGeek, I can be sure Google isn't going anywhere anytime soon.
- **Portable:** My spreadsheet will be available on all my devices with Google Sheets, and making local backups in Sheets is trivial compared to ReadGeek.

## The Challenge:

According to ReadGeek, I've rated 151 books. While I could copy over my books by hand, manually transfering 151 books to a Google Sheet is not my idea of fun. Like any self-respecting programmer, I'd rather spend twice as much time writing a script to perform this process automatically.

## How It Works

1. [Cheerio](https://github.com/cheeriojs/cheerio) reads from a local HTML file to scrape the relevant data for each book and store it in an object. This includes some basic date formatting via [Moment](https://momentjs.com/).

    * I did this as opposed to scraping the data directly from ReadGeek.com because my list of rated books is only accessible when logged in, and I was too lazy to write a script to log me in and take me to right page. Instead, I just visited the page in the browser and downloaded the raw HTML. ¯\\\_(ツ)_/¯

2. This array of book objects is then plugged into the [Google Sheets API](https://developers.google.com/sheets/api/) and submitted as a batchUpdate request to a precreated spreadsheet.

3. The API fills out the spreadsheet with all my rated books.

4. Throughout the process, a local .env file protects sensitive information like my spreadsheet's id or the path to my HTML file.
