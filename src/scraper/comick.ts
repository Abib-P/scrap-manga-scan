import puppeteer from "puppeteer";

// make an object with the manga name and the link to the manga
type Manga = {
    name: string,
    link: string
}

export function searchManga(manga: string) {
    (async () => {
        // const browser = await puppeteer.launch({headless: 'new'});
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.3');
        await page.goto('https://www.comick.io/search', {waitUntil: 'networkidle2'});
        const searchBar = await page.$('input[type="text"]');
        if (!searchBar) {
            console.log("search bar not found");
            return;
        }
        await searchBar?.type(manga);
        await page.waitForTimeout(2000);
        await searchBar?.press('Enter');
        await page.waitForTimeout(2000);


        const mangaListHtml = await page.$$('div.pl-3.flex-1.overflow-hidden > a');
        console.log("mangaList: ", mangaListHtml.length);

        let rightManga: Manga = {name: "", link: ""};
        let actualScore: number = 0;

        for (let mangaHtml of mangaListHtml) {
            const mangaName: string = await mangaHtml.$eval('p.font-bold.truncate', el => el.textContent);
            const mangaLink: string = await mangaHtml.evaluate(el => el.getAttribute('href'));
            const similarityScore: number = similarity(mangaName, manga);
            if (similarityScore > actualScore) {
                rightManga = {name: mangaName, link: mangaLink};
                actualScore = similarityScore;
            }
        }

        console.log("rightManga: ", rightManga);

        await page.goto(`https://www.comick.io${rightManga.link}?lang=en&chap-order=1`, {waitUntil: 'networkidle2'});

        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        console.log("currentUrl: ", currentUrl);

        const html = await page.content();
        pbcopy(html);

        await browser.close();

    })();
}

function pbcopy(data: string) {
    const proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(data);
    proc.stdin.end();
}

function similarity(s1: string, s2: string): number {
    let longer: string = s1;
    let shorter: string = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    let longerLength: number = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs: number[] = [];
    for (let i: number = 0; i <= s1.length; i++) {
        let lastValue: number = i;
        for (let j: number = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
