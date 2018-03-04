"use strict";

const puppeteer = require("puppeteer");
const credentials = require("./credentials.js");


(async () => {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.messenger.com/login.php').catch(error => console.log(error));
  //await page.waitForNavigation({timeout: 5000}).catch(error => console.log(error));
  await page.click("#email").catch(error => console.log(error));
  await page.keyboard.type(credentials.username).catch(error => console.log(error));
  await page.click('#pass').catch(error => console.log(error)); 
  await page.keyboard.type(credentials.password).catch(error => console.log(error));
  const [response] = await Promise.all([
    await page.click('#loginbutton').catch(error => console.log(error)),
    await page.waitForNavigation().catch(error => console.log(error))
  ]);

  /*//Now we are logged and we can do:
  var idNBA = 8245623462;
  var idBot = idNBA;
  await page.goto('https://www.messenger.com/t/'+idBot).catch(error => console.log(error));*/

  //get id of certain bot
  //SOLO PUEDE/DEBE ESTAR UNA CONVERSACIÓN ACTIVA. (Como cerrar las demás)


  var botName = "WSL";
  var idBot = await getIdBot(botName,page);
  console.log(idBot);
  await page.screenshot({path: 'conv.png'});
  await closeCurrentBotConversation(page);
  await page.screenshot({path: 'archivedConv.png'});
  /*
  await page.goto('https://www.messenger.com/t/'+botName).catch(error => console.log(error));
  var botonStart = await page.$("a[href='#']:not([tabindex]):not([aria-label])");
  await botonStart.click().catch(error => console.log(error));
  var selectorBot = await page.waitFor("div[id^='row_header_id_user']");
  var idSelector = selectorBot._remoteObject.description.split('#')[1];
  var idBot = idSelector.split(":")[1].split(".")[0];
  console.log(idBot);
  
  */
  browser.close();

})();


////Util methods
function getIdBot(botName,page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      await page.goto('https://www.messenger.com/t/'+botName).catch(error => console.log(error));
      var botonStart = await page.$("a[href='#']:not([tabindex]):not([aria-label])");
      await botonStart.click().catch(error => console.log(error)); //boton de iniciar conversacion, no responde bien cuando está ya iniciada
      var selectorBot = await page.waitFor("div[id^='row_header_id_user']");
      var idSelector = selectorBot._remoteObject.description.split('#')[1];
      var idBot = idSelector.split(":")[1].split(".")[0];
      resolve(idBot);
    })();
  });
}

function closeCurrentBotConversation(page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      var gridCell = await page.$("div[role='gridcell']:not([class])");
      //await selectorBot.hover(); //innecesario
      var divPreButton = await gridCell.$("div[role='button']");
      var botonMenu = await divPreButton.$("div[role='button']"); 
      await botonMenu.click();
      var menuConv = await page.waitFor("div[class='uiContextualLayerPositioner uiLayer']:not([class='hidden_elem'])");
      var actions = await menuConv.$$("li[role='presentation']");
      var archiveConv = actions[1]; //archive index1, delete index2
      await archiveConv.click();
      await page.waitFor(250);
      resolve();
    })();
  });
}

