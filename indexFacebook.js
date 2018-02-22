"use strict";

const puppeteer = require("puppeteer");
const credentials = require("./credentials.js");


(async () => {

  const browser = await puppeteer.launch({
    executablePath: "./node_modules/chromium/lib/chromium/chrome-linux/chrome-wrapper",
    //executablePath: "./node_modules/chromium/lib/chromium/chrome-linux/chrome_sandbox",
    //executablePath: "./node_modules/chromium/lib/chromium/chrome-linux/chrome",
    //executablePath: "./../../../../../usr/local/lib/node_modules/chromium/lib/chromium/chrome-linux/chrome",
    
    headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://www.facebook.com/').catch(error => console.log(error));
  await page.click("#email");
  await page.keyboard.type(credentials.username);
  await page.click('#pass'); //?? cual es el selector
  await page.screenshot({path: './clicking.png'});
  await page.keyboard.type(credentials.password);
  await page.click('input[type="submit"]');
  await page.screenshot({path: './preLogin.png'});
  await page.waitForNavigation();

  //Now we are logged.
  
  //TODO
  await page.screenshot({path: './hereWeAre.png'});
  await page.click();//"#u_0_5v > div > div._3rh8 > span > label > input"); //input buscar chat
  await page.keyboard.type("NBA");
  await page.keyboard.press("enter");
  await page.waitForNavigation(500);
  await page.click("#u_0_5v > div > div._3rh8 > span > label > input"); //input chat correcto
  await page.screenshot({path: './pruebaChatAbiertoFacebook.png'});
  await page.keyboard.type("hi");
  var timestamp1 = new Date();
  await page.keyboard.press("enter");
  await page.waitForNavigation();
  var timestamp2 = new Date();
  var diferenciaTiempo = timestamp2-timestamp1;
  console.log("tiempo que tarda en responder (milis): " + diferenciaTiempo);
  await page.screenshot({path: './pruebaChatRespuestaFacebook.png'});

  browser.close();


})();


