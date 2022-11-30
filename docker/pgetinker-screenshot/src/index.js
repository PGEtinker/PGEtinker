const express = require('express');
const app = express();

const host = '0.0.0.0';
const port = 3000;

function error(status, msg)
{
    return {
        status: status,
        msg: msg
    };
}

app.use(express.json());

app.post('/api/screenshot', async (req, res) =>
{
    let args = {};

    if(req.body.url === undefined)
    {
        res.status(400);
        res.send(error(400, 'field [url] required'));
        return;
    }
        
    if(req.body.delay === undefined)
    {
        res.status(400);
        res.send(error(400, 'field [delay] required'));
        return;
    }

    // populate args
    args.url = new URL(req.body.url);
    args.delay = parseInt(req.body.delay);

    const puppeteer = require('puppeteer');

    const sleep = (milliseconds) =>
    {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    
    const config = {
        executablePath: '/usr/bin/google-chrome',
        headless: true,
        args: [
            '--no-sandbox',
            '--use-gl=egl',
        ],
    };
    
    try
    {
        const browser = await puppeteer.launch(config);
        const page = await browser.newPage();
        await page.goto(args.url);
        await sleep(args.delay);
        const screenshot = await page.screenshot({encoding: 'base64'});
        browser.close();
        
        res.status(200);
        res.send({'image-data': `data:image/png;base64,${screenshot}`});
    }
    catch(err)
    {
        res.status(500);
        console.log(err);
    }
});

app.listen(port, host, () =>
{
    console.log(`Running on: http://${host}:${port}`);
});
