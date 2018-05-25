"use strict";
const puppeteer = require("puppeteer");
const helperPuppeteer = require("./_helperPuppeteer.js");

//Si podemos prescindir, mejor.
//const loginAPI = require("facebook-chat-api");
//const helperFacebookChat = require("./_helperFacebookChatAPI.js");

const credentials = require("./credentials.js");
const helperMessages = require("./_helperMessages.js");



/**
 * Analyzer that makes use of both facebook-chat-api and puppeteer, 
 * to analyze both text capabilities and visual ones (buttons, images, etc).
 **
 * @param  {string} bot name or id in facebook messenger.
 * @return {object} object with bot data.
 */
async function analyzeBot(nameOrId){
  var data = {
    basicInfo:{//V
      "name": "", 
      "id": "",
      "likes": "" 
    },
    messages : [], //~
    "emojis":{ //~
      "numYes": 0, //~
      "numNo": 0 //~
    },
    "multimedia":{ //~
      "numYes": 0, //~
      "numNo": 0 //~
    },
    "reviewedFeatures":{
      "initialButton":false, //V
      "initialMsgUseful":false, //~
      "helpCommand":false, //~
      "variation":"", //~ con porcentaje, 3 pruebas diferentes, en random, en hello, en goodbye...
      "typosHandled":"", //~ con porcentaje, 3 pruebas diferentes, en random, en hello, en goodbye...
      "buttonEquivalent":false, //TODO

      //"admitsAudioInput":false, grabar un mensaje diciendo hello y comparar con random input. // podría ser interesante, pero intervienen factores puesto que hay que grabar con micro, notificaciones, etc....TODO indicar de cara a trabajo futuro.
    }
  };
  var stackInputs = [];
 
  const browser = await puppeteer.launch({
      executablePath:"./node_modules/chromium/lib/chromium/chrome-linux/chrome",//
      headless: true//
    });
  const page = await browser.newPage(); 

  //page.on('console', console.log);
  page.on('console', (msg)=>{console.log(msg._text);});

  await helperPuppeteer.loginWithUser(credentials.arrUsers[0].username,credentials.arrUsers[0].password,page);
  // 1. Cerramos todas las convesaciones existentes que tenga el usuario introducido. (Nos aseguramos de que no tenga ninguna activa)
  await helperPuppeteer.closeAllBotConversations(page); 
  // 2. Pulsamos botón getStarted.
  try{
    await helperPuppeteer.startBotConversation(nameOrId,page);
    data.reviewedFeatures.initialButton = true;
  } catch(err) {
    await page.screenshot({path: "./startConv/"+nameOrId+"-notInitialButton.png"}); //temporal.
    data.reviewedFeatures.initialButton = false;
    try{
      await helperPuppeteer.writeMessage(page, "Hello"); 
    } catch (err) {
      //Si el nombre o el id era erróneo se ha redireccionado a www.messenger.com y no hay input para texto mensajes.
      console.log("bad id or name provided.");
      return 1;
    }
    
  }
  // 3. Obtenemos id definitivo, likes, nombre. 
  // (podemos recibir como input tanto nombre del bot como su id, obtener el otro dato y los likes).
  var basicInfo = await helperPuppeteer.getBasicInfo(page);  
  Object.assign(data.basicInfo,basicInfo);

/*
  // 4. Cerramos conversación, para volverla a iniciarla una vez tengamos facebook-chat-api conectado.
  await helperPuppeteer.closeCurrentBotConversation(page);

  await new Promise(async function(resolve,reject){
    //nos logeamos a traves de facebook-chat-api
    loginAPI({email: credentials.arrUsers[0].username, password: credentials.arrUsers[0].password}, async (err, api) => {
      if(err) return console.error(err);
      
      var botId = data.basicInfo.id; 

      //5. Volvemos a iniciar conversación con bot pero esta vez escuchando con facebook-chat-api.
      var time = new Date();
      try{
        await helperPuppeteer.startBotConversation(nameOrId,page);
      } catch (err) {
        await helperPuppeteer.writeMessage(page, "Get started"); 
      }

      api.listen((err, event) => {  
        if (err) {
          console.log("err: "+err);
        } else if (event.type === 'message') {
          if (event.body) {
            var elapsedTime = (new Date() -time)/1000; 
            var newMsg = {message: "Get started", time: elapsedTime};
            data.messages.push(newMsg);
            console.log("message and body");
            setTimeout(function(){
              resolve;
            },3000);
          }else{
            console.log("template."); //no tiene por qué que corresponderse con la template.
          }
        } else {
          console.log("Ignored. Event type unhandled: "+ event.type);
          console.log("Maybe multimedia messages number should be updated?");
        }
        //TODO y si entra una plantilla como con dominos? supongo que se quedará con contenido de la plantilla.
        //pero no analizamos botones... como detectamos botones?... con pupeteer e ignorar tiempo (sólo con facebookChatAPI.)
      });
      
    });
    
  });
*/


  // 4.@ no hacemos uso de facebook-chat-api. 
  // Cerramos conversación, para volverla a iniciarla escuchando la respuesta.
  await helperPuppeteer.closeCurrentBotConversation(page); 

  stackInputs.push("%initialMessage%");
  try{
    await helperPuppeteer.startBotConversation(nameOrId,page);
  } catch (err) {
    //await page.screenshot({path: "./PLEASE.png"});
    await helperPuppeteer.writeMessage(page, "Get started");//"Get started"); 
  }
  //TODO TESTEANDO LISTEN.
  var response = await helperPuppeteer.listenBotResponse(page);

  //console.log(response); OK
  

  var elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  var newMsg = {message: "Get started", time: elapsedTime};
  data.messages.push(newMsg);
  
  


  //Emojis and Multimedia
  var emoji = helperMessages.containsEmojis(response);
  if(emoji){data.emojis.numYes++}else{data.emojis.numNo++}
  var multimedia = helperMessages.containsMultimedia(response);
  if(multimedia){data.multimedia.numYes++}else{data.multimedia.numNo++}

  //console.log(data.messages); //OK
  
  /*console.log("emojis:"); //OK
  console.log(data.emojis);
  console.log("multimedia:");
  console.log(data.multimedia);*/
  
  /*var normalMsgs = response[0]; //OK
  var bottomButtons = response[1];
  for(var node in normalMsgs.nodes){
    for(var index in normalMsgs.nodes[node]){
      var objectInformation = normalMsgs.nodes[node][index];
      for(var key in objectInformation){
        if(key!=="path"){
          console.log(objectInformation[key]);
        }
      }
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
  */
 
  // 5. Comprobamos que el mensaje inicial es útil.
  var text = helperMessages.getText(response) || "";
  var buttons = helperMessages.getButtons(response);
  var useful = helperMessages.checkInitialMsgUseful(text,buttons);
  data.reviewedFeatures.initialMsgUseful = useful;

  console.log("initMsgUseful: "+data.reviewedFeatures.initialMsgUseful);
 
  // 6. Comprobamos variación respuestas
  
  // 6.1 para hello.
  await helperPuppeteer.writeMessage(page, "Hello"); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: "Hello", time: elapsedTime};
  data.messages.push(newMsg); // Primer mensaje si que almacenamos su tiempo de respuesta.

  text = helperMessages.getText(response) || "";

  //TODO getText devolviendo "".TODOTODOTODO.
  console.log(response[0].nodes);
  console.log(text);
  
  return;

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
  variatedResponses = helperMessages.checkVariations(variatedHelloRes) ? variatedResponses++ : variatedResponses;

  // 6.2 para goodbye.
  await helperPuppeteer.writeMessage(page, "Good bye"); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: "Good bye", time: elapsedTime};
  data.messages.push(newMsg); // Primer mensaje si que almacenamos su tiempo de respuesta.

  text = helperMessages.getText(response) || "";
  var variatedByeRes = [];
  variatedByeRes.push(text);
  
  await helperPuppeteer.writeMessage(page, "Good bye"); 
  response = await helperPuppeteer.listenBotResponse(page); 
  text = helperMessages.getText(response) || "";
  variatedByeRes.push(text);

  await helperPuppeteer.writeMessage(page, "Good bye"); 
  response = await helperPuppeteer.listenBotResponse(page); 
  text = helperMessages.getText(response) || "";
  variatedByeRes.push(text);

  variatedResponses = helperMessages.checkVariations(variatedByeRes) ? variatedResponses++ : variatedResponses;

  // 6.3 para randomString.
  var randomMsg = helperMessages.randomString(7);
  await helperPuppeteer.writeMessage(page, randomMsg); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: randomMsg, time: elapsedTime};
  data.messages.push(newMsg); // Como son aleatorios almacenamos tiempos respuesta de todos.

  text = helperMessages.getText(response) || "";
  var randomMsgsRes = []; // Array que usaremos más adelante.
  randomMsgsRes.push(text);
  
  randomMsg = helperMessages.randomString(7);
  await helperPuppeteer.writeMessage(page, randomMsg); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: randomMsg, time: elapsedTime};
  data.messages.push(newMsg);

  text = helperMessages.getText(response) || "";
  randomMsgsRes.push(text);

  randomMsg = helperMessages.randomString(7);
  await helperPuppeteer.writeMessage(page, randomMsg); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: randomMsg, time: elapsedTime};
  data.messages.push(newMsg);

  text = helperMessages.getText(response) || "";
  randomMsgsRes.push(text);

  variatedResponses = helperMessages.checkVariations(randomMsgsRes) ? variatedResponses++ : variatedResponses;
  var percentageVariations = (variatedResponses/3)*100;
  data.reviewedFeatures.variation = percentageVariations.toFixed(2);

  console.log(data.reviewedFeatures.variation);

  return;

  // 7. Comprobamos ayuda existente y útil.
  await helperPuppeteer.writeMessage(page, "Help"); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: "Help", time: elapsedTime};
  data.messages.push(newMsg);
  text = helperMessages.getText(response) || "";
  buttons = helperMessages.getButtons(response);
  useful = helperMessages.checkHelpCommandUseful(text,randomMsgsRes,buttons);
  data.reviewedFeatures.helpCommand = useful;

  console.log("reviewedFeatures: " +data.reviewedFeatures.helpCommand);

  return;

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

  await helperPuppeteer.writeMessage(page, "Hi"); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: "Hi", time: elapsedTime};
  data.messages.push(newMsg);

  text = helperMessages.getText(response) || "";
  variatedInRes.push(text);

  var admitTypos = 0;
  admitTypos = helperMessages.checkAdmitsTypos(variatedInRes,variatedHelloRes) ? admitTypos++ : admitTypos;

  // 8.2 para goodbye.
  await helperPuppeteer.writeMessage(page, "Goodbye"); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: "Good bye", time: elapsedTime};
  data.messages.push(newMsg); 

  text = helperMessages.getText(response) || "";
  var variatedRes = [];
  variatedRes.push(text);
  
  await helperPuppeteer.writeMessage(page, "Good bye"); 
  response = await helperPuppeteer.listenBotResponse(page); 
  text = helperMessages.getText(response) || "";
  variatedRes.push(text);

  await helperPuppeteer.writeMessage(page, "Good bye"); 
  response = await helperPuppeteer.listenBotResponse(page); 
  text = helperMessages.getText(response) || "";
  variatedRes.push(text);

  admitTypos = helperMessages.checkAdmitsTypos(variatedInRes,variatedHelloRes) ? admitTypos++ : admitTypos;

  // 8.3 para randomString.
  var randomMsg = helperMessages.randomString(7);
  await helperPuppeteer.writeMessage(page, randomMsg); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: randomMsg, time: elapsedTime};
  data.messages.push(newMsg); 

  text = helperMessages.getText(response) || "";
  var randomMsgsRes = []; // Array que usaremos más adelante.
  randomMsgsRes.push(text);
  
  randomMsg = helperMessages.randomString(7);
  await helperPuppeteer.writeMessage(page, randomMsg); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: randomMsg, time: elapsedTime};
  data.messages.push(newMsg);

  text = helperMessages.getText(response) || "";
  randomMsgsRes.push(text);

  randomMsg = helperMessages.randomString(7);
  await helperPuppeteer.writeMessage(page, randomMsg); 
  response = await helperPuppeteer.listenBotResponse(page); 
  elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  newMsg = {message: randomMsg, time: elapsedTime};
  data.messages.push(newMsg);

  text = helperMessages.getText(response) || "";
  randomMsgsRes.push(text);

  admitTypos = helperMessages.checkAdmitsTypos(variatedInRes,variatedHelloRes) ? admitTypos++ : admitTypos;
  var percentageAdmitedTypos = (admitTypos/3)*100;
  data.reviewedFeatures.typosHandled = percentageAdmitedTypos.toFixed(2);

  console.log(data.reviewedFeatures.typosHandled);

  //
  return;

  browser.close(); 

  /* hacer fuera, en app web si que es necesario para guardar en sql.
  var today = new Date(); 
  var timestampDay = ""; timestampDay=timestampDay+today.getFullYear();
  timestampDay=timestampDay+"-"+(today.getMonth()+1);
  timestampDay=timestampDay+"-"+today.getDate();
  console.log(timestampDay);
  */

  return data;
  
};

(async function(){
  await analyzeBot('dominos');
})()

module.exports = {
  analyzeBot:analyzeBot
}








