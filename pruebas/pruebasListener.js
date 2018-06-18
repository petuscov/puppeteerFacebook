"use strict";
const puppeteer = require("puppeteer");
const helperPuppeteer = require("./../_helperPuppeteer.js");
const helperMessages = require("./../_helperMessages.js");

//const credentials = require("./credentials.js");
const credentials = require("./../package.json").credentials;

//para pruebas testeo listener. nombre bot goto26.
(async function(){


  const browser = await puppeteer.launch({
      executablePath:"./node_modules/chromium/lib/chromium/chrome-linux/chrome",//
      headless: true//
      //headless: false
    });
  const page = await browser.newPage(); 
  
  //page.on('console', (msg)=>{if(msg._text){console.log(msg._text);}else{console.log(msg);}});
  page.on('console', (msg)=>{console.log(msg);});
  //page.on('console', (msg)=>{console.log(msg._args[0]._remoteObject);});
 
  var data = {
    reviewedFeatures: {}
  }

  await helperPuppeteer.loginWithUser(credentials.username,credentials.password,page);
  await helperPuppeteer.closeAllBotConversations(page); 
  
  var nameOrId = 'cnn'; //cnn
  
  //MSGS. OK.

  try{
    await helperPuppeteer.startBotConversation(nameOrId,page);
  } catch (err) {
    await helperPuppeteer.writeMessage(page, "Get started"); // "help"); //"Get started");
  }
  var response;
  response = await helperPuppeteer.listenBotResponse(page); 
  
  printData(response);

  return;
  //console.log(response[0].nodes);
  var multi = helperMessages.containsMultimedia(response);
  console.log(multi);
  var emojis = helperMessages.containsEmojis(response);
  console.log(emojis);
  var buttons = helperMessages.getButtons(response);
  console.log(buttons);
  var text = helperMessages.getText(response);
  console.log(text);
  
  

  console.log("end");
  return;

  //var text = await helperMessages.getText(response); 
  //console.log(text);
  
  //return;
  //NO SE PROCESA EL MSG PORQUE EL CONTENIDO ESTÁ EN UN ::AFTER. PARA OBTENERLO HAY QUE VOLVER A ESCRIBIR 'Get started',
  //LA SEGUNDA VEZ SI QUE SE OBTIENE EL CONTENIDO PROCESADO EN UN OBJETO. ESTO HA LLEVADO TIEMPO.
  //PARA OBTENERLO A LA PRIMERA: OBTENER SELECTOR DEL NODO AÑADIDO, Y VOLVER A REALIZAR QUERYSELECTOR PARA OBTENER EL NODO ENTERO (CON CONTENIDO ::AFTER)
  await helperPuppeteer.writeMessage(page, "Help");
  response = await helperPuppeteer.listenBotResponse(page);
  //console.log(response);   
  
  printData(response);

  await helperPuppeteer.writeMessage(page, "Hello");
  response = await helperPuppeteer.listenBotResponse(page);
  //console.log(response);  
  printData(response);

  console.log("fin");
  return;

/*
var stackToButtons;
  var stackInputs = [];

  stackInputs.push('%initialMessage%');
  try{
    await helperPuppeteer.startBotConversation(nameOrId,page);
  } catch (err) {
    await helperPuppeteer.writeMessage(page, "Get started");//"Get started"); // "help"); //"Get started");
  }
  var response;
  response = await helperPuppeteer.listenBotResponse(page); 
  var buttons = helperMessages.getButtons(response);
  if(buttons.length && !stackToButtons){stackToButtons = stackInputs.slice();}
  //console.log(stackToButtons);
  //return;
  if(!stackToButtons){
    data.reviewedFeatures.buttonEquivalent = "No button detected.";
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
          await helperPuppeteer.writeMessage(page, "Get started");//"Get started"); 
        }
      }else{
        await helperPuppeteer.writeMessage(page, message);
      }
      var response = await helperPuppeteer.listenBotResponse(page); 
      buttons = helperMessages.getButtons(response); 
      if(buttons){
        found = true;
      }
    }
    // 9.1.2 Pulsación botón. (el primero de los disponibles.)
    if(found){
      var buttons = await helperMessages.getButtons(response); 
      var button = buttons[0];//cogemos el primero de los disponibles.
      var pathToButton = button.path;
      await page.click(pathToButton);
      var response = await helperPuppeteer.listenBotResponse(page); 
      var messageButtonPressed = helperMessages.getText(response) || "";
    }
    //console.log("MESS: ",messageButtonPressed); //PULSACIÓN BOTÓN CORRECTA.

    // 9.2.1 Búsqueda botón. (para escritura mensaje.)
    var copyOfStack = stackToButtons.slice();
    var found = false;
    for(;copyOfStack.length && !found;){
      var message = copyOfStack.shift();
      if(message="%initialMessage%"){
        // Cerramos conversación, para volverla a iniciarla escuchando la respuesta.
        await helperPuppeteer.closeCurrentBotConversation(page); 
        try{
          await helperPuppeteer.startBotConversation(nameOrId,page);
        } catch (err) {
          await helperPuppeteer.writeMessage(page, "Get started");//"Get started"); 
        }
      }else{
        await helperPuppeteer.writeMessage(page, message);
      }
      var response = await helperPuppeteer.listenBotResponse(page); 
      buttons = helperMessages.getButtons(response); 
      if(buttons){
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
    console.log("PULSANDO:" + messageButtonPressed);
    console.log("ESCRIBIENDO:" + messageButtonTextTyped);
    data.reviewedFeatures.buttonEquivalent = messageButtonTextTyped===messageButtonPressed;
    console.log("YAY: "+ data.reviewedFeatures.buttonEquivalent);
  }




  console.log("end");

  return;
  */





})();

function printData(response){
  console.log("TIME: ",response[0].time);
  for(var index in response[0].nodes){
    var node = response[0].nodes[index];
    console.log(node);
  }
  for(var index in response[1].nodes){
    var node = response[1].nodes[index];
    console.log(node);
  }
}

//se ha conseguido corregir botlistener. si es necesario testear más comenzar analizando el listener
// existente en helperPuppeteer.


//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
////////////////////OLD///////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////



function listenBotResponseQ(page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      var result = await page.evaluate(function(){
        
        function processNodeData(unprocessedNode){
          var regExpEmojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
          if(!unprocessedNode){return [];}

          //if(unprocessedNode.querySelector("div[data-tooltip-position='right']")){return  [];} //ignoramos primer mensaje.
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
              var obj = {type: "sheetImage"};//,url: backImg.outerHTML.regex url };
              arrObjs.push(obj);
            }
          }
          //procesamos textos simples
          var messagesBoxes = unprocessedNode.querySelectorAll("div[message][body]"); //div[body] ??
          if(messagesBoxes){
            messagesBoxes.forEach((messageDiv)=>{
              //var messages = messageDiv.querySelectorAll("span:not([class])");
              //var messages2 = messageDiv.querySelectorAll("span[class]");
              var message = messageDiv.querySelector("div[aria-label]"); //antes messages
              //messages.forEach((message)=>{
                if(message && (message.innerText || regExpEmojis.test(message.innerText))){ //igual hay mensajes que son únicamente un emoticono. (e.g un corazón)
                  var obj = {type: "text", message: message.innerText, emojiFlag: regExpEmojis.test(message.innerHTML)};
                  arrObjs.push(obj);
                }   
              //});
            });
          }
          //procesamos textos de plantilla
          var messagesSheet = unprocessedNode.querySelectorAll("div[class='']");
          if(messagesSheet){
            messagesSheet.forEach((messageDiv)=>{
              if(messageDiv.innerHTML!==""){
                var obj = {type: "text", message: messageDiv.innerText, emojiFlag: regExpEmojis.test(messageDiv.innerHTML)};
                arrObjs.push(obj);
              } 
            });
          }
          //procesamos botones (siempre en plantilla)
          var buttons = unprocessedNode.querySelectorAll("a[href='#']"); //si href es distinto de # es un link a página externa. 
          if(buttons){
            buttons.forEach((button)=>{ //no podemos devolver el nodo o el elemento clickable, devolvemos la ruta a él.
              var obj = {
                type: "button",
                message:  button.innerText,
                emojiFlag: regExpEmojis.test(button.innerText) || regExpEmojis.test(button.innerText) ,//" ⚡️↵"
                path: getPathEl(button)
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
                path: getPathEl(button)
              };
              arrObjs.push(obj);
            });
          } 

          //console.log(unprocessedNode);
          
          return arrObjs;

        }

        function processBottomButtons(unprocessedNode,getPath){
          var regExpEmojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
          if(!unprocessedNode){return [];}
          var arrObjs = [];
          var bottomButtonsContainer = unprocessedNode.querySelector("div[currentselectedindex]");
          //console.log(bottomButtonsContainer);
          var bottomButtons = bottomButtonsContainer.querySelectorAll("div[role='button']");
          //console.log(bottomButtons);
          if(bottomButtons){
            bottomButtons.forEach((button)=>{ //no podemos devolver el nodo o el elemento clickable, devolvemos la ruta a él.
              var obj = {
                type: "button",
                message:  button.innerText,
                emojiFlag: regExpEmojis.test(button.innerText) || regExpEmojis.test(button.innerText) ,//" ⚡️↵",
                path: getPathEl(button)
              };
              arrObjs.push(obj);
            });
          }
          return arrObjs;
        }

        function getPath(node) { 

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
          //return "yay";
          return path.join(" > ");
        }

        function getPathEl(node) { 

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
          return "yay";
          //return path.join(" > ");
        }

        //selector of messageBox.
        var box = document.querySelector("div[role='presentation']");
        var closerBox = box.querySelector("div[role='region']");
        var messagesBox = closerBox.querySelector("div[id]");

        var promiseMessages =  new Promise(function(resolve,reject){
          
          var elapsedTime;
          var insertedNodes = [];
          var processedNodes = [];
          var timestamp1 = new Date();
          var botResponse = false;

          function callback(mutations){
            mutations.forEach(function(mutation) {
              var nodeRaw = mutation.addedNodes;
              if(nodeRaw.length){
                if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} 
                insertedNodes = insertedNodes.concat(nodeRaw[0]);
                botResponse = true;

                setTimeout(()=>{ 

                  try{
                    insertedNodes.forEach((node)=>{
                      var selector = getPath(node);
                      var addedNode = document.querySelector(selector);
                      var processedNode = processNodeData(addedNode);
                      processedNodes.push(processedNode);
                    });

                  } catch (e) {
                    console.log(e);
                  }
                  
                  mutationObserver.disconnect();
                  resolve({time: elapsedTime,nodes: processedNodes});

                },500)
              }
               
            });
          }

          var mutationObserver = new MutationObserver(callback);
          mutationObserver.observe(messagesBox, { childList: true});

          setTimeout(()=>{
            mutationObserver.disconnect(); 
            if(!botResponse){
              elapsedTime = 7000;
            }
            resolve({time: elapsedTime,nodes: processedNodes});
          },7000);

        });

        var promiseBottomButtons = new Promise(function(resolve,reject){
          try{
            var box = document.querySelector("div[role='presentation']");
            //var closerBox = box.querySelector("div[class]"); //selecciona la primera capa que encuentra (la más exterior dentro de box).
            var closerBox = box.querySelector("div[role='region']");
            var messagesBox = closerBox.querySelector("div[id]");
          }catch(e){
            reject(e);
            return;
          }
          var elapsedTime;

          var timestamp1 = new Date();
          var bottomButtons = [];
          var mutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                bottomButtons =processBottomButtons(mutation.addedNodes[0]);
                if(bottomButtons.length){
                  if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                  mutationObserver.disconnect();
                  resolve({time: elapsedTime,nodes: bottomButtons});
                }
            });
          });
          mutationObserver.observe(messagesBox, { childList: true });
          setTimeout(()=>{
            if(!bottomButtons.length){
              //console.log("Reached 7 secs ."); 
              mutationObserver.disconnect(); resolve({time: 7000,nodes: []});
            }
          },7000);
         
        });

        return Promise.all([
          promiseMessages,
          promiseBottomButtons
        ]);
      });

      resolve(result);
      
    })();
  });
}

// #3 ATTEMP.
function listenBotResponse3(page){
  return new Promise(function(resolve,reject){
    (async ()=>{

      try{  
        var result = await page.evaluate(function(processNodeDataStr,processBottomButtonsStr,getPathStr){//timestamp1){

          //un-serialize helper functions.
          const processNodeData = new Function(' return (' + processNodeDataStr + ').apply(null, arguments)');
          const processBottomButtons = new Function(' return (' + processBottomButtonsStr + ').apply(null, arguments)');
          const getPath = new Function(' return (' + getPathStr + ').apply(null, arguments)');


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
            //var ignoredMessages = 0; //En browser es necesario, puesto que llegan 2 que no necesitamos (tiempo y msg nuestro), en puppeteer llegan los útiles.
            var settedTimeouts = [];
            var timestamp1 = new Date();
            var botResponse = false;
            var mutationObserver = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                
                var nodeRaw = mutation.addedNodes;
                if(nodeRaw.length){
                  if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                  insertedNodes = insertedNodes.concat(nodeRaw[0]);
                  botResponse = true;
                
                  mutationObserver.disconnect();
                  try{
                    //console.log("nums: "+ insertedNodes.length); //para intentar solventar problema primer mensaje.
                    insertedNodes = insertedNodes.filter((node)=>{if(node){return node;}}); //eliminamos undefined s.
                    //console.log("nums2: "+ insertedNodes.length);
                    processedNodes = insertedNodes.map((node)=>{return processNodeData(node,getPath);});
                    //console.log("nums3: " + processedNodes.length);
                    processedNodes = processedNodes.filter((node)=>{if(node.length){return node;}});
                    //console.log("nums4: " + processedNodes.length);
                  }catch(err){
                    console.log("BIG PROBLEM");
                    console.log(err);
                  };
                  //console.log(processedNodes);
                  resolve({time: elapsedTime,nodes: processedNodes});
                }
                 
              });
            });
            mutationObserver.observe(messagesBox, { childList: true });
            setTimeout(()=>{
              mutationObserver.disconnect(); 
              if(!botResponse){
                elapsedTime = 7000;
              }
              resolve({time: elapsedTime,nodes: processedNodes});
            },7000);
           
          });

          var promiseBottomButtons = new Promise(function(resolve,reject){
            try{
              var box = document.querySelector("div[role='presentation']");
              //var closerBox = box.querySelector("div[class]"); //selecciona la primera capa que encuentra (la más exterior dentro de box).
              var closerBox = box.querySelector("div[role='region']");
              var messagesBox = closerBox.querySelector("div[id]");
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
                  bottomButtons =processBottomButtons(mutation.addedNodes[0],getPath);
                  if(bottomButtons.length){
                    if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                    mutationObserver.disconnect();
                    resolve({time: elapsedTime,nodes: bottomButtons});
                  }
              });
            });
            mutationObserver.observe(messagesBox, { childList: true });
            setTimeout(()=>{
              if(!bottomButtons.length){
                //console.log("Reached 7 secs ."); 
                mutationObserver.disconnect(); resolve({time: 7000,nodes: []});
              }
            },7000);
           
          });

          return Promise.all([
            promiseMessages,
            promiseBottomButtons
          ]);
        }, processNodeData.toString(), processBottomButtons.toString(), getPath.toString()); //helper functions, serialized.
      }catch(err){
        reject(err);
      }

      resolve(result);
      
    })();
  });
}



// #2 attemp.

function listenBotResponse2(page){
  
   
  return new Promise(function(resolve,reject){
    (async ()=>{
      var result = await page.evaluate(function(){

       function processNodeData(unprocessedNode){
          if(!unprocessedNode){return [];}
          var arrObjs = [];
        

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
              var obj = {type: "image"};//,url: backImg.outerHTML.regex url };
              arrObjs.push(obj);
            }
          }
          //procesamos textos simples
          var messagesBoxes = unprocessedNode.querySelectorAll("div[message][body]");
          messagesBoxes.forEach((messageDiv)=>{
            //var message = messageDiv.querySelector("span:not([class])");
            var message = messageDiv.querySelector("div[aria-label]");
            if(message && (message.innerText || regExpEmojis.test(message.innerText))){ //igual hay mensajes que son únicamente un emoticono. (e.g un corazón)
              var obj = {type: "text", message: message.innerText};
              arrObjs.push(obj);
            }   
          });
         //procesamos textos de plantilla
          var messagesSheet = unprocessedNode.querySelectorAll("div[class='']");
          messagesSheet.forEach((messageDiv)=>{
            if(messageDiv.innerHTML!==""){
              var obj = {type: "text", message: messageDiv.innerText};
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
                path: 'not yet'
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
                path: 'not yet'
              };
              arrObjs.push(obj);
            });
          } 
          return arrObjs;
        }
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
                path: 'not yet'
              };
              arrObjs.push(obj);
            });
          }
          return arrObjs;
        }
       


        var promiseMessages =  new Promise(function(resolve,reject){
          
          var box = document.querySelector("div[role='presentation']");
          var closerBox = box.querySelector("div[role='region']");
          var messagesBox = closerBox.querySelector("div[id]");
          var elapsedTime;
          var ignoredMessages = 0;
          var insertedNodes = [];
          var processedNodes = [];
          var settedTimeouts = [];
          var timestamp1 = new Date();

          var mutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              //if(ignoredMessages<2){ //ignoramos hora en la que se ha enviado el mensaje y nuestro mensaje.
              //  ignoredMessages++;
              //}else{
              //if(mutation.addedNodes.length){ //DOESNT WORK.
                if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                insertedNodes = insertedNodes.concat(mutation.addedNodes[0]);
                var temporizer = setTimeout(()=>{
                  if(settedTimeouts.length === 1){
                    mutationObserver.disconnect();
                    try{
                      insertedNodes = insertedNodes.filter((node)=>{if(node){return node;}}); //eliminamos undefined s.
                      processedNodes = insertedNodes.map((node)=>{return processNodeData(node)});
                      processedNodes = processedNodes.filter((node)=>{if(node.length){return node;}});
                    }catch(err){
                      console.log(err);
                    };
                    resolve({time: elapsedTime,nodes: processedNodes});
                  }else{
                    settedTimeouts.pop();
                  }
                },3000);
                settedTimeouts.push(true);
              //}
            });
          });
          mutationObserver.observe(messagesBox, { childList: true });
          setTimeout(()=>{
            if(settedTimeouts.length===0){
              console.log("Reached 7 secs.");
              try{
                processedNodes = insertedNodes.map((node)=>{return processNodeData(node)});       
              }catch(err){
                console.log(err);
              };
              mutationObserver.disconnect(); resolve({time: 7000,nodes: processedNodes});
            }
          },7000);
         
        });

        var promiseBottomButtons = new Promise(function(resolve,reject){
          
          var box = document.querySelector("div[role='presentation']");
          var closerBox = box.querySelector("div[class]"); //selecciona la primera capa que encuentra (la más exterior dentro de box).
          var elapsedTime;
          var insertedNodes = [];
          var processedNodes = [];
          var settedTimeouts = [];
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
              console.log("Reached 7 secs.");
              mutationObserver.disconnect(); resolve({time: 7000,nodes: []});
            }
          },7000);
         
        });

        return Promise.all([promiseMessages,promiseBottomButtons]);
            
      });   
      
      resolve(result);
     
    })();
  });
};




// #1 ATTEMP.
function listenBotResponseZ(page){
  return new Promise(function(resolve,reject){
    (async ()=>{

      try{  
        var result = await page.evaluate(function(processNodeDataStr,processBottomButtonsStr,getPathStr){//timestamp1){

          //un-serialize helper functions.
          const processNodeData = new Function(' return (' + processNodeDataStr + ').apply(null, arguments)');
          const processBottomButtons = new Function(' return (' + processBottomButtonsStr + ').apply(null, arguments)');
          const getPath = new Function(' return (' + getPathStr + ').apply(null, arguments)');


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
            //var ignoredMessages = 0; //En browser es necesario, puesto que llegan 2 que no necesitamos (tiempo y msg nuestro), en puppeteer llegan los útiles.
            var settedTimeouts = [];
            var timestamp1 = new Date();
            var botResponse = false;
            var mutationObserver = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                
                //if(ignoredMessages<2){
                //  ignoredMessages++;
                //}else{ //ignoramos hora en la que se ha enviado el mensaje y nuestro mensaje. // otra forma de ignorar primer mensaje.
                //if(mutation.addedNodes.length){ //ignoramos primer mensaje. NO VALE.
                  if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                  insertedNodes = insertedNodes.concat(mutation.addedNodes[0]);
                  botResponse = true;
                  //var temporizer = setTimeout(()=>{
                    //TODO esto no hará que se pare en cuanto llegue primer mensaje? Comentado. cs en carpeta cs.
                    mutationObserver.disconnect();
                    try{
                      //console.log("nums: "+ insertedNodes.length); //para intentar solventar problema primer mensaje.
                      insertedNodes = insertedNodes.filter((node)=>{if(node){return node;}}); //eliminamos undefined s.
                      //console.log("nums2: "+ insertedNodes.length);
                      processedNodes = insertedNodes.map((node)=>{return processNodeData(node,getPath);});
                      //console.log("nums3: " + processedNodes.length);
                      processedNodes = processedNodes.filter((node)=>{if(node.length){return node;}});
                      //console.log("nums4: " + processedNodes.length);
                    }catch(err){
                      console.log("BIG PROBLEM");
                      console.log(err);
                    };
                    //console.log(processedNodes);
                    resolve({time: elapsedTime,nodes: processedNodes});
                    
                  //},7000);
                //}
              });
            });
            mutationObserver.observe(messagesBox, { childList: true });
            setTimeout(()=>{
              mutationObserver.disconnect(); 
              if(!botResponse){
                elapsedTime = 7000;
              }
              resolve({time: elapsedTime,nodes: processedNodes});
            },7000);
           
          });

          var promiseBottomButtons = new Promise(function(resolve,reject){
            try{
              var box = document.querySelector("div[role='presentation']");
              //var closerBox = box.querySelector("div[class]"); //selecciona la primera capa que encuentra (la más exterior dentro de box).
              var closerBox = box.querySelector("div[role='region']");
              var messagesBox = closerBox.querySelector("div[id]");
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
                  bottomButtons =processBottomButtons(mutation.addedNodes[0],getPath);
                  if(bottomButtons.length){
                    if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                    mutationObserver.disconnect();
                    resolve({time: elapsedTime,nodes: bottomButtons});
                  }
              });
            });
            mutationObserver.observe(messagesBox, { childList: true });
            setTimeout(()=>{
              if(!bottomButtons.length){
                //console.log("Reached 7 secs ."); 
                mutationObserver.disconnect(); resolve({time: 7000,nodes: []});
              }
            },7000);
           
          });

          return Promise.all([
            promiseMessages,
            promiseBottomButtons
          ]);
        }, processNodeData.toString(), processBottomButtons.toString(), getPath.toString()); //helper functions, serialized.
      }catch(err){
        reject(err);
      }

      resolve(result);
      
    })();
  });
}







/**
 * LISTEN RESPONSE HELPER FUNCTIONS
 */

/**
 * @param  {unprocessedNode} - DOM node, correspondent with a message/element received unprocessed.
 * @return {Array[Object]} All data about the messages in the node, If message is a simple text, *text* type, the string and a flag determining 
 * if it contains emoticons, if is an image or an audio, it is represented by *image* or *audio* type. If is a 
 * button/list of button, *button* type, its text and the elementHandle that can be clicked.
*/
function processNodeData(unprocessedNode,getPath){
  var regExpEmojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  if(!unprocessedNode){return [];}

  //if(unprocessedNode.querySelector("div[data-tooltip-position='right']")){return  [];} //ignoramos primer mensaje.
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
      var obj = {type: "sheetImage"};//,url: backImg.outerHTML.regex url };
      arrObjs.push(obj);
    }
  }
  //procesamos textos simples
  var messagesBoxes = unprocessedNode.querySelectorAll("div[message][body]"); //div[body] ??
  if(messagesBoxes){
    messagesBoxes.forEach((messageDiv)=>{
      //var messages = messageDiv.querySelectorAll("span:not([class])");
      //var messages2 = messageDiv.querySelectorAll("span[class]");
      var message = messageDiv.querySelector("div[aria-label]"); //antes messages
      //messages.forEach((message)=>{
        if(message && (message.innerText || regExpEmojis.test(message.innerText))){ //igual hay mensajes que son únicamente un emoticono. (e.g un corazón)
          var obj = {type: "text", message: message.innerText, emojiFlag: regExpEmojis.test(message.innerHTML)};
          arrObjs.push(obj);
        }   
      //});
      
      /*messages2.forEach((message2)=>{
        if(message2 && (message2.innerText || regExpEmojis.test(message2.innerText))){
          var obj = {type: "text", message: message2.innerText, emojiFlag: regExpEmojis.test(message2.innerHTML)};
          arrObjs.push(obj);
        }
      })*/
    });
  }
  //procesamos textos de plantilla
  var messagesSheet = unprocessedNode.querySelectorAll("div[class='']");
  if(messagesSheet){
    messagesSheet.forEach((messageDiv)=>{
      if(messageDiv.innerHTML!==""){
        var obj = {type: "text", message: messageDiv.innerText, emojiFlag: regExpEmojis.test(messageDiv.innerHTML)};
        arrObjs.push(obj);
      } 
    });
  }
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

  //console.log(arrObjs.length); //para intentar solventar problema primer mensaje. 
  //for(var i in arrObjs){
  //  console.log(arrObjs[i]);
  //}
  
  return arrObjs;

}


/**
 * @param  {unprocessedNode} - DOM node, correspondent with the bottom buttons container.
 * @return {Array[Object]} All data about the bottom buttons.
*/
function processBottomButtons(unprocessedNode,getPath){
  var regExpEmojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  if(!unprocessedNode){return [];}
  var arrObjs = [];
  var bottomButtonsContainer = unprocessedNode.querySelector("div[currentselectedindex]");
  //console.log(bottomButtonsContainer);
  var bottomButtons = bottomButtonsContainer.querySelectorAll("div[role='button']");
  //console.log(bottomButtons);
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
function getPath(node) { 

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

//prueba todo junto. No es este el problema.

/*
function listenBotResponse(page){
  return new Promise(function(resolve,reject){
    (async ()=>{

      try{  
        var result = await page.evaluate(function(processNodeDataStr,processBottomButtonsStr,getPathStr){//timestamp1){

          function processNodeData(unprocessedNode){
            var regExpEmojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
            if(!unprocessedNode){return [];}

            //if(unprocessedNode.querySelector("div[data-tooltip-position='right']")){return  [];} //ignoramos primer mensaje.
            var arrObjs = [];
            //si llega más de un mensaje en un nodo es porque el bot ha usado una plantilla para responder.

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
                var obj = {type: "sheetImage"};//,url: backImg.outerHTML.regex url };
                arrObjs.push(obj);
              }
            }
            //procesamos textos simples
            var messagesBoxes = unprocessedNode.querySelectorAll("div[message][body]"); //div[body] ??
            if(messagesBoxes){
              messagesBoxes.forEach((messageDiv)=>{
                //var messages = messageDiv.querySelectorAll("span:not([class])");
                //var messages2 = messageDiv.querySelectorAll("span[class]");
                var message = messageDiv.querySelector("div[aria-label]"); //antes messages
                //messages.forEach((message)=>{
                  if(message && (message.innerText || regExpEmojis.test(message.innerText))){ //igual hay mensajes que son únicamente un emoticono. (e.g un corazón)
                    var obj = {type: "text", message: message.innerText, emojiFlag: regExpEmojis.test(message.innerHTML)};
                    arrObjs.push(obj);
                  }   
                //});
                
              });
            }
            //procesamos textos de plantilla
            var messagesSheet = unprocessedNode.querySelectorAll("div[class='']");
            if(messagesSheet){
              messagesSheet.forEach((messageDiv)=>{
                if(messageDiv.innerHTML!==""){
                  var obj = {type: "text", message: messageDiv.innerText, emojiFlag: regExpEmojis.test(messageDiv.innerHTML)};
                  arrObjs.push(obj);
                } 
              });
            }
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

          function processBottomButtons(unprocessedNode){
            var regExpEmojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
            if(!unprocessedNode){return [];}
            var arrObjs = [];
            var bottomButtonsContainer = unprocessedNode.querySelector("div[currentselectedindex]");
            //console.log(bottomButtonsContainer);
            var bottomButtons = bottomButtonsContainer.querySelectorAll("div[role='button']");
            //console.log(bottomButtons);
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

          function getPath(node) { 

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
            //var ignoredMessages = 0; //En browser es necesario, puesto que llegan 2 que no necesitamos (tiempo y msg nuestro), en puppeteer llegan los útiles.
            var settedTimeouts = [];
            var timestamp1 = new Date();
            var botResponse = false;
            var mutationObserver = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                
                //if(ignoredMessages<2){
                //  ignoredMessages++;
                //}else{ //ignoramos hora en la que se ha enviado el mensaje y nuestro mensaje. // otra forma de ignorar primer mensaje.
                //if(mutation.addedNodes.length){ //ignoramos primer mensaje. NO VALE.
                  if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
                  insertedNodes = insertedNodes.concat(mutation.addedNodes[0]);
                  botResponse = true;
                  //var temporizer = setTimeout(()=>{
                    //TODO esto no hará que se pare en cuanto llegue primer mensaje? Comentado. cs en carpeta cs.
                    mutationObserver.disconnect();
                    try{
                      //console.log("nums: "+ insertedNodes.length); //para intentar solventar problema primer mensaje.
                      insertedNodes = insertedNodes.filter((node)=>{if(node){return node;}}); //eliminamos undefined s.
                      //console.log("nums2: "+ insertedNodes.length);
                      processedNodes = insertedNodes.map((node)=>{return processNodeData(node);});
                      //console.log("nums3: " + processedNodes.length);
                      processedNodes = processedNodes.filter((node)=>{if(node.length){return node;}});
                      //console.log("nums4: " + processedNodes.length);
                    }catch(err){
                      console.log("BIG PROBLEM");
                      console.log(err);
                    };
                    //console.log(processedNodes);
                    resolve({time: elapsedTime,nodes: processedNodes});
                    
                  //},7000);
                //}
              });
            });
            mutationObserver.observe(messagesBox, { childList: true });
            setTimeout(()=>{
              mutationObserver.disconnect(); 
              if(!botResponse){
                elapsedTime = 7000;
              }
              resolve({time: elapsedTime,nodes: processedNodes});
            },7000);
           
          });

          var promiseBottomButtons = new Promise(function(resolve,reject){
            try{
              var box = document.querySelector("div[role='presentation']");
              var closerBox = box.querySelector("div[class]"); //selecciona la primera capa que encuentra (la más exterior dentro de box).
              //console.log(closerBox._args);//TODO ver hmtl seleccionado...
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
                  bottomButtons =processBottomButtons(mutation.addedNodes[0],getPath);
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
                //console.log("Reached 7 secs ."); 
                mutationObserver.disconnect(); resolve({time: 7000,nodes: []});
              }
            },7000);
           
          });

          return Promise.all([
            promiseMessages,
            promiseBottomButtons
          ]);
        }, processNodeData.toString(), processBottomButtons.toString(), getPath.toString()); //helper functions, serialized.
      }catch(err){
        reject(err);
      }

      resolve(result);
      
    })();
  });
}
*/
