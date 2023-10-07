import fs from 'fs';

import puppeteer from "puppeteer";

const scrollAndScrape = async (page, target) => {
    // target - desired number of items to retrieve from the page

    let scrappedItems = []; // scraped items from the page

    // keep scrolling and scraping as long as the number of scraped items
    // scrappedItems.length is less than target
    while (scrappedItems.length < target) {
        scrappedItems = await page.evaluate(() => {
            const scrappedItems = Array.from(document.querySelectorAll("shreddit-post"));

            return scrappedItems.map((item) => {
                const titleDiv = item.querySelector('div[id^="post-title-"]');
                return titleDiv ? titleDiv.innerText : '';
            });
        });

        let previousHeight = await page.evaluate("document.body.scrollHeight");
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
        await page.waitForFunction(
            `document.body.scrollHeight > ${previousHeight}`,
            { timeout: 10000 }
        );

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log('Scraped items:', scrappedItems.length);
    }

    return scrappedItems;
};

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-fullscreen', '--window-size=1900,1000'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1900, height: 1000 });

    //  *Important note*: Reddit API
    /*  Reddit has an API which is the preferred way to retrieve data programmatically. Web scraping might be against their terms of service, so always make sure to review and adhere to a website's robots.txt and usage policies when scraping. */
    await page.goto("https://www.reddit.com/r/webscraping/");

    // scrape first target=100 items and write them to json
    const scrappedItems = await scrollAndScrape(page, 100);
    fs.writeFileSync("redit.json", JSON.stringify(scrappedItems, null, 2));
})();