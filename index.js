#!/usr/bin/env node

const google = require('googleapis').google
const customSearch = google.customsearch('v1');
const download = require('image-downloader');
var readlineSync = require('readline-sync');
const path = require('path')


const googlesearchcredencials = require('./credentials/google-search.json');


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
		items = 'I did not find images related to this term'
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
		dest: dest+Date.now().toString()+' - '+term+path.extname(UrlsImgs[index].link)
	}

	if (index < limit) {
		download.image(options).then(() => {
			if (index > 0) {
				console.log('Another downloaded image')
			} else {
				console.log('I downloaded the first image')
			}
			imgTotals++

			downloading(UrlsImgs, index+1, limit, term, dest)
		}).catch(() => {
			console.log('There was an error downloading one of the images but I will download another!\n')
			downloading(UrlsImgs, index+1, limit, term, dest)
		})


	} else {
		console.log('Perfect! the limit of images to be downloaded has already been reached\n')
		console.log('total images downloaded: '+imgTotals)
	}
}



void async function() {
	var term = readlineSync.question('Enter a term: ')


	const {
		response,
		items
	} = await search(term)

	if (items !== 'I did not find images related to this term') {
		console.log(`Ok! I found ${items.length} images`)

		var limit = readlineSync.question('How many images do you want me to download: ')

		if (isNaN(limit)) {
			console.log('You need to enter a number.')

			limit = readlineSync.question('how many images do you want me to download: ')
		}

		if (Number(limit) > items.length) {
			console.log('The number of images to be downloaded cannot be greater than the number of images I found\n')

			limit = readlineSync.question('how many images do you want me to download: ')
		}
		
		var dest = readlineSync.question(`\nEnter the exact destination where the images will be saved.\nExample: /desktop/folder-for-downloaded-images/\nIf you want to download it in the folder you are in, type '.'\ndest: `)
		
		
		if (dest == '.') {
			dest = './'
		}
		
		if (dest.substring(dest.length-1, dest.length).indexOf('/') == -1) {
			dest = dest+'/'
		}

		downloading(items, 0, limit, term, dest)

	} else {
		console.log(items)
	}
}()