const { plugin } = require('puppeteer-with-fingerprints');
const colors = require('colors');

const main = async () => {
    const fingerprint = await plugin.fetch('', {
        tags: ['Microsoft Windows', 'Chrome'],
    });

    plugin.useFingerprint(fingerprint);

    const browser = await plugin.launch({
        headless: false,
        args: ['--window-size=1900,1000']
    })

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

    await page.waitForSelector("#signin", {
        visible: true,
        hidden: false,
    });

    await page.click("#signin");

    await page.waitForTimeout(3000)

    console.log(colors.bold.green("Now it's all good, right?"));

    await page.waitForTimeout(5000);

    await browser.close();
}

main();