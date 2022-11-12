require('dotenv').config();

function App()
{
    if(process.argv.length != 3)
        return;

    const slug = process.argv[2];
    const url  = `${process.env.APP_URL}/embed/${slug}`;
    const img  = `./public/data/${slug}.png`;
    
    const puppeteer = require('puppeteer');

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    
    async function run () {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        await sleep(2000)
        await page.screenshot({path: img});
        browser.close();
    }
    
    run();
}

App();
