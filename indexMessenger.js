"use strict";

const puppeteer = require("puppeteer");
const credentials = require("./credentials.js");
//const MutationObserver = require('mutation-observer');

(async () => {

  const browser = await puppeteer.launch({executablePath:
    "./node_modules/chromium/lib/chromium/chrome-linux/chrome",//
    headless: true//
  });
  const page = await browser.newPage();
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
  
  var arrayMessagesUnprocessed = await writeMessage(page,"holis");
  
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
      var arrayMessagesUnprocessed = [];
      var timestamp1 = new Date();
      var elapsedTime;
      await comboBox.press('Enter');
    
      setTimeout(()=>{page.screenshot({path: 'msgSent.png'});},200);
      //we have to ignore our msg, and process bot ones.
  
      
      
      var result = await page.evaluate(function(){
        //TODO promise was collected undefined. Revisar si en .evaluate hay que usar await y page.$ o document.querySelect.
        return new Promise(function(resolve,reject){
          (async ()=>{
            var box = await page.$("div[role='presentation']");
            var closerBox = await box.$("div[role='region']");
            var messagesBox = await closerBox.$("div[id]");
            var insertedNodes = [];
            var firstMessage = false;
            var settedTimeouts = [];
            var mutationObserver = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {

                if(!firstMessage){
                  if(mutation.addedNodes.length>=1 && mutation.addedNodes[0].nodeName === "DIV"){firstMessage=true;}
                }else{
                  if(mutation.addedNodes.length>=1 && mutation.addedNodes[0].nodeName === "DIV"){ 
                    if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                    insertedNodes.concat(mutation.addedNodes);
                    var temporizer = setTimeout(()=>{
                      if(settedTimeouts.length === 1){
                        mutationObserver.disconnect();
                        resolve({time: elapsedTime,nodes: insertedNodes})
                      }else{
                        settedTimeouts.pop();
                      }
                    },3000);
                    settedTimeouts.push(true);
                  }
                }
              });
            });
            mutationObserver.observe(messagesBox, { childList: true });
            setTimeout(()=>{
              if(settedTimeouts.length===0){
                mutationObserver.disconnect(); resolve({time: 30000,nodes: insertedNodes});
              }
            },30000);
          })();
        });
      });
      
    
      resolve(res);
      
    })();
  });
}

/**
 * @param  {ElementHandle} - Puppeteer API ElementHandle instance, correspondent with a message/element received.
 * @return {Object} All data about the message, If is a simple text, *text* type, the string and a flag determining 
 * if it contains emoticons, if is an image or an audio, it is represented by *image* or *audio* type. If is a 
 * button/list of button, *button* type, its text and the elementHandle that can be clicked.
*/
function processElementHandle(elementHandle){
  return elementHandle.toString().slice(0,20);//temporal.
}