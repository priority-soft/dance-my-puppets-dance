const fs = require('fs');

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

//headless: false - opens the browser
puppeteer.launch({
    headless: false,
    args: ['--start-fullscreen', '--window-size=1900,1000'],
}).then(async browser => {
    const page = await browser.newPage()
    await page.setViewport({ width: 1900, height: 1000 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3')

    //go to upwork
    await page.goto('https://www.upwork.com/')
    await page.waitForTimeout(5000)

    //accept cookies
    await page.waitForSelector('#onetrust-accept-btn-handler')
    await page.click('#onetrust-accept-btn-handler')
    await page.waitForTimeout(2000)

    //go to login
    await page.waitForSelector('#nav-main > div > a.up-n-link.nav-item.login-link.d-none.d-md-block.px-6x')
    await page.click('#nav-main > div > a.up-n-link.nav-item.login-link.d-none.d-md-block.px-6x')
    await page.waitForNavigation()

    //login credits
    await page.type("#login_username", "")  //add your username
    await page.waitForTimeout(2310)
    await page.click('#login_password_continue')
    await page.waitForTimeout(5000)
    await page.type("#login_password", "")  //add your password
    await page.click('#login_control_continue')
    await page.waitForTimeout(3000)

    console.log(`All done, closing browser.`)
    await browser.close()
})