import puppeteer from "puppeteer";
import * as fs from 'fs';
import * as path from 'path';

export function downloadImagesOfChapter(chapter: number) {
    (async () => {
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await browser.newPage();

        await page.goto('https://onepunchmanscan.com/manga/scan-one-punch-man-chapitre-' + chapter + '-vf/', {waitUntil: 'networkidle0'});

        const dir = path.join(__dirname, 'images');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const chapterDir = path.join(dir, 'chapter-' + chapter);
        if (!fs.existsSync(chapterDir)) {
            fs.mkdirSync(chapterDir);
        }

        const imgs = await page.$$eval("img.aligncenter[src]", (imgs) =>
            imgs.map((img) => img.getAttribute("data-src") || img.getAttribute("src"))
        );

        for (const img of imgs) {
            const viewSource = await page.goto(img);
            if (!viewSource) {
                continue;
            }
            fs.writeFile(chapterDir + "/" + img.split("/").pop(), await viewSource.buffer(), function (err: any) {

            });
        }

        await browser.close();
    })();
}
