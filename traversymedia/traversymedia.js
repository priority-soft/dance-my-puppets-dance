const fs = require('fs');
const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({
        headless: 'false',
    });
    const page = await browser.newPage();
    await page.goto('https://www.traversymedia.com');

    // take a screenshot of a site
    await page.screenshot({ path: 'example.png', fullPage: true });
    await page.pdf({ path: 'example.pdf', format: 'A4' });

    const html = await page.content();
    console.log(html);

    const title = await page.evaluate(() => document.title);
    console.log(title);

    const text = await page.evaluate(() => document.body.innerText);
    console.log(text);

    const links = await page.evaluate(() => Array.from(document.querySelectorAll('a'), (e) => e.href));
    console.log(links);

    // scrape the courses
    const courses = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#cscourses .card'), (e) => ({
            title: e.querySelector('.card-body h3').innerText,
            level: e.querySelector('.card-body .level').innerText,
            url: e.querySelector('.card-footer a').href
        }))
    );
    console.log(courses);

    // the same with using $$eval
    const courses2 = await page.$$eval('#cscourses .card', (elements) => elements.map(e => ({
        title: e.querySelector('.card-body h3').innerText,
        level: e.querySelector('.card-body .level').innerText,
        url: e.querySelector('.card-footer a').href,
    })));
    console.log(courses2);

    // write to .json
    fs.writeFileSync('courses.json', JSON.stringify(courses), (err) => {
        if (err) throw err;
        console.log('File saved');
    })

    console.log('Check the Terminal for output.')
    await browser.close();
}

run();