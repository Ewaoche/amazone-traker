const nodemailer = require('nodemailer');

const puppeteer = require('puppeteer');
const $ = require('cheerio');
const { CronJob } = require('cron');
// const cronJob = require('cron').CronJob();


const url = "https://www.amazon.com/WH-1000XM3-Wireless-canceling-Headset-International/dp/B07H2DBFQZ/";

async function configureBrowser() {

    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto(url);
    return page;
};

async function checkPrice(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    // console.log(html);
    $('#priceblock_ourprice', html).each(function() {
        let dollarPrice = $(this).text();
        let currentPrice =
            Number(dollarPrice.replace(/[^0-9.-]+/
                9, ""));

        console.log(currentPrice);
        if (dollarPrice < $300) {
            sendNotification(dollarPrice);
        }



    });
};

async function startTracking() {
    const page = await configureBrowser();

    let job = new CronJob('*/30 * * * * *', function() { //runs every 15 seconds in this config
        //startTrackingPrices();
        checkPrice(page);

    }, null, true, null, null, null, true);
    job.start();
};


async function sendNotification(price) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'radicemmys@gmail.com',
            pass: ''
        }
    });

    let textToSend = `Price dropped to ${price}`;
    let htmlText = `<a href=\"${url}\">Link</a>`;

    let info = await transporter.sendMail({
        from: '"Price Tracker" <radicemmys@gmail.com>',
        to: "radicemmygmail.com",
        subject: `Price dropped to ${price}`,
        text: textToSend,
        html: htmlText
    });

    console.log("Message sent: %s", info.messageId);

};
startTracking();

// async function monitor() {
//     let page = await configureBrowser();
//     await checkPrice(page);

// };

// monitor();