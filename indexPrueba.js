"use strict";

const puppeteer = require("puppeteer");



(async () => {

  const browser = await puppeteer.launch(
  {
    executablePath:"./node_modules/chromium/lib/chromium/chrome-linux/chrome",
    headless: true
  }
  ).catch(function(err){console.log(err); process.exit(1);});
  const page = await browser.newPage().catch(function(err){console.log(err);process.exit(1);});
  await page.goto('https://www.google.es/').catch(function(err){console.log(err);process.exit(1);});
  console.log("URL: "+ page.url());

  await page.click(".gsfi[value]").catch(function(err){console.log(err);process.exit(1);});
  await page.keyboard.type("facebook").catch(function(err){console.log(err);process.exit(1);});
 

  await page.click('input[type="submit"][jsaction="sf.chk"]').catch(function(err){console.log(err);process.exit(1);});
  await page.waitForNavigation({timeout: 5000}).catch(function(err){console.log(err);process.exit(1);});
  var enlacesBusqueda = await page.$$(".r").catch(function(err){console.log(err);process.exit(1);});
  var enlaceAPulsar = await enlacesBusqueda[1].$("a").catch(function(err){console.log(err);process.exit(1);});
  await enlaceAPulsar.click().catch(function(err){console.log(err);process.exit(1);});
  
  await page.waitForNavigation({timeout: 5000}).catch(function(err){console.log(err);process.exit(1);});
  await page.screenshot({path: './pruebaBúsqueda2.png'}).catch(function(err){console.log(err);process.exit(1);});
  browser.close();
  //mucho más sencillo ir directamente a facebook, pero es una prueba.

})();


