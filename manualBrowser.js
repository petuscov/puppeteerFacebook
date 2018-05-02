//pruebas recepción mensajes en navegador.

var a = new Promise(function(resolve,reject){

        var regExpEmojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
        //TODO cuando imagen simple se obtiene repetida, (1 correcta y otra por background)
        function processNodeData(unprocessedNode){
          if(!unprocessedNode){return [];}
          var arrObjs = [];
          /*si llega más de un mensaje ó botón en un nodo es porque el bot ha usado una plantilla para responder.*/

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
            var message = messageDiv.querySelector("span:not([class])");
        		if(message && (message.innerText || regExpEmojis.test(message.innerText))){ //igual hay mensajes que son únicamente un emoticono. (e.g un corazón)
              var obj = {type: "text", message: message.innerText, emojiFlag: regExpEmojis.test(message.innerHTML)};
              arrObjs.push(obj);
            }   
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

        function getBottomButtons(unprocessedNode){
          if(!unprocessedNode){return [];}
          var arrObjs = [];
          var bottomButtonsContainer =  unprocessedNode.querySelector("div[currentselectedindex]");
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
        var promiseMessages =  new Promise(function(resolve,reject){
          
          var box = document.querySelector("div[role='presentation']");
          var closerBox = box.querySelector("div[role='region']");
          var messagesBox = closerBox.querySelector("div[id]");
          var elapsedTime;
          var insertedNodes = [];
          var processedNodes = [];
          //var firstMessage = false;
          var settedTimeouts = [];
          var timestamp1 = new Date();

          var mutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {

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
                //});
              //}
            });
          });
          mutationObserver.observe(messagesBox, { childList: true });
          setTimeout(()=>{
            if(settedTimeouts.length===0){
              console.log("reached 30secs.");
              try{
                processedNodes = insertedNodes.map((node)=>{return processNodeData(node)});       
              }catch(err){
                console.log(err);
              };
              mutationObserver.disconnect(); resolve({time: 30000,nodes: processedNodes});
            }
          },30000);
         
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
              console.log("reached 30secs."); //TODO hay que ponerse en el caso en el que nos llega sólo bottomButtons?? y texto y bottombuttons. (ponernos en el caso temporalmente hablando. (una vez que llege uno de los 2 esperar hasta 3 secs a otro..))
              mutationObserver.disconnect(); resolve({time: 30000,nodes: []});
            }
          },30000);
         
        });

    Promise.all([promiseMessages,promiseBottomButtons]).then((res)=>{resolve(res);}).catch(()=>{reject();});
      
  });





///////


var a = new Promise(function(resolve,reject){

  var regExpEmojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  //TODO cuando imagen simple se obtiene repetida, (1 correcta y otra por background)
  function processNodeData(unprocessedNode){
    var arrMsgs = [];

    //TODO detectar pseudo "está escribiendo" (puntos suspensivos).
   

    var divs = unprocessedNode.querySelectorAll("div[class^='clearfix']");
    for(var i=0;i<divs.length;i++){
      var processed = processDivData(divs[i]);
      if(processed.length){
        arrMsgs.push(processed);  
      }
    }
    return arrMsgs;
  }

  function processDivData(unprocessedNode){
    if(!unprocessedNode){return [];}
    if(unprocessedNode.querySelector("div[data-tooltip-position='right']")){return  [];} //ignoramos primer mensaje.
    var arrObjs = [];
    /*si llega más de un mensaje ó botón en un nodo es porque el bot ha usado una plantilla para responder.*/

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


    //procesamos textos simples
    /*
    var messagesBoxes = unprocessedNode.querySelectorAll("div[body]");//"div[message][body]"); //LO HAN CAMBIADO?!
    messagesBoxes.forEach((messageDiv)=>{


      var message = messageDiv.querySelector("span:not([class])"); //Lo han cambiado... con esto se recoge el primero. TODOTODO.
      //TODO a veces tienen clase, otras no, cuando no tienen a veces hay spans previos sin texto...
      
      if(message && (message.innerText || regExpEmojis.test(message.innerText))){ //igual hay mensajes que son únicamente un emoticono. (e.g un corazón)
        var obj = {type: "text", message: message.innerText, emojiFlag: regExpEmojis.test(message.innerHTML)};
        arrObjs.push(obj);
      } 

    });
    */
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
    //TODO guardar el enlace a página externa? añadir al objeto.
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

  function getBottomButtons(unprocessedNode){
    if(!unprocessedNode){return [];}
    var arrObjs = [];
    var bottomButtonsContainer =  unprocessedNode.querySelector("div[currentselectedindex]");
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
  var promiseMessages =  new Promise(function(resolve,reject){
    
    var box = document.querySelector("div[role='presentation']");
    var closerBox = box.querySelector("div[role='region']");
    var messagesBox = closerBox.querySelector("div[id]");
    var elapsedTime;
    var insertedNodes = [];
    var processedNodes = [];
    var timestamp1 = new Date();
    var message = false;
    var mutationObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
      
      if(mutation.addedNodes.length && mutation.addedNodes[0]){ 
        
        if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
        //console.log(mutation); //tenemos nuestro mensaje (se filtra al procesar node data.)
        insertedNodes = insertedNodes.concat(mutation.addedNodes[0]); 
        message = true;
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
      }else{
        console.log(mutation);
      }
      });
    });
    mutationObserver.observe(messagesBox, { childList: true });
    setTimeout(()=>{
      if(!message){
        console.log("reached 15secs.");
        mutationObserver.disconnect(); resolve({time: 15000,nodes: []});
      }
    },15000);
   
  });

  var promiseBottomButtons = new Promise(function(resolve,reject){
    
    var box = document.querySelector("div[role='presentation']");
    var closerBox = box.querySelector("div[class]"); //selecciona la primera capa que encuentra (la más exterior dentro de box).
    var elapsedTime;
    var insertedNodes = [];
    var processedNodes = [];
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
        console.log("reached 15secs."); //TODO hay que ponerse en el caso en el que nos llega sólo bottomButtons?? y texto y bottombuttons. (ponernos en el caso temporalmente hablando. (una vez que llege uno de los 2 esperar hasta 3 secs a otro..))
        mutationObserver.disconnect(); resolve({time: 15000,nodes: []});
      }
    },15000);
   
  });

  Promise.all([promiseMessages,promiseBottomButtons]).then((res)=>{
    console.log(res);
    //resolve(res); 
  }).catch(()=>{reject();});
    
});