"use strict"; 

/**
 * @param  {Page} - Puppeteer API Page instance.
 * @return {String} - Bot id.
 **
 * Starts conversation if it has not been started.
 * If conversation has been started or if chatbot doesnt have startConversation button (Get Started) then 
 * it must be handled the reject, taking a screenshot (to ensure bot doesnt have get started button) and 
 * sending a message (e.g hello) to init conversation.
 */
function startBotConversation(botName,page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      await Promise.all([
        await page.goto('https://www.messenger.com/t/'+botName),
        await page.waitForNavigation({timeout:2000}).catch(function(res){console.log("no need to wait on bot connection.");}) //innecesario, nunca ha hecho falta.
      ]);
      var botonStart = await page.$("a[href='#']:not([tabindex]):not([aria-label]):not([id]):not([role='button'])");
      if(botonStart){ //boton de iniciar conversacion, cuando está ya iniciada no aparece.
        await botonStart.click(); 
      }else{ 
        reject();
      }
      resolve();
    })();
  });
}

/**
 * @param  {Page} - Puppeteer API Page instance.
 */
function closeCurrentBotConversation(page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      await page.waitFor(4000); //si no esperamos y justo están llegando mensajes tenemos error "node is detached from document".
      var gridCell = await page.$("div[role='gridcell']:not([class])");
      var divPreButton = await gridCell.$("div[role='button']");
      var botonMenu = await divPreButton.$("div[role='button']"); 
      await botonMenu.click();
      var menuConv = await page.waitFor("div[class='uiContextualLayerPositioner uiLayer']:not([class='hidden_elem'])");
      var actions = await menuConv.$$("li[role='presentation']").catch(()=>{reject();});
      var archiveConv = actions[2]; //archive index1, delete index2
      await page.waitFor(250);
      await archiveConv.click();
      await page.waitFor(250);
      var modalConfirmDelete = await page.$("div[class='clearfix']");
      var modalButtons = await modalConfirmDelete.$$("button").catch(()=>{reject();});
      await modalButtons[1].click(); //el botón central es el de confirmar.
      resolve();
    })();
  });
}



/**
 * @param  {Page} - Puppeteer API Page instance.
 * @param  {String} - Message to send to bot. 
 */
function writeMessage(page,msg){

  return new Promise(function(resolve,reject){
    (async ()=>{
      await new Promise(function(resolve,reject){setTimeout(resolve,250)});
      var messagePlace = await page.$("div[role='region'][aria-label='Messages']");
      var comboBox = await page.$("div[role='combobox']");
      await comboBox.type(msg);
      //var timestamp1 = new Date(); //Comenzar a contar justo antes de pulsar enter?
      await page.keyboard.press('Enter');  //Ó comboBox.press('Enter'). 
      resolve();
    })();
  });
}
/**
 * @param  {Page} - Puppeteer API Page instance.
 * @return {Object}
 *    @return {int} - Time the bot needs to send first message. We wait for more messages 1 second after last one.
 *    @return {Array[Object]} - Array of Object, each one correspondant with each received message/element, processed.
 *    @return {Array[ElementHandle]} - Array of elements, each one correspondant with each button added to the DOM. 
 */
function listenBotResponse(page){
  return new Promise(function(resolve,reject){
    (async ()=>{

      //setTimeout(()=>{page.screenshot({path: 'msgSent.png'});},200);
      //we have to ignore our msg, and process bot ones.
    try{  
      var result = await page.evaluate(function(){//timestamp1){
        var regExpEmojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
        //console.log("EMOJIFLAG"+ regExpEmojis.test('🏄'));
        /**
         * @param  {unprocessedNode} - DOM node, correspondent with a message/element received unprocessed.
         * @return {Array[Object]} All data about the messages in the node, If message is a simple text, *text* type, the string and a flag determining 
         * if it contains emoticons, if is an image or an audio, it is represented by *image* or *audio* type. If is a 
         * button/list of button, *button* type, its text and the elementHandle that can be clicked.
        */
        function processNodeData(unprocessedNode){
          if(!unprocessedNode){return [];}
          if(unprocessedNode.querySelector("div[data-tooltip-position='right']")){return  [];} //ignoramos primer mensaje.
          var arrObjs = [];
          /*si llega más de un mensaje en un nodo es porque el bot ha usado una plantilla para responder.*/ 

          //procesamos imágenes normales
          var pres = unprocessedNode.querySelector("div[role='presentation']");
          if(pres){
            var photo = pres.querySelector("img"); 
            var obj = {type: "image", url: photo.src };
            arrObjs.push(obj);
          }
          //procesamos imágenes de plantilla
          var backImg = unprocessedNode.querySelector("div[style^='background-image:']");
          if(backImg){
            var simpleImage = backImg.querySelector("img");
            if(!simpleImage){
              var obj = {type: "SheetImage"};//,url: backImg.outerHTML.regex url };
              arrObjs.push(obj);
            }
          }
          //procesamos textos simples
          var messagesBoxes = unprocessedNode.querySelectorAll("div[body]"); //div[message][body]
          messagesBoxes.forEach((messageDiv)=>{
            var messages = messageDiv.querySelectorAll("span:not([class])");
            var messages2 = messageDiv.querySelectorAll("span[class]");
            messages.forEach((message)=>{
              if(message && (message.innerText || regExpEmojis.test(message.innerText))){ //igual hay mensajes que son únicamente un emoticono. (e.g un corazón)
                var obj = {type: "text", message: message.innerText, emojiFlag: regExpEmojis.test(message.innerHTML)};
                arrObjs.push(obj);
              }   
            });
            messages2.forEach((message2)=>{
              if(message2 && (message2.innerText || regExpEmojis.test(message2.innerText))){
                var obj = {type: "text", message: message2.innerText, emojiFlag: regExpEmojis.test(message2.innerHTML)};
                arrObjs.push(obj);
              }
            })
          });
         //procesamos textos de plantilla
          var messagesSheet = unprocessedNode.querySelectorAll("div[class='']");
          messagesSheet.forEach((messageDiv)=>{
            if(messageDiv.innerHTML!==""){
              var obj = {type: "text", message: messageDiv.innerText, emojiFlag: regExpEmojis.test(messageDiv.innerHTML)};
              arrObjs.push(obj);
            } 
          });
          //procesamos botones (siempre en plantilla)
          var buttons = unprocessedNode.querySelectorAll("a[href='#']"); //si href es distinto de # es un link a página externa. 
          if(buttons){
            buttons.forEach((button)=>{ //no podemos devolver el nodo o el elemento clickable, devolvemos la ruta a él.
              var obj = {
                type: "button",
                message:  button.innerText,
                emojiFlag: regExpEmojis.test(button.innerText) || regExpEmojis.test(button.innerText) ,//" ⚡️↵"
                path: getPath(button)
              };
              arrObjs.push(obj);
            });
          } 
          //procesamos enlaces a páginas externas.
          var buttonsLinks = unprocessedNode.querySelectorAll("a[href]:not([href='#'])"); //si href es distinto de # es un link a página externa. 
          if(buttonsLinks){
            buttonsLinks.forEach((button)=>{ //no podemos devolver el nodo o el elemento clickable, devolvemos la ruta a él.
              var obj = {
                type: "buttonLink",
                message:  button.innerText,
                emojiFlag: regExpEmojis.test(button.innerText) || regExpEmojis.test(button.innerText) ,//" ⚡️↵"
                path: getPath(button)
              };
              arrObjs.push(obj);
            });
          } 
          return arrObjs;
        }


        /**
         * @param  {unprocessedNode} - DOM node, correspondent with the bottom buttons container.
         * @return {Array[Object]} All data about the bottom buttons.
        */
        function getBottomButtons(unprocessedNode){
          if(!unprocessedNode){return [];}
          var arrObjs = [];
          var bottomButtonsContainer = unprocessedNode.querySelector("div[currentselectedindex]");
          var bottomButtons = bottomButtonsContainer.querySelectorAll("div[role='button']");
          if(bottomButtons){
            bottomButtons.forEach((button)=>{ //no podemos devolver el nodo o el elemento clickable, devolvemos la ruta a él.
              var obj = {
                type: "button",
                message:  button.innerText,
                emojiFlag: regExpEmojis.test(button.innerText) || regExpEmojis.test(button.innerText) ,//" ⚡️↵",
                path: getPath(button)
              };
              arrObjs.push(obj);
            });
          }
          return arrObjs;
        }


        /**
         * @param  {unprocessedNode} - DOM node, correspondent with a message/element received unprocessed.
         * @return {Array[String]} String query to select ElementHandle Button that can be clickable.
        */
        getPath =  function (node) { 

          var el = node;
          if (!(el instanceof Element)) return;
          var path = [];
          while (el.nodeType === Node.ELEMENT_NODE) {
              var selector = el.nodeName.toLowerCase();
              if (el.id) {
                  selector += '#' + el.id;
              } else {
                  var sib = el, nth = 1;
                  while (sib.nodeType === Node.ELEMENT_NODE && (sib = sib.previousSibling) && nth++);
                  selector += ":nth-child("+nth+")";
              }
              path.unshift(selector);
              el = el.parentNode;
          }
          return path.join(" > ");
        }

        //TODO// ¿Se pueden observar cambios sin evaluate y MutationObserver???
        /*con waitForNavigation NO:
        If at the moment of calling the method the selector already exists, the method will return immediately.
         If the selector doesn't appear after the timeout milliseconds of waiting, the function will throw.*/
        var promiseMessages =  new Promise(function(resolve,reject){
          try{
            var box = document.querySelector("div[role='presentation']");
            var closerBox = box.querySelector("div[role='region']");
            var messagesBox = closerBox.querySelector("div[id]");
          }catch(e){
            reject(e);
          }
          
          var elapsedTime;
          var insertedNodes = [];
          var processedNodes = [];
          //var firstMessage = false; 
          var settedTimeouts = [];
          var timestamp1 = new Date();
          var secondMessage = false;
          var mutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {

              if(mutation.addedNodes.length){ //ignoramos primer mensaje.

                if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                insertedNodes = insertedNodes.concat(mutation.addedNodes[0]);
                secondMessage = true;
                var temporizer = setTimeout(()=>{
                
                  mutationObserver.disconnect();
                  try{
                    insertedNodes = insertedNodes.filter((node)=>{if(node){return node;}}); //eliminamos undefined s.
                    processedNodes = insertedNodes.map((node)=>{return processNodeData(node)});
                    processedNodes = processedNodes.filter((node)=>{if(node.length){return node;}});
                  }catch(err){
                    console.log(err);
                  };
                  resolve({time: elapsedTime,nodes: processedNodes});
                  
                },7000);
              }
            });
          });
          mutationObserver.observe(messagesBox, { childList: true });
          setTimeout(()=>{
            if(!secondMessage){
              console.log("reached 30secs.");
              mutationObserver.disconnect(); resolve({time: 15000,nodes: processedNodes});
            }
          },15000);
         
        });

        var promiseBottomButtons = new Promise(function(resolve,reject){
          try{
            var box = document.querySelector("div[role='presentation']");
            var closerBox = box.querySelector("div[class]"); //selecciona la primera capa que encuentra (la más exterior dentro de box).
            console.log(closerBox._args);//TODO ver hmtl seleccionado...
          }catch(e){
            reject(e);
            return;
          }
          var elapsedTime;
          //var insertedNodes = [];
          //var processedNodes = [];
          //var settedTimeouts = [];
          var timestamp1 = new Date();
          var bottomButtons = [];
          var mutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                bottomButtons =getBottomButtons(mutation.addedNodes[0]);
                if(bottomButtons.length){
                  if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                  mutationObserver.disconnect();
                  resolve({time: elapsedTime,nodes: bottomButtons});
                }
            });
          });
          mutationObserver.observe(closerBox, { childList: true });
          setTimeout(()=>{
            if(!bottomButtons.length){
              console.log("reached 15secs ."); //TODO hay que ponerse en el caso en el que nos llega sólo bottomButtons?? y texto y bb.  
              mutationObserver.disconnect(); resolve({time: 15000,nodes: []});
            }
          },15000);
         
        });

        return Promise.all([
          promiseMessages,
          promiseBottomButtons
        ]);
      });//,timestamp1);
    }catch(err){
      reject(err);
    }
    
    resolve(result);
      
    })();
  });
}


module.exports = {
  startBotConversation:startBotConversation,
  closeCurrentBotConversation : closeCurrentBotConversation,
  writeMessage : writeMessage,
  listenBotResponse: listenBotResponse
}

