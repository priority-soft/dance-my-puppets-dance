import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import createCsvWriter from 'csv-writer';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { PDFDocument, rgb } from 'pdf-lib';
import xlsx from 'xlsx';

async function run() {
    const browser = await puppeteer.launch({
        headless: 'false'
    })

    const page = await browser.newPage()
    await page.goto('https://priority-soft.webflow.io/')

    // txt
    await page.waitForSelector("#team .w-layout-vflex");

    const data = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#team .w-layout-vflex")).map(member => ({
            name: member.querySelector('h1').textContent,
            role: member.querySelector('p strong').textContent,
            description: member.querySelectorAll('p')[1].textContent,
        }));
    });

    const formattedData = data.map(person => `Name: ${person.name}\nRole: ${person.role}\nJob description: ${person.description}`).join("\n\n");

    await fs.writeFile("our-team.txt", formattedData);
    // end of txt

    // csv
    // note: npm install csv-writer docx pdf-lib excel4node
    const title = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#w-node-_72b8af2d-5524-9ad8-95e6-936ff7033a26-178d6bf1 > h2")).map(x => x.textContent)
    })

    const description = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#w-node-_72b8af2d-5524-9ad8-95e6-936ff7033a26-178d6bf1 > p")).map(x => x.textContent)
    })

    const csvWriter = createCsvWriter.createObjectCsvWriter({
        path: 'what-do-you-get.csv',
        header: [
            { id: 'desc', title: title },
        ]
    });

    const records = description.map(desc => ({ desc }));
    csvWriter.writeRecords(records);
    // end of csv

    // word
    const testimonials = await page.evaluate(() => {
        const safeTextContent = (element) => {
            return element ? element.textContent : 'N/A';
        };

        return Array.from(document.querySelectorAll(".testimonial-card-footer")).map(card => {
            const nameElement = card.querySelector(".w-layout-vflex > div > strong");
            const roleElement = card.querySelector(".w-layout-vflex > div:nth-child(2)");
            const websiteElement = card.querySelector(".w-layout-vflex a");
            const reviewElement = card.querySelector("p em");

            const name = safeTextContent(nameElement);
            const role = safeTextContent(roleElement);
            const website = safeTextContent(websiteElement);
            const review = safeTextContent(reviewElement);

            return { name, role, website, review };
        });
    });

    const sections = testimonials.map(t => ({
        properties: {},
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Name: ${t.name}`,
                        bold: true,
                        color: '7c264b',
                        font: 'Arial',
                        size: 28,
                    }
                    ),
                    new TextRun({
                        text: `Who dat: ${t.role}`,
                        color: '7a4e71',
                        font: 'Arial',
                        size: 24,
                        break: 2
                    }),
                    new TextRun({
                        text: `Website: ${t.website}`,
                        color: 'fd5e87',
                        font: 'Arial',
                        size: 24,
                        break: 2
                    }),
                ],
                alignment: AlignmentType.LEFT,
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Review: ${t.review}`,
                        italic: true,
                        color: '392f38',
                        font: 'Arial',
                        size: 24,
                        break: 2
                    }),
                ],
                alignment: AlignmentType.JUSTIFIED,  // Justify this paragraph
            }),
        ],
    }));

    const doc = new Document({ sections });
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile("testimonials.docx", buffer);
    // end of word

    // pdf
    // screenshot of a page
    await page.pdf({ path: 'screenshotPdf.pdf', format: 'A4' });

    // data scraping
    let ourServices = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".service")).map(service => {
            const heading = service.querySelector("h1.heading").textContent;
            const subheading = service.querySelector("h3 strong").textContent;
            const description = service.querySelector("div > div:last-child").textContent;
            return { heading, subheading, description };
        });
    });

    // pdf from scraped data
    async function createPDF(ourServices) {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        const padding = 50;

        const maxWidth = width - 2 * padding;

        let y = height - padding;

        for (const service of ourServices) {
            const descriptionLines = insertLineBreaks(service.description);

            page.drawText(service.heading, {
                x: padding,
                y: y,
                size: 20,
                color: rgb(0, 0, 0.3)
            });
            y -= 30;

            page.drawText(service.subheading, {
                x: padding,
                y: y,
                size: 16,
                color: rgb(0.5, 0.5, 0.6)
            });
            y -= 25;

            // space for all lines in description
            if (y - (descriptionLines.length * 14) < padding) {
                // new page if the text does not fit vertically
                const page = pdfDoc.addPage();
                y = height - padding;
            }

            for (const line of descriptionLines) {
                page.drawText(line, {
                    x: padding,
                    y: y,
                    size: 12,
                    color: rgb(0.3, 0.1, 0.2),
                    maxWidth: maxWidth
                });
                y -= 14;
            }

            // space between different services
            y -= 40;
        }

        const pdfBytes = await pdfDoc.save();
        await fs.writeFile('ourServices.pdf', pdfBytes);
    }

    function insertLineBreaks(str, maxLen = 80) {
        const words = str.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            if (currentLine.length + words[i].length + 1 < maxLen) {
                currentLine += ' ' + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);
        return lines;
    }
    await createPDF(ourServices);
    // end of pdf

    // json
    async function saveDataAsJson(data, filename) {
        try {
            await fs.writeFile(filename, JSON.stringify(data, null, 2)); // 4 spaces of indentation
            console.log(`Data saved to ${filename}`);
        } catch (err) {
            console.error('Error saving data:', err);
        }
    }

    await saveDataAsJson(ourServices, 'ourServices.json');
    // end of json

    // excel
    async function saveDataAsExcel(data, filename) {
        try {
            const ws = xlsx.utils.json_to_sheet(data);

            // create a new workbook and add a worksheet to it
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, "Our Services");

            // write workbook to disk
            xlsx.writeFile(wb, filename);
            console.log(`Data saved to ${filename}`);
        } catch (err) {
            console.error('Error saving data:', err);
        }
    }

    await saveDataAsExcel(ourServices, 'ourServices.xlsx');
    // end of excel

    await browser.close();
}

run();