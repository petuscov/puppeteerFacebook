"use strict";

const puppeteer = require("puppeteer");
const credentials = require("./credentials.js");
const botInteractions = require("./botInteractions.js");
const botsNames = require("./botsNames.js");
//const connection = require("./connectionMySQL.js");
const parser = require("./parser.js");
(async () => {

  const browser = await puppeteer.launch({
      executablePath:"./node_modules/chromium/lib/chromium/chrome-linux/chrome",//
      headless: true//
    });
  const page = await browser.newPage(); 
  await loginWithUser(credentials.arrUsers[0].username,credentials.arrUsers[0].password,page);
  //page.on('console', console.log);
  var today = new Date(); 
  var timestampDay = ""; timestampDay=timestampDay+today.getFullYear();
  timestampDay=timestampDay+"-"+(today.getMonth()+1);
  timestampDay=timestampDay+"-"+today.getDate();

//parser. TODO-> actualizar base de datos (resetearla o alter y añadir columnas.).
//await parser.parseBotInfo("https://chatbottle.co/bots/maroon-5-for-messenger",browser);
//TODO exportar a fichero 100 bots más populares (retocar un poco, hay 5 huaweys, etc.).
//y procesar con parser (obtener sus ids en messenger).

/*--------------------------*/

  /*for(var i=0;i<5;i++){

    await new Promise(function(resolve,reject){setTimeout(resolve,250)})
    var botName = botsNames.names[i];
    console.log("starting processing bot "+ botName);
    await saveBotDataScript(botName,page);

  }*/ //Node is detached from document (no he conectado la vpn..)
  
 
  
  

  /*for(var i=0;i<10;i++){

    await new Promise(function(resolve,reject){setTimeout(resolve,250)})
    var botName = botsNames.names[i];
    console.log("starting processing bot "+ botName);
    await checkBotInitialResponse(botName,page);

  }*/

  //TODO gestionar correctamente tiempos escucha.
  //
  //USO DE BD, POSPONER.
  //await saveBotDataScript("cnn",page);

  //TODO bottombuttons??
  


  //await checkBotInitialResponse("victoriassecret",page); //TODO en teoria fixeado, comprobar a fondo con vicsec y resto bots.



  await checkBotInitialResponse("cnn",page); //TODO debug, bottom buttons no.
  //Ok, let's get started. Here are some options REPETIDO...
  //
  //Bottom buttons still a problem with vicsec y cnn... a veces ok, otras veces no en vicsec. ok con conversacion iniciada.
  //
  //connection.endConnection();
    

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
      //await page.screenshot({path: "capturaINICIAL.png"});
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
      var response = await botInteractions.listenBotResponse(page).catch((err)=>{console.log("error when listening initial response: "+err);reject();return;});
      //TODO fix bottom buttons for cnn.
      var id = await parser.getIdBot(page).catch(function(){
        reject();
        return;
      });
      var likes = await parser.getBotLikes(page).catch(function(){
        reject();
        return;
      });
      var isConnected = response[0].time === 30000 && response[1].time === 30000 ? 0 : 1; //si se alcanzan los 30 segundos es que el bot no ha respondido.
      var botInfo = {
        name: botName,
        connect: isConnected, 
        url:"https://www.messenger.com/t/"+id
      };
      //await connection.saveBotInfo(id,botInfo).catch(()=>{console.log("error when saving basicInfo.")});
      console.log(botInfo);
      await page.screenshot({path: "./initialResponses/"+botName+"-"+isConnected+".png"});
      if(isConnected){
        var lowerTime = response[0].time<response[1].time ? response[0].time : response[1].time;
        //var idMessage = await connection.saveMessageSent(id,lowerTime,"Get Started",false,false); //TODO incorrect decimal value undefined for column timeuntilresponse.
        
        //TODO asegurarnos de que hay (o no) bots funcionales sin el botón inicial.
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
          //await connection.saveResponse(id,idMessage,multimedia,emoji,false,message);
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



//TODO!! startBotConversation con conversación iniciada puede hacer que se pulse un botón existente previo de la conversación.
function checkBotInitialResponse(botName,page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      try{
        await botInteractions.startBotConversation(botName,page);
      }catch(e) {
        await botInteractions.writeMessage(page, "hello");
        await page.screenshot({path: "./startConv/"+botName+"-notInitialButton.png"});
        console.log(botName+" doesnt have initial button. Maybe is not a bot anymore or wrong name.");
        console.log("Screenshot saved to './startConv/"+botName+"-notInitialButton.png'.");
        //TODO cuando tenga el script para procesar muchos bots (y tener muchos que mirar) mirar a ver si hay alguno que no tenga botón inicial.
      }
      try{
        var response = await botInteractions.listenBotResponse(page);
      }catch (e){
        await page.screenshot({path: "./errors/"+botName+".png"});
        reject("error when listening to bot "+botName+". Screenshot saved: /errors/"+botName+".png");
        return;
      }
      if(!response){reject("error while listening response ("+botName+").");return;} //reject doesnt stop execution.
      var normalMsgs = response[0];
      var bottomButtons = response[1];
      for(var node in normalMsgs.nodes){
        for(var key in normalMsgs.nodes[node]){
          console.log(normalMsgs.nodes[node][key]);
        }
      }
      for(var node in bottomButtons.nodes){
        //console.log(bottomButtons.nodes[node]);
        for(var key in bottomButtons.nodes[node]){
          if(key!=="path"){
            console.log(bottomButtons.nodes[node][key]);  
          }
        }
      }
      console.log(normalMsgs.time+"&"+bottomButtons.time);
      if(normalMsgs.time === 15000 && bottomButtons.time === 15000){
        await page.screenshot({path: "./checkingInitialResponse/"+botName+"-responded?.png"});
        reject("bot didnt responded to initial message sent to it. Screenshot saved: /checkingInitialResponse/"+botName+"-responded?.png");
        return;
      }
      await botInteractions.closeCurrentBotConversation(page).catch(()=>{console.log("error when closing bot conversation.")});;
      resolve({messages: normalMsgs, bottomButtons: bottomButtons});
    })();
  });
}