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
  page.on('console', console.log);
 

  /*for(var i=0;i<5;i++){

    await new Promise(function(resolve,reject){setTimeout(resolve,250)})
    var botName = botsNames.names[i];
    console.log("starting processing bot "+ botName);
    await saveBotDataScript(botName,page);

  }*/ //Node is detached from document (no he conectado la vpn..)
  
  //await checkBotInitialResponse("victoriassecret",page); //correcto.
  
  

  /*for(var i=0;i<10;i++){

    await new Promise(function(resolve,reject){setTimeout(resolve,250)})
    var botName = botsNames.names[i];
    console.log("starting processing bot "+ botName);
    await checkBotInitialResponse(botName,page);

  }*/

   //TODO gestionar correctamente tiempos escucha.

   await checkBotInitialResponse("samsungmobileusa",page);


  //await saveBotDataScript("cnn",page); //TODO debug, por alguna razón se detecta que no responde.
 
  //
  connection.endConnection();
    
  /*
  for(var i=0;i<5;i++){
    await new Promise(function(resolve,reject){setTimeout(resolve,250)})
    var botName = botsNames.names[i];
    await getInitialResponseScreenshot(botName,page);
  }*/

  //correcto.
  /*
  for(var i=0;i<5;i++){
    await new Promise(function(resolve,reject){setTimeout(resolve,250)})
    var botName = botsNames.names[i];
    await getRandomResponseScreenshot(botName,page);
  }*/


  //bilbao correcto. pueblo incorrecto?... 
  
  browser.close(); 
})();


function loginWithUser(userName,userPassword,page){
  return new Promise(function(resolve,reject){
    (async ()=>{

      await Promise.all([
        await page.goto('https://www.messenger.com/login.php'),
        await page.waitForNavigation({timeout:5000}).catch(function(res){console.log("no need to wait on messenger connection.");}) //en pc pueblo no hace falta nunca, aquí a veces.
      ]);
      await page.screenshot({path: "capturaINICIAL.png"});
      await page.click("#email"); //no debe haber ningún usuario ya logeado Y se debe haber cargado el inputText (node is not visible...)
      await page.keyboard.type(userName);
      await page.click('#pass'); 
      await page.keyboard.type(userPassword);

      var response = await Promise.all([
        await page.click('#loginbutton'),
        await page.waitForNavigation({timeout:5000}).catch(function(res){console.log("no need to wait on login.");})
      ]); 
      resolve();
    })();
  });
}

// SOLO PUEDE/DEBE ESTAR UNA CONVERSACIÓN ACTIVA (con un único bot) para usar estas funciones. 
// (trabajamos siempre con un bot, al terminar cerramos su conversación).
 
/**
 * @param  {String} botName - nombre del bot.
 * @param  {Page} page - Puppeteer API Page instance.
 **
 * Guardamos en la tabla bots el id, nombre, y url del bot, y un booleano que indica si este responde al mensaje inicial o no.
 */
function saveBotDataScript(botName,page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      try{
        await botInteractions.startBotConversation(botName,page);
      }catch(e) {
        await botInteractions.writeMessage(page, "hello");
        await page.screenshot({path: "./startConv/"+botName+"-notInitialButton.png"});
      }
      var response = await botInteractions.listenBotResponse(page).catch((err)=>{console.log("error when listening response: "+err);});
      var id = await botInteractions.getIdBot(botName,page).catch(function(err){
        console.log(err);
        reject();
      });
      var isConnected = response.time === 30000 ? 0 : 1; //si se alcanzan los 30 segundos es que el bot no ha respondido.
      await connection.saveBotInfo(id,botName,isConnected,"https://www.messenger.com/t/"+id).catch(()=>{console.log("error when saving basicInfo.")});
      await page.screenshot({path: "./initialResponses/"+botName+"-"+isConnected+".png"});
      if(isConnected){
        var idMessage = await connection.saveMessageSent(id,response.time,"Get Started",false,false);
        for(var responseMessage in response.nodes){ 
          var multimedia = responseMessage.type==="image";
          var emoji = false;
          if(response.emojiFlag){
            emoji = true;
          }
          var message = null;
          if(response.message){
            message = response.message;
          }
          await connection.saveResponse(id,idMessage,multimedia,emoji,false,message);
        }
      }
      await botInteractions.closeCurrentBotConversation(page).catch(()=>{console.log("error when closing bot conversation.")});;
      resolve();
    })();
  });
}
/**
 * @param  {String} botName - nombre del bot.
 * @param  {Page} - Puppeteer API Page instance.
 **
 * Realiza una captura de 
 */
function getInitialResponseScreenshot(botName,page){
 return new Promise(function(resolve,reject){
    (async ()=>{
      var waited = "0";
      try{
        await botInteractions.startBotConversation(botName,page);
      }catch(e) {
        await botInteractions.writeMessage(page, "hello");
        await page.screenshot({path: "./startConv/"+botName+"-notInitialButton.png"});
      }
      await page.waitForNavigation({timeout:5000}).catch(function(res){console.log("no need to wait on starting conversation.");waited = "1";})
      await page.screenshot({path: "./initialResponses/"+botName+"-"+waited+".png"});
      await botInteractions.closeCurrentBotConversation(page).catch(()=>{page.screenshot({path: "./errors/closingErrorG.png"})});;
      resolve();
    })();
  });
}

function getRandomResponseScreenshot(botName,page){
 return new Promise(function(resolve,reject){
    (async ()=>{
      var waited = "0";
      try{
        await botInteractions.startBotConversation(botName,page);
      }catch(e) {
        await botInteractions.writeMessage(page, "hello");
        await page.screenshot({path: "./startConv/"+botName+"-notInitialButton.png"});
      }
      await page.waitForNavigation({timeout:5000}).catch(function(res){console.log("no need to wait on starting conversation.");})
      await botInteractions.writeMessage(page, "MNBLKJFDS123REW098");
      await page.waitForNavigation({timeout:5000}).catch(function(res){console.log("no need to wait on receiving response.");waited = "1";})
      await page.screenshot({path: "./randomMessageSent/"+botName+"-"+waited+".png"});
      await botInteractions.closeCurrentBotConversation(page);
      resolve();
    })();
  });
}




function checkBotInitialResponse(botName,page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      try{
        await botInteractions.startBotConversation(botName,page);
      }catch(e) {
        await botInteractions.writeMessage(page, "hello");
        await page.screenshot({path: "./startConv/"+botName+"-notInitialButton.png"});
      }
      var response = await botInteractions.listenBotResponse(page).catch((err)=>{console.log("error when listening response: "+err);});
      var normalMsgs = response[0];
      var bottomButtons = response[1];
      for(var node in normalMsgs.nodes){
        for(var key in normalMsgs.nodes[node]){
          console.log(normalMsgs.nodes[node][key]);
        }
      }
      for(var node in bottomButtons.nodes){
        console.log(bottomButtons.nodes[node]);
        /*for(var key in bottomButtons.nodes[node]){
          console.log(bottomButtons.nodes[node][key]);
        }*/
      }
      console.log(normalMsgs.time+"&"+bottomButtons.time);
      if(normalMsgs.time === 30000 && bottomButtons.time === 30000){
        await page.screenshot({path: "./checkingInitialResponse/"+botName+"-responded?.png"});
      }
      await botInteractions.closeCurrentBotConversation(page).catch(()=>{console.log("error when closing bot conversation.")});;
      resolve();
    })();
  });
}