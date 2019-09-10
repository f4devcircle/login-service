const puppeteer = require('puppeteer');
const jeketiURL = 'https://jkt48.com/';
const loginURL = 'login?lang=id';


const login = async (email, password) => {
  try {
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--incognito',
        '--disable-web-security',
        '--disable-features=site-per-process',
        '--ignore-certificate-errors',
      ]
    });
    const page = (await browser.pages())[0];
    page.setDefaultTimeout(295000);
    page.on('console', (msg) => console.log(`Chromium console.log : ${msg.text()}`));
    await page.goto(jeketiURL + loginURL);

    await page.type('input#login_id', email);
    await page.type('input#login_password', password);
    const loginButton = (await page.$$('input'))[2];
    await loginButton.click();


    await page.waitForNavigation({
      waitUntil: 'domcontentloaded'
    });


    const error = await checkLoginError(page);

    if (error) {
      throw new Error(error);
    }
    const cookies = await page.cookies();
    console.log(cookies)
    const cookieString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
    return cookieString;
  } catch (e) {
    console.error('error while login')
    console.error(e);
    throw e;
  }
};

const checkLoginError = async (page) => {
  try {
    const element = await page.$('.formRight');
    const message = await page.evaluate(element => element.textContent, element);
    return message.trim();
  } catch (e) {};
}

const close = async (browser) => {
  browser.close();
}



const express = require('express');
const app = express();

app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))


exports.loginService = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    const cookies = await login(email, password);
    res.send({
      cookies
    })
  } catch (e) {
    console.error('error in base function');
    console.error(e);
    res.status(400).send({
      error: e.message
    })
  }
};

app.post('/', this.loginService);
app.listen(80, () => {
  console.log('running')
})