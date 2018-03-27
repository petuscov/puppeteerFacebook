"use strict";

const puppeteer = require("puppeteer");
const credentials = require("./credentials.js");
const botInteractions = require("./botInteractions.js");
const botsNames = require("./botsNames.js");
const connection = require("./connectionMySQL.js");
(async () => {

  const browser = await puppeteer.launch({
      executablePath:"./node_modules/chromium/lib/chromium/chrome-linux/chrome",//
      headless: true//
    });
  const page = await browser.newPage(); 
  await loginWithUser(credentials.arrUsers[0].username,credentials.arrUsers[0].password,page);

  for(var i=0;i<5;i++){
    await new Promise(function(resolve,reject){setTimeout(resolve,250)})
    //TODO a veces salta error 'node is detached from document.'
    //TODO revisar cerrado conversaciones (especialmente modal).
    var botName = botsNames.names[i];
    await saveBotDataScript(botName,page);
    //await new Promise(function(resolve,reject){setTimeout(resolve,2000)})
    //await saveInitialResponseTimeScript(botName,page);
  }
  connection.endConnection();
  browser.close();
})();


function loginWithUser(userName,userPassword,page){
  return new Promise(function(resolve,reject){
    (async ()=>{

      await Promise.all([
        await page.goto('https://www.messenger.com/login.php'),
        await page.waitForNavigation({timeout:5000}).catch(function(res){console.log("no need to wait.");}) //en pc pueblo no hace falta nunca, aquí a veces.
      ]);
      await page.screenshot({path: "capturaINICIAL.png"});
      await page.click("#email"); //no debe haber ningún usuario ya logeado Y se debe haber cargado el inputText (node is not visible...)
      await page.keyboard.type(userName);
      await page.click('#pass'); 
      await page.keyboard.type(userPassword);

      var response = await Promise.all([
        await page.click('#loginbutton'),
        await page.waitForNavigation({timeout:5000}).catch(function(res){console.log("no need to wait.");})
      ]); 
      resolve();
    })();
  });
}

//SOLO PUEDE/DEBE ESTAR UNA CONVERSACIÓN ACTIVA para obtener id correcto. (trabajamos siempre con una, al terminar la cerramos).
function saveBotDataScript(botName,connectedPage){
  return new Promise(function(resolve,reject){
    (async ()=>{
      await botInteractions.startBotConversation(botName,connectedPage);
      var id = await botInteractions.getIdBot(botName,connectedPage).catch(function(err){
        console.log(err);
        reject();
      });
      await connection.saveBotInfo(id,botName,1,"https://www.messenger.com/t/"+id,null,null,null);
      await botInteractions.closeCurrentBotConversation(connectedPage);
      resolve();
    })();
  });
}

/*
function saveInitialResponseTimeScript(botName,connectedPage){
  return new Promise(function(resolve,reject){
    (async ()=>{
      await botInteractions.startBotConversation(botName,connectedPage);
      var response = await botInteractions.listenBotResponse(connectedPage);
      await connection.saveResponseTime(id,response.time,1,"Get Started",1,0,response);
      await botInteractions.closeCurrentBotConversation(connectedPage);
      await connectedPage.screenshot({path: './capturasInicio/'+botName+'.png'});
      resolve();

    })();
  });
}*/