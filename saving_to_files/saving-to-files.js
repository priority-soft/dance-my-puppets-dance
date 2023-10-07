import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import createCsvWriter from 'csv-writer';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

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



    await browser.close();
}

run();