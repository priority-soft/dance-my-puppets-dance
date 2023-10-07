const fs = require('fs');

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

// headless: false - opens the browser
puppeteer.launch({ headless: false }).then(async browser => {
    const page = await browser.newPage()
    await page.setViewport({ width: 800, height: 600 })

    console.log(`Testing adblocker plugin..`)
    await page.goto('https://www.vanityfair.com')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'adblocker.png', fullPage: true })

    console.log(`Testing the stealth plugin..`)
    await page.goto('https://bot.sannysoft.com')
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'stealth.png', fullPage: true })

    console.log(`All done, check the screenshots.`)
    await browser.close()
})