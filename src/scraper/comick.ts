import puppeteer from "puppeteer";
import * as fs from 'fs';
import * as path from 'path';

export function searchManga(manga: string) {
    (async () => {
        const browser = await puppeteer.launch({headless: 'new'});
        // const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        //await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.3');
        await page.goto('https://www.comick.io/search', {waitUntil: 'networkidle2' });
        const searchBar = await page.$('input[type="text"]');
        if (!searchBar){
            console.log("search bar not found");
            return;
        }
        await searchBar?.type(manga);
        //wait for the search results to load
        await page.waitForTimeout(2000);
        await searchBar?.press('Enter');
        //await page.waitForNavigation({waitUntil: 'networkidle2'}); doesn't work
        await page.waitForTimeout(2000);

        console.log("url: ", page.url());

        //get the html content of the page
        const html = await page.content();
        pbcopy(html);
        console.log("html: ", html);



        await browser.close();

    })();
}

function pbcopy(data: string) {
    var proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(data); proc.stdin.end();
}
