const fs = require('fs/promises')
const puppeteer = require('puppeteer')
const cron = require("node-cron")


async function run() {
    const browser = await puppeteer.launch({
        headless: 'false'
    })

    const page = await browser.newPage()
    await page.goto('https://learnwebcode.github.io/practice-requests/')

    // write to file
    const colors = ['red', 'orange', 'yellow', 'blue']
    await fs.writeFile('colors.txt', colors.join("\r\n"))

    const names = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".info strong")).map(x => x.textContent)
    })
    await fs.writeFile("names.txt", names.join("\t"))

    // click button
    await page.click("#clickme")
    const clickedData = await page.$eval("#data", el => el.textContent)
    console.log(clickedData)
    // input text in a field
    await page.type("#ourfield", "blue")
    await Promise.all([page.click("#ourform button"), page.waitForNavigation()])
    const info = await page.$eval("#message", el => el.textContent)

    console.log(info)

    // save photos from a page
    const photos = await page.$$eval("img", (imgs) => {
        return imgs.map(x => x.src)
    })

    for (const photo of photos) {
        const imagepage = await page.goto(photo)
        await fs.writeFile(photo.split("/").pop(), await imagepage.buffer())
    }

    await browser.close();
}

//run();
//setInterval(run, 5000)

// schedule run with a cron job
cron.schedule("*/5 * * * * *", run)