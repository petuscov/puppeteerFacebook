"use strict";
const puppeteer = require("puppeteer");
const helperPuppeteer = require("./_helperPuppeteer.js");

//Si podemos prescindir, mejor.
//const loginAPI = require("facebook-chat-api");
//const helperFacebookChat = require("./_helperFacebookChatAPI.js");

const credentials = require("./package.json").credentials;

const helperMessages = require("./_helperMessages.js");
const io = require("socket.io-client");
const events = require('events');
const WatchJS = require("melanke-watchjs");
const watch = WatchJS.watch;
const unwatch = WatchJS.unwatch;





module.exports = function(eventEmitter){
  module = {};
/**
 * Analyzer that makes use of both facebook-chat-api and puppeteer, 
 * to analyze both text capabilities and visual ones (buttons, images, etc).
 **
 * @param  {string} bot name or id in facebook messenger.
 * @return {object} object with bot data.
 */
  module.analyzeBot = async function (nameOrId,app){
    var data = {
      basicInfo:{
        name: "", 
        id: "",
        likes: "" 
      },
      respond:"",
      messages : [], 
      emojis:{ 
        numYes: 0, 
        numNo: 0 
      },
      multimedia:{ 
        numYes: 0, 
        numNo: 0 
      },
      reviewedFeatures:{
        initialButton:"", 
        initialMsgUseful:"", 
        helpCommand:"", 
        variation:"", //con porcentaje, 3 pruebas diferentes, en random, en hello, en goodbye...
        typosHandled:"", //con porcentaje, 3 pruebas diferentes, en random, en hello, en goodbye...
        buttonEquivalent:"", 
      }
    };
    if(app){ //TODO 4 app.
      var socket = io(app.url);
      watch(data,()=>{
         socket.emit("update",data);
      });
      
    }else{
      if(eventEmitter){//For console script information.
        watch(data,(changes)=>{
          eventEmitter.emit("update",changes);
        });
      }
    }
    var stackInputs = [];
    var stackToButtons;


    const browser = await puppeteer.launch({// parámetros necesarios en linux.
        executablePath:process.env.EXECUTABLE_PATH_PUPPETEER || './node_modules/chromium/lib/chromium/chrome-linux/chrome',
        headless: true
      });
    const page = await browser.newPage(); 

    //page.on('console', console.log);
    page.on('console', (msg)=>{if(msg._text){console.log(msg._text);}else{console.log(msg);}});


    await helperPuppeteer.loginWithUser(process.env.FB_USERNAME,process.env.FB_PASSWORD,page);
    // 1. Cerramos todas las convesaciones existentes que tenga el usuario introducido. (Nos aseguramos de que no tenga ninguna activa)
    await helperPuppeteer.closeAllBotConversations(page); 
    // 2. Pulsamos botón getStarted.
    try{
      await helperPuppeteer.startBotConversation(nameOrId,page);
      data.reviewedFeatures.initialButton = true;
    } catch(err) {
      data.reviewedFeatures.initialButton = false;
      try{
        await helperPuppeteer.writeMessage(page, "Hello"); 
      } catch (err) {
        //Si el nombre o el id era erróneo se ha redireccionado a www.messenger.com y no hay input para texto mensajes.
        browser.close(); 
        console.log("\nbad id or name provided.");
        process.exit(); // No devolvemos objeto data puesto que no se va a guardar nada en BD. nombre era erróneo.
      }
      
    }
    
    // 3. Obtenemos id definitivo, likes, nombre. 
    // (podemos recibir como input tanto nombre del bot como su id, obtener el otro dato y los likes).
    var basicInfo = await helperPuppeteer.getBasicInfo(page);  
    Object.assign(data.basicInfo,basicInfo);
    var response = await helperPuppeteer.listenBotResponse(page);
    if(response[0].time === helperPuppeteer.maxTimeout && response[1].time === helperPuppeteer.maxTimeout){
      browser.close(); 
      console.log("\nBot doesnt respond.");
      data.respond = false;
      return data;
    }
    data.respond = true;
    
    // 4.@ no hacemos uso de facebook-chat-api. 
    // Cerramos conversación, para volverla a iniciarla escuchando la respuesta.
    await helperPuppeteer.closeCurrentBotConversation(page); 

    stackInputs.push("%initialMessage%");
    try{
      await helperPuppeteer.startBotConversation(nameOrId,page);
    } catch (err) {
      await helperPuppeteer.writeMessage(page, "Get started"); 
    }

    response = await helperPuppeteer.listenBotResponse(page);

    var elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    var newMsg = {message: "Get started", time: elapsedTime};
    data.messages.push(newMsg);
  

    //Emojis and Multimedia
    var emoji = helperMessages.containsEmojis(response);
    if(emoji){data.emojis.numYes++}else{data.emojis.numNo++}
    var multimedia = helperMessages.containsMultimedia(response);
    if(multimedia){data.multimedia.numYes++}else{data.multimedia.numNo++}

    // 5. Comprobamos que el mensaje inicial es útil.
    var text = helperMessages.getText(response) || ""; 
    
    var buttons = helperMessages.getButtons(response); 
    var useful = helperMessages.checkInitialMsgUseful(text,buttons);
    data.reviewedFeatures.initialMsgUseful = useful;

    if(buttons.length && !stackToButtons){stackToButtons = stackInputs.slice();}

    // 6. Comprobamos variación respuestas
    
    // 6.1 para hello.
    stackInputs.push("Hello");
    await helperPuppeteer.writeMessage(page, "Hello"); 
    response = await helperPuppeteer.listenBotResponse(page);

    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "Hello", time: elapsedTime};

    data.messages.push(newMsg); // Primer mensaje si que almacenamos su tiempo de respuesta.
    var emoji = helperMessages.containsEmojis(response); //Primer mensaje si que analizamos emojis y multimedia.
    if(emoji){data.emojis.numYes++}else{data.emojis.numNo++}
    var multimedia = helperMessages.containsMultimedia(response);
    if(multimedia){data.multimedia.numYes++}else{data.multimedia.numNo++}

    buttons = helperMessages.getButtons(response); 
    if(buttons.length && !stackToButtons){stackToButtons = stackInputs.slice();}

    text = helperMessages.getText(response) || "";
    
    var variatedHelloRes = [];
    variatedHelloRes.push(text);
    
    await helperPuppeteer.writeMessage(page, "Hello"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    text = helperMessages.getText(response) || "";
    variatedHelloRes.push(text);

    await helperPuppeteer.writeMessage(page, "Hello"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    text = helperMessages.getText(response) || "";
    variatedHelloRes.push(text);

    var variatedResponses = 0;
    variatedResponses = helperMessages.checkVariations(variatedHelloRes) ? ++variatedResponses : variatedResponses;

    // 6.2 para goodbye.
    stackInputs.push("Good bye");
    await helperPuppeteer.writeMessage(page, "Good bye"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "Good bye", time: elapsedTime};
    
    data.messages.push(newMsg); // Primer mensaje si que almacenamos su tiempo de respuesta.
    var emoji = helperMessages.containsEmojis(response); //Primer mensaje si que analizamos emojis y multimedia.
    if(emoji){data.emojis.numYes++}else{data.emojis.numNo++}
    var multimedia = helperMessages.containsMultimedia(response);
    if(multimedia){data.multimedia.numYes++}else{data.multimedia.numNo++}

    buttons = helperMessages.getButtons(response); 
    if(buttons.length && !stackToButtons){stackToButtons = stackInputs.slice();}

    text = helperMessages.getText(response) || "";
    var arrByeRes = [];
    arrByeRes.push(text);
    
    await helperPuppeteer.writeMessage(page, "Good bye"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    text = helperMessages.getText(response) || "";
    arrByeRes.push(text);

    await helperPuppeteer.writeMessage(page, "Good bye"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    text = helperMessages.getText(response) || "";
    arrByeRes.push(text);

    variatedResponses = helperMessages.checkVariations(arrByeRes) ? ++variatedResponses : variatedResponses;
    
    // 6.3 para randomString.
    var randomMsg = helperMessages.randomString(7);
    stackInputs.push(randomMsg);
    await helperPuppeteer.writeMessage(page, randomMsg); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: randomMsg, time: elapsedTime};

    data.messages.push(newMsg); // Como son aleatorios almacenamos tiempos respuesta de todos.
    var emoji = helperMessages.containsEmojis(response); //Como son aleatorios analizamos emojis y multimedia.
    if(emoji){data.emojis.numYes++}else{data.emojis.numNo++}
    var multimedia = helperMessages.containsMultimedia(response);
    if(multimedia){data.multimedia.numYes++}else{data.multimedia.numNo++}

    buttons = helperMessages.getButtons(response); 
    if(buttons.length && !stackToButtons){stackToButtons = stackInputs.slice();}

    text = helperMessages.getText(response) || "";
    var randomMsgsRes = []; // Array que usaremos más adelante.
    randomMsgsRes.push(text);
    
    randomMsg = helperMessages.randomString(7);
    await helperPuppeteer.writeMessage(page, randomMsg); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: randomMsg, time: elapsedTime};
    
    data.messages.push(newMsg);
    var emoji = helperMessages.containsEmojis(response); //Como son aleatorios analizamos emojis y multimedia.
    if(emoji){data.emojis.numYes++}else{data.emojis.numNo++}
    var multimedia = helperMessages.containsMultimedia(response);
    if(multimedia){data.multimedia.numYes++}else{data.multimedia.numNo++}

    text = helperMessages.getText(response) || "";
    randomMsgsRes.push(text);

    randomMsg = helperMessages.randomString(7);
    await helperPuppeteer.writeMessage(page, randomMsg); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: randomMsg, time: elapsedTime};
    
    data.messages.push(newMsg);
    var emoji = helperMessages.containsEmojis(response); //Como son aleatorios analizamos emojis y multimedia.
    if(emoji){data.emojis.numYes++}else{data.emojis.numNo++}
    var multimedia = helperMessages.containsMultimedia(response);
    if(multimedia){data.multimedia.numYes++}else{data.multimedia.numNo++}

    text = helperMessages.getText(response) || "";
    randomMsgsRes.push(text);

    variatedResponses = helperMessages.checkVariations(randomMsgsRes) ? ++variatedResponses : variatedResponses;

    var percentageVariations = (variatedResponses/3)*100;
    data.reviewedFeatures.variation = percentageVariations.toFixed(2);

    // 7. Comprobamos ayuda existente y útil.
    stackInputs.push("Help");
    await helperPuppeteer.writeMessage(page, "Help"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "Help", time: elapsedTime};
    data.messages.push(newMsg);
    text = helperMessages.getText(response) || "";
    var variatedHelpRes = [];
    variatedHelpRes.push(text);

    buttons = helperMessages.getButtons(response);
    if(buttons.length && !stackToButtons){stackToButtons = stackInputs.slice();}

    useful = helperMessages.checkHelpCommandUseful(text,randomMsgsRes,buttons);
    data.reviewedFeatures.helpCommand = useful;

    // 8. Comprobamos variación inputs
    
    // 8.1 para hello.
    await helperPuppeteer.writeMessage(page, "Helo"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "Helo", time: elapsedTime};
    data.messages.push(newMsg); 

    text = helperMessages.getText(response) || "";
    var variatedInRes = [];
    variatedInRes.push(text);
    
    await helperPuppeteer.writeMessage(page, "Hell0"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "Hell0", time: elapsedTime};
    data.messages.push(newMsg);

    text = helperMessages.getText(response) || "";
    variatedInRes.push(text);

    await helperPuppeteer.writeMessage(page, "Hii"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "Hi", time: elapsedTime};
    data.messages.push(newMsg);

    text = helperMessages.getText(response) || "";
    variatedInRes.push(text);

    var admitTypos = 0;
    admitTypos = helperMessages.checkAdmitsTypos(variatedInRes,variatedHelloRes) ? ++admitTypos : admitTypos;

    // 8.2 para goodbye.
    await helperPuppeteer.writeMessage(page, "G00d bye"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "Good bye", time: elapsedTime};
    data.messages.push(newMsg); 

    text = helperMessages.getText(response) || "";
    var variatedByeRes = [];
    variatedByeRes.push(text);
    
    await helperPuppeteer.writeMessage(page, "Goodbye"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    text = helperMessages.getText(response) || "";
    variatedByeRes.push(text);

    await helperPuppeteer.writeMessage(page, "byee"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    text = helperMessages.getText(response) || "";
    variatedByeRes.push(text);

    admitTypos = helperMessages.checkAdmitsTypos(variatedByeRes,arrByeRes) ? ++admitTypos : admitTypos;

    // 8.3 para help.
    await helperPuppeteer.writeMessage(page, "help"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "help", time: elapsedTime};
    data.messages.push(newMsg); 

    text = helperMessages.getText(response) || "";
    var helpMsgsRes = []; // Array que usaremos más adelante.
    helpMsgsRes.push(text);
    
    await helperPuppeteer.writeMessage(page, "Halp"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "Halp", time: elapsedTime};
    data.messages.push(newMsg);

    text = helperMessages.getText(response) || "";
    helpMsgsRes.push(text);

    await helperPuppeteer.writeMessage(page, "helpp"); 
    response = await helperPuppeteer.listenBotResponse(page); 
    elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
    newMsg = {message: "helpp", time: elapsedTime};
    data.messages.push(newMsg);

    text = helperMessages.getText(response) || "";
    helpMsgsRes.push(text);

    admitTypos = helperMessages.checkAdmitsTypos(helpMsgsRes,variatedHelpRes) ? ++admitTypos : admitTypos;
    var percentageAdmitedTypos = (admitTypos/3)*100;
    data.reviewedFeatures.typosHandled = percentageAdmitedTypos.toFixed(2);

    // 9. Comparaciones pulsación boton envio texto.
    if(!stackToButtons){
      data.reviewedFeatures.buttonEquivalent = false;//thinking in db storage. //"No button detected.";
    }else{
      // 9.1.1 Búsqueda botón (para pulsación).
      var copyOfStack = stackToButtons.slice();
      var found = false;
      for(;copyOfStack.length && !found;){
        var message = copyOfStack.shift();
        if(message==="%initialMessage%"){
          // Cerramos conversación, para volverla a iniciarla escuchando la respuesta.
          await helperPuppeteer.closeCurrentBotConversation(page); 
          try{
            await helperPuppeteer.startBotConversation(nameOrId,page);
          } catch (err) {
            await helperPuppeteer.writeMessage(page, "Get started");
          }
        }else{
          await helperPuppeteer.writeMessage(page, message);
        }
        var response = await helperPuppeteer.listenBotResponse(page); 
        buttons = helperMessages.getButtons(response); 
        if(buttons.length){
          found = true;
        }
      }
      // 9.1.2 Pulsación botón. (el primero de los disponibles.)
      if(found){
        var buttons = await helperMessages.getButtons(response); 
        //console.log(buttons);
        var button = buttons[0];//cogemos el primero de los disponibles.
        var pathToButton = button.path;
        await page.click(pathToButton);
        var response = await helperPuppeteer.listenBotResponse(page); 
        var messageButtonPressed = helperMessages.getText(response) || "";
        //console.log("response: "+response);
      }
      // 9.2.1 Búsqueda botón. (para escritura mensaje.)
      var copyOfStack = stackToButtons.slice();
      var found = false;
      for(;copyOfStack.length && !found;){
        var message = copyOfStack.shift();
        if(message==="%initialMessage%"){
          // Cerramos conversación, para volverla a iniciarla escuchando la respuesta.
          
          //await page.screenshot({path: "./GUETTA-IMPORTANT.png"});
          try{
            await helperPuppeteer.closeCurrentBotConversation(page); 
          } catch (e) {
            console.log("err"+e);
            var mouse = page.mouse;
            await mouse.click(0,0);
            await helperPuppeteer.closeCurrentBotConversation(page);
          }
          try{
            await helperPuppeteer.startBotConversation(nameOrId,page);
          } catch (err) {
            await helperPuppeteer.writeMessage(page, "Get started");
          }
        }else{
          await helperPuppeteer.writeMessage(page, message);
        } 
        var response = await helperPuppeteer.listenBotResponse(page); 
        buttons = helperMessages.getButtons(response); 
        if(buttons.length){
          found = true;
        }
      }
      // 9.2.2 Escritura mensaje. (el primero de los disponibles.)
      if(found){
        var buttons = await helperMessages.getButtons(response); 
        var button = buttons[0];//cogemos el primero de los disponibles.
        var buttonText = button.message;
        await helperPuppeteer.writeMessage(page, buttonText);
        var response = await helperPuppeteer.listenBotResponse(page); 
        var messageButtonTextTyped = helperMessages.getText(response) || "";
      }
      
      data.reviewedFeatures.buttonEquivalent = messageButtonTextTyped===messageButtonPressed;

    }

    await delay(3000);
    
    
    browser.close(); 

    return data;
    
  };

  return module;


}




function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}





