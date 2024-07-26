const googlethis = require('googlethis');
const cheerio = require('cheerio');

const prompt =
	'From now on, you will work as text classifier. User will provide words to search, (at this moment, you should reply null), and later, you will get an entire website. If the websitee contains that term (please do not detect meaning match, we ONLY need exact match.), just reply true, and other than that is not needed. Otherwise, return false.';

const term = '去年3月からの1年間に議会がEU離脱に費やした時間は';
async function main() {
	const res = await googlethis.search(term);

	if (!res.results) {
		console.log('No results found');
		return;
	}

	res.results.forEach(async (result) => {
		const d = await globalThis.fetch(result.url);
		const content = extractTextFromSite(await d.text());
		if (await getRes(content)) {
			console.log(result.url);
		} else {
			return;
		}
	});
}

function extractTextFromSite(content) {
	try {
		const $ = cheerio.load(content);
		const text = $('body').text();
		return text;
	} catch (error) {
		console.error('Error fetching the URL:', error);
	}
}

async function getRes(content) {
	try {
		const res = await globalThis.fetch('https://nexra.aryahcr.cc/api/chat/gpt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				prompt: content,
				model: 'gpt-4-32k',
				markdown: false,
				messages: [
					{
						role: 'user',
						content: prompt,
					},
					{
						role: 'assistant',
						content: 'null',
					},
					{
						role: 'user',
						content: `Keyword to search: ${term}. If the website contains this term, reply true, otherwise, reply false.`,
					},
					{
						role: 'assistant',
						content: 'null',
					},
				],
			}),
		});
		const r = await res.json();
		if (r.gpt == 'true') {
			return true;
		} else {
			return false;
		}
	} catch (err) {
		return false;
	}
}

main();
