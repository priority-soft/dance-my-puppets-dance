import puppeteer from "puppeteer";
import fs from 'fs';

async function getSourceCode(url, output) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url);

        const sourceCode = await page.content();

        fs.writeFileSync(output, sourceCode, "utf-8");

        await browser.close();
    }
    catch (error) {
        console.error("Getting source code failed.");
    }
}

await getSourceCode("https://www.prioritysoft.rs/", "sourceCode.html");