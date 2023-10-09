import puppeteer from "puppeteer";
import colors from 'colors';

const main = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1900,1000']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1900, height: 1000 });
    await page.goto("https://my.asos.com");

    await page.waitForTimeout(3000)

    await page.waitForSelector("#EmailAddress", {
        visible: true,
        hidden: false,
    });
    await page.type(
        "#EmailAddress",
        "..." // your email here
    );

    await page.waitForTimeout(2600)

    await page.waitForSelector("#Password", {
        visible: true,
        hidden: false,
    });
    await page.type(
        "#Password",
        "..." // your pass here
    );

    await page.waitForTimeout(2000)

    await page.click("#signin");

    await page.waitForTimeout(3000)

    console.log(colors.bold.red("You probably got the message: Access Denied. You don't have permission to access http://my.asos.com/identity/login? on this server."));

    console.log(colors.bold.yellow("That's why we should use puppeteer-with-fingerprints"));
    console.log(colors.bold.bgYellow("Now run the file with-fingerprints.js"));

    await page.waitForTimeout(5000);

    await browser.close();
}

main();