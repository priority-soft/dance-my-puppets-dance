//import fs from 'fs';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
//import axios from 'axios';  // handle HTTP requests to download images

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// saving all images from a page
// async function downloadImage(url, savePath) {
//     const response = await axios.get(url, { responseType: 'arraybuffer' });
//     fs.writeFileSync(savePath, response.data);
// }

// async function saveImagesFromPage(url, saveDir) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);

//     const imgSrcs = await page.evaluate(() => {
//         return Array.from(document.querySelectorAll('img')).map(img => img.src);
//     });

//     if (!fs.existsSync(saveDir)) {
//         fs.mkdirSync(saveDir);
//     }

//     await Promise.all(imgSrcs.map(async (src, index) => {
//         const savePath = path.join(saveDir, `image${index}.jpg`);
//         await downloadImage(src, savePath);
//     }));

//     await browser.close();
// }

// saveImagesFromPage('https://www.prioritysoft.rs/', './images');


async function run() {
    const browser = await puppeteer.launch({
        headless: 'false'
    })

    const page = await browser.newPage();
    await page.goto('https://www.prioritysoft.rs/');

    // save photos from a page

    const photos = await page.$$eval("img", (imgs) => {
        return imgs.map(x => x.src)
    })

    const subfolder = 'images2';
    await fs.mkdir(path.join(__dirname, subfolder), { recursive: true });

    for (const photo of photos) {
        const imagePage = await page.goto(photo);
        await fs.writeFile(path.join(__dirname, subfolder, photo.split("/").pop()), await imagePage.buffer());
    }

    await browser.close();
}

run();