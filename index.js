#!/usr/bin/env node

const google = require('googleapis').google
const customSearch = google.customsearch('v1');
const download = require('image-downloader');
var readlineSync = require('readline-sync');
const path = require('path')
const fs = require('fs')
const package = require('./package.json')
var downloadedImages = []
const chalk = require('chalk');


const googlesearchcredencials = require('./credentials/google-search.json');

if (process.argv.indexOf('-v') != -1 || process.argv.indexOf('--version') != -1 || process.argv.indexOf('version') != -1) {
	console.log('In version: ' + package.version)
} else {
	start()
}


async function start() {
	var term = readlineSync.question('Enter a term: ')

	if (term === '') {
		console.log(`You haven't entered any terms`)
		term = readlineSync.question('Enter a term: ')
	}

	const {
		response,
		items
	} = await search(term)

	if (items !== false) {
		console.log(chalk.green(`\nOk! I found ${items.length} images`))

		var limit = readlineSync.question('How many images do you want me to download: ')

		if (isNaN(limit)) {
			console.log('\nYou need to enter a number.')

			limit = readlineSync.question('how many images do you want me to download: ')
		}

		if (limit === '') {
			console.log('\nyou have not entered any numbers')

			limit = readlineSync.question('how many images do you want me to download: ')
		}

		if (Number(limit) > items.length) {
			console.log('\nThe number of images to be downloaded cannot be greater than the number of images I found')

			limit = readlineSync.question('how many images do you want me to download: ')
		}

		var dest = readlineSync.question(`\nEnter the exact destination where the images will be saved.\nExample: /desktop/images/\nthere is no need to create the directory! if it does not exist, it will be created automatically.\nif you want to save the image in the current directory, type '.'\n\ndest: `)


		if (dest === '') {
			dest = './'
		}

		if (dest == '.') {
			dest = './'
		}

		if (dest.substring(dest.length-1, dest.length).indexOf('/') == -1) {
			dest = dest+'/'
		}

		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest)
		}

		downloading(items, 0, limit, term, dest)

	} else {
		console.log('I did not find images related to this term')
	}
}

async function search(search) {
	const response = await customSearch.cse.list({
		auth: googlesearchcredencials.apiKey,
		cx: googlesearchcredencials.searchEngineId,
		q: search,
		searchType: 'image',
		imgSize: 'huge'
		//num: Math.floor(Math.random() * 20)
	});

	try {
		const items = response.data.items.map((items) => {
			return items
		})

		return {
			response: response,
			items: items
		}

	} catch (error) {
		items = false
		return {
			response: response,
			items: items
		}
	}
}

var imgTotals = 0

async function downloading(UrlsImgs, index, limit, term, dest) {

	const options = {
		url: UrlsImgs[index].link,
		dest: dest+Date.now().toString()+'-'+term+path.extname(UrlsImgs[index].link)
	}

	if (index < limit) {
		if (downloadedImages.indexOf(options.url) === -1) {
			download.image(options).then(() => {
				if (index > 0) {
					console.log(chalk.cyan('\nAnother downloaded image\nUrl: '+ options.url))
				} else {
					console.log(chalk.cyan('\nI downloaded the first image\nUrl: '+options.url))
				}
				imgTotals++
				downloadedImages.push(options.url)

				downloading(UrlsImgs, index+1, limit, term, dest)
			}).catch(() => {
				console.log(chalk.red('\nThere was an error downloading one of the images but I will download another!'))
				downloading(UrlsImgs, index+1, limit, term, dest)
			})
		} else {
			console.log(chalk.red(`duplicate image!  I'll download another one!`))
			downloading(UrlsImgs, index+1, limit, term, dest)
		}

	} else {
		console.log(chalk.green('\nPerfect! the limit of images to be downloaded has already been reached\n'))
		console.log('total images downloaded: '+chalk.green(imgTotals))
	}
}
