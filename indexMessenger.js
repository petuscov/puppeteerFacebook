"use strict"; //><

const puppeteer = require("puppeteer");
const credentials = require("./credentials.js");
//const MutationObserver = require('mutation-observer');

(async () => {

  const browser = await puppeteer.launch({
    //executablePath:"./node_modules/chromium/lib/chromium/chrome-linux/chrome",//
    //headless: true//
  });
  const page = await browser.newPage(); 
  page.on('console', console.log); //Para poder hacer console.log dentro de .evaluate()
  /*var cookies = await page.cookies('https://www.messenger.com/login.php');
  console.log(cookies);
  cookies.forEach(function(element,index){
    (async () => {
      await page.deleteCookie(element.name);
    })();
  });*/ 
  await page.goto('https://www.messenger.com/login.php'); //si ya se ha logeado previamente no encuentra nodo email. ¿eliminamos cookies previamente para esto? No se solventa.

  await page.click("#email"); //no debe haber ningún usuario ya logeado.
  await page.keyboard.type(credentials.username);
  await page.click('#pass'); 
  await page.keyboard.type(credentials.password);

  const [response] = await Promise.all([
    await page.click('#loginbutton'),
    await page.waitForNavigation()
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
  //await page.screenshot({path: 'conv.png'});

  //await page.screenshot({path: 'archivedConv.png'});
  
  var arrayMessagesUnprocessed = await writeMessage(page,"holis").then((res)=>{console.log(res.time);res.nodes.forEach(function(element){console.log(element);});});
  //TODO.: guardar el tiempo junto el mensaje que ha originado la respuesta, para reflejarlos juntos. (distinguir ante que mensajes se tarda más).

  await page.screenshot({path: 'msgsReceived.png'});


  //await closeCurrentBotConversation(page);
  browser.close();

})();


////Util methods



/**
 * @param  {String} - Bot name to search for in messenger
 * @param  {Page} - Puppeteer API Page instance.
 * @return {String} - Bot id.
 */
function getIdBot(botName,page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      await page.goto('https://www.messenger.com/t/'+botName);
      var botonStart = await page.$("a[href='#']:not([tabindex]):not([aria-label]):not([id])");
      var selectorBot;
  
      if(botonStart){ //boton de iniciar conversacion, cuando está ya iniciada no aparece.
        await botonStart.click(); 
        selectorBot = await page.waitFor("div[id^='row_header_id_user']");
      }else{
        selectorBot = await page.$("div[id^='row_header_id_user']");
      }
          
      var idSelector = selectorBot._remoteObject.description.split('#')[1];
      var idBot = idSelector.split(":")[1].split(".")[0];
      resolve(idBot);
    })();
  });
}
/**
 * @param  {Page} - Puppeteer API Page instance.
 */
function closeCurrentBotConversation(page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      var gridCell = await page.$("div[role='gridcell']:not([class])");
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
/**
 * @param  {Page} - Puppeteer API Page instance.
 * @param  {String} - Message to send to bot.
 * @return {Object}
 *    @return {int} - Time the bot needs to send first message. We wait for more messages 1 second after last one.
 *    @return {Array[ElementHandle]} - Array of  'ElementHandle' instances, correspondent with each received message/element.
 */

function writeMessage(page,msg){

return new Promise(function(resolve,reject){
    (async ()=>{
      
      var messagePlace = await page.$("div[role='region'][aria-label='Messages']");
      var comboBox = await page.$("div[role='combobox']");
      await comboBox.type(msg);
      //var timestamp1 = new Date(); //Comenzar a contar justo antes de pulsar enter?
      await comboBox.press('Enter');
    
      //setTimeout(()=>{page.screenshot({path: 'msgSent.png'});},200);
      //we have to ignore our msg, and process bot ones.
      
      var result = await page.evaluate(function(){//timestamp1){

        /**
         * @param  {unprocessedNode} - DOM node, correspondent with a message/element received unprocessed.
         * @return {Array[Object]} All data about the messages in the node, If message is a simple text, *text* type, the string and a flag determining 
         * if it contains emoticons, if is an image or an audio, it is represented by *image* or *audio* type. If is a 
         * button/list of button, *button* type, its text and the elementHandle that can be clicked.
        */
        function processNode(unprocessedNode){
          //TODO flag indicadora de emojis en textos.
          //unprocessedNode = unprocessedNode.asElement();
          var arrObjs = [];
          /*si llega más de un mensaje en un nodo es porque el bot ha usado una plantilla para responder.
           Dentro de un mismo nodo vamos a ignorar el orden de los mensajes.*/ 
          var pres = unprocessedNode.querySelector("div[role='presentation']");
          if(pres){
            var photo = pres.querySelector("img");
            var obj = {type: "image", url: photo.src };
            arrObjs.push(obj);
          }
          var message = unprocessedNode.querySelector("span");
          if(message){
            var obj = {type: "text", message: message.innerText };
            arrObjs.push(obj);
          }
          var buttons = unprocessedNode.querySelectorAll("a[href='#']");
          if(buttons){
            buttons.forEach((button)=>{ //no podemos devolver el nodo o el elemento clickable.
              var obj = {
                type: "button",
                message:  button.innerText
              };
              arrObjs.push(obj);
            });
          }  
          return arrObjs;
        }
        
        //TODO// ¿Se pueden observar cambios sin evaluate y MutationObserver???
        /*con waitForNavigation NO:
        If at the moment of calling the method the selector already exists, the method will return immediately.
         If the selector doesn't appear after the timeout milliseconds of waiting, the function will throw.*/
        return new Promise(function(resolve,reject){
          
          var box = document.querySelector("div[role='presentation']");
          var closerBox = box.querySelector("div[role='region']");
          var messagesBox = closerBox.querySelector("div[id]");
          //console.log(messagesBox); //JSHanlde node (elementHanlde extiende JSHandle)
          var elapsedTime;
          var insertedNodes = [];
          var processedNodes = [];
          //var firstMessage = false; 
          var settedTimeouts = [];
          var timestamp1 = new Date();

          var mutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              //if(!firstMessage){ //no hace falta tratar el primer mensaje porque llega antes de que entremos en page.evaluate. (TODO. siempre así?)
              //  if(mutation.addedNodes.length===1 && mutation.addedNodes[0].nodeName === "DIV"){firstMessage=true;} // >= 1 ó === 1 ?
              //}else{
                if(mutation.addedNodes.length===1 && mutation.addedNodes[0].nodeName === "DIV"){ 
                  if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                  insertedNodes = insertedNodes.concat(mutation.addedNodes[0]);
                  var temporizer = setTimeout(()=>{
                    if(settedTimeouts.length === 1){
                      mutationObserver.disconnect();
                      try{
                        processedNodes = insertedNodes.map((node)=>{return processNode(node)});
                      }catch(err){
                        console.log(err);
                      };
                      resolve({time: elapsedTime,nodes: processedNodes});
                    }else{
                      settedTimeouts.pop();
                    }
                  },3000);
                  settedTimeouts.push(true);
                }
              //}
            });
          });
          mutationObserver.observe(messagesBox, { childList: true });
          setTimeout(()=>{
            console.log("reached 30secs.");
            if(settedTimeouts.length===0){
              try{
                processedNodes = insertedNodes.map((node)=>{return processNode(node)});       
              }catch(err){
                console.log(err);
              };
              mutationObserver.disconnect(); resolve({time: 30000,nodes: processedNodes});
            }
          },30000);
         
        });
      });//,timestamp1);

      resolve(result);
      
    })();
  });
}



