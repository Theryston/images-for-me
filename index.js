const google = require('googleapis').google
const customSearch = google.customsearch('v1');
const download = require('image-downloader')


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

async function downloading(UrlsImgs) {

	UrlsImgs.forEach((UrlImg) => {

		const options = {
			url: UrlImg.link,
			dest: './download/'
		}

		download.image(options).then(() => {
			console.log('Saved')
		}).catch(() => {
			console.log('error in save')
		})
	})
}



void async function() {
	const {response, items} = await search(process.argv[2])

	if (items !== 'I did not find images related to this term') {
		console.log(`Ok! I found ${items.length} images`)

		downloading(items)

	} else {
		console.log(items)
	}
}()