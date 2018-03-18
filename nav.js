//copia para navegador. TODO Revisar concat, (array con NodeList mal.) Revisar marca de tiempo, con cronómetro da 2.66 ~ 3s en responder. 

var box = document.querySelector("div[role='presentation']");
var closerBox = box.querySelector("div[role='region']");
var messagesBox = closerBox.querySelector("div[id]");
var insertedNodes = []; 
var firstMessage = false;
var settedTimeouts = [];
var timestamp1 = new Date();
var elapsedTime;
var mutationObserver = new MutationObserver(function(mutations) {
  	mutations.forEach(function(mutation) {
	    if(!firstMessage){
	      	if(mutation.addedNodes.length===1 && mutation.addedNodes[0].nodeName === "DIV"){firstMessage=true;} // >= 1 ó === 1 ? 
	    }else{
	    	if(mutation.addedNodes.length===1 && mutation.addedNodes[0].nodeName === "DIV"){ //ignoramos el nodo fecha. (nodeName 'H4')
		      if(!elapsedTime){var elapsedTime = (new Date()-timestamp1)/1000;} //referencia temporal primer mensaje devuelto por el bot.
		      var nodes = mutation.addedNodes; //nodes - NodeList
		      insertedNodes = insertedNodes.concat(mutation.addedNodes[0]);
		      var temporizer = setTimeout(()=>{
		        if(settedTimeouts.length === 1){
		          mutationObserver.disconnect();
		          console.log({time: elapsedTime,nodes: insertedNodes});//resolve();
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
    mutationObserver.disconnect(); console.log({time: 30000,nodes: insertedNodes}); //resolve();
  }
},30000);
//TODO falta reconocer botones al pie de la conversación.
