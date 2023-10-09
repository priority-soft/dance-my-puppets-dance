import puppeteer from "puppeteer-extra";
import fs from "fs/promises";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import colors from 'colors';

puppeteer.use(StealthPlugin())

puppeteer.launch({
    headless: false,
    args: ['--window-size=1900,1000']
}).then(async browser => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1900, height: 1000 });
    await page.goto("https://accounts.google.com/signin/v2/identifier");
    await page.waitForTimeout(2500)

    await page.type("#identifierId", "..."); // your email here
    await page.click("#identifierNext");
    await page.waitForTimeout(3000)

    await page.waitForSelector("#password", {
        visible: true,
        hidden: false,
    });
    await page.type(
        "#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input",
        "..." // your pass here
    );
    await page.waitForTimeout(4000)

    await page.click("#passwordNext > div > button");

    await page.waitForTimeout(3000)


    //save cookies
    try {
        const cookies = await page.cookies();
        await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
        //console.log(cookies);

    } catch (error) {
        console.error('Error writing cookies file:', error);
    }
    await page.waitForTimeout(3000)

    //load cookies
    const cookiesString = await fs.readFile("./cookies.json");
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);

    await page.waitForTimeout(2000)
    const page2 = await browser.newPage();
    await page.waitForTimeout(2500)
    await page2.goto("https://google.com");
    console.log(colors.bold.green("You can see in the upper right corner that you are logged in."));

    await page.waitForTimeout(10000)
    await browser.close();
})