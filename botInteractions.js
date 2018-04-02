"use strict"; 

/**
 * @param  {Page} - Puppeteer API Page instance.
 * @return {String} - Bot id.
 **
 * Starts conversation if it has not been started.
 */
function startBotConversation(botName,page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      await page.goto('https://www.messenger.com/t/'+botName);
      var botonStart = await page.$("a[href='#']:not([tabindex]):not([aria-label]):not([id]):not([role='button'])");
      if(botonStart){ //boton de iniciar conversacion, cuando está ya iniciada no aparece.
        await botonStart.click(); 
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
      var gridCell = await page.$("div[role='gridcell']:not([class])");
      var divPreButton = await gridCell.$("div[role='button']");
      var botonMenu = await divPreButton.$("div[role='button']"); 
      await botonMenu.click();
      var menuConv = await page.waitFor("div[class='uiContextualLayerPositioner uiLayer']:not([class='hidden_elem'])");
      console.log("hi");
      var actions = await menuConv.$$("li[role='presentation']").catch(()=>{page.screenshot({path: "./errors/closingError.png"})});
      var archiveConv = actions[2]; //archive index1, delete index2
      await page.waitFor(250);
      await archiveConv.click();
      await page.waitFor(250);
      var modalConfirmDelete = await page.$("div[class='clearfix']");
      var modalButtons = await modalConfirmDelete.$$("button").catch(()=>{page.screenshot({path: "./errors/closingError2.png"})});
      await modalButtons[1].click(); //el botón central es el de confirmar.
      resolve();
    })();
  });
}

/**
 * @param  {String} - Bot name to search for in messenger
 * @param  {Page} - Puppeteer API Page instance.
 * @return {String} - Bot id.
 **
 * Starts conversation if it has not been started.
 */
function getIdBot(botName,page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      
      await page.goto('https://www.messenger.com/t/'+botName,{timeout:5000}).catch(function(res){console.log("no need to wait.");}) //en pc pueblo no hace falta nunca, aquí a veces.)
      //Cannot find context with specified id undefined cuando error anterior.
      var botonStart = await page.$("a[href='#']:not([tabindex]):not([aria-label]):not([id]):not([role='button'])").catch(function(err){console.log(err)});
      var selectorBot;
  
      if(botonStart){ //Boton de iniciar conversacion, cuando está ya iniciada no aparece.
        await botonStart.click(); 
        selectorBot = await page.waitFor("div[id^='row_header_id_user']");
      }else{ 
      /*Es necesario que la conversación esté en la lista de conversaciones, 
        se puede dar el caso en el que esta se archive, y no se muestre botón de "Get Started" 
        puesto que ya está iniciada, pero no se muestre en la lista de conversaciones. */
        await page.screenshot({path:"./conversationAlreadyInitiated.png"});
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
      await comboBox.press('Enter');
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
            var obj = {type: "text", message: message.innerText, emojiFlag: regExpEmojis.test(message.innerHTML)
            };
            arrObjs.push(obj);
          }
          var buttons = unprocessedNode.querySelectorAll("a[href='#']");
          if(buttons){
            buttons.forEach((button)=>{ //no podemos devolver el nodo o el elemento clickable.
              var obj = {
                type: "button",
                message:  button.innerText,emojiFlag: regExpEmojis.test(button.innerText),
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
        
        getPath =  function (node) { //TODO pulir..
          /*
          var path;
          while (node) {
            var name = node.localName;
            if (!name) break;
            name = name.toLowerCase();
            var parent = node.parentNode;
            var sameTagSiblings = parent.children;
            if (sameTagSiblings.length > 1) { 
              var count = 0, index;
              for(var element in sameTagSiblings){
                if(sameTagSiblings[element] === node){
                  index = count;
                }
                count++;
              }
              if (index > 1) {
                name += ':nth-child(' + index + ')';
              }
            }
            path = name + (path ? '>' + path : '');
            node = parent;
          }
          return path;*/

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
        return new Promise(function(resolve,reject){
          
          var box = document.querySelector("div[role='presentation']");
          var buttons = box.querySelectorAll("a[href='#']");
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
                        processedNodes = insertedNodes.map((node)=>{return processNodeData(node)});
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
            //if(settedTimeouts.length===0){
              try{
                processedNodes = insertedNodes.map((node)=>{return processNode(node)});       
              }catch(err){
                console.log(err);
              };
              mutationObserver.disconnect(); resolve({time: 30000,nodes: processedNodes});
            //}
          },30000);
         
        });
      });//,timestamp1);

      resolve(result);
      
    })();
  });
}


module.exports = {
  startBotConversation:startBotConversation,
  closeCurrentBotConversation : closeCurrentBotConversation,
  getIdBot: getIdBot,
  writeMessage : writeMessage,
  listenBotResponse: listenBotResponse
}

