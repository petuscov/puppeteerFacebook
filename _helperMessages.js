"use strict";

/**
 * Get text of a bot message response.
 **
 * @return {string} - text - all text concated of simple texts of bot responses.
 */
function getText(botResponse){
  var text = "";
  for(var node in botResponse[0].nodes){
    if(node.type === 'text'){
      text+=node.message;
      text+='\n'; 
    }
  }
  return text;
}

/**
 * Get buttons of a bot message response.
 **
 * @return {string} - text - all text concated of simple texts of bot responses.
 */
function getButtons(botResponse){
  var buttons = [];
  for(var node in botResponse[0].nodes){
    if(node.type === 'button'){
      buttons.push(node);
    }
  }
  for(var node in botResponse[1].nodes){
    if(node.type === 'button'){
      buttons.push(node);
    }
  }
  return buttons;
}


/**
 * Get if a bot message response contains emojis (either in text or in buttons received).
 **
 * @return {boolean} - emojis
 */
function containsEmojis(botResponse){
  var containsEmojis = false;
  for(var node in botResponse[0].nodes){
    if(node.emojiFlag){
      containsEmojis = true; 
    }
  }
  for(var node in botResponse[1].nodes){
    if(node.emojiFlag){
      containsEmojis = true; 
    }
  }
  return containsEmojis;
}

/**
 * Get if a bot message response contains image, video, audio.
 **
 * @param  {object} botResponse - object returned by listenBotResponse.
 * @return {boolean} - multimedia - true if image, video, audio. (TODO test for videos, audios, gifs.)
 */
function containsMultimedia(botResponse){
  var multimedia = false;
  for(var node in botResponse[0].nodes){
    if(node.type === 'image' || node.type === 'sheetImage'){ //TODO add video, audio
      multimedia = true; 
    }
  }
  return multimedia;
}

//// Heurísticos ////

/**
 * TODO add description
 */
function checkInitialMsgUseful(initialMsg,buttons){
  if(buttons){ return true;} //si bot nos devuelve botones automáticamente identificamos respuesta help como útil.
  if(initialMsg.length>40 && initialMsg.length<800){
    var arrKeywords = ["help","menu","button","menu","list"];
    var foundKeyword = false;
    arrKeywords.forEach(function(keyword){
      if(initialMsg.includes(keyword)){
        foundKeyword = true;
      }
    });
    if(foundKeyword){
      return true;
    }
  }
  return false;
}

//TODO se puede tambien comprobar si se reciben botones... Muy util, actualmente dice dominos init msg not useful cuando si que es (tiene botones útiles.)
function checkHelpCommandUseful(helpCommandResponse,randomMsgsResponses,buttons){
  if(buttons){ return true;} //si bot nos devuelve botones automáticamente identificamos respuesta help como útil.
  var helpCommandRecognised = true;
  randomMsgsResponses.forEach(function(randomMsgMessage){
    if(randomMsgMessage==helpCommandResponse){
      helpCommandRecognised = false;
    }
  });
  if(!helpCommandRecognised) return false;
  if(helpCommandResponse.length>40 && helpCommandResponse.length<800){
    var arrKeywords = ["tap","press","write","type","command"];
    var foundKeyword = false;
    arrKeywords.forEach(function(keyword){
      if(helpCommandResponse.includes(keyword)){
        foundKeyword = true;
      }
    });
    if(foundKeyword){
      return true;
    }
  }
  return false;
}

/**
 * TODO add description
 */
function checkVariations(arrMsgs){
  var variation = false;
  for(var i =0;i<arrMsgs.length-1 && !variation;i++){
    for(var j=i+1;j<arrMsgs.length && !variation;j++){
      console.log(arrMsgs[i] +""+arrMsgs[j]);
      if(arrMsgs[i]!=arrMsgs[j]){
        variation = true;
      }
    }
  }
  return variation;
}

/**
 * UTIL METHODS
 */

function randomString(size){
  var word = "";
  for(var i=0;i<size;i++){
    word+=String.fromCharCode(97 + Math.floor(Math.random()*26,1));
  }
  return word;
}

module.exports = {
  getText:getText,
  containsEmojis:containsEmojis,
  containsMultimedia:containsMultimedia,
  checkInitialMsgUseful : checkInitialMsgUseful,
  checkHelpCommandUseful : checkHelpCommandUseful,
  randomString : randomString,
  checkVariations: checkVariations,
  getButtons: getButtons
}