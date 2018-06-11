"use strict";

/**
 * Get text of a bot message response.
 **
 * @return {string} - text - all text concated of simple texts of bot responses.
 */
function getText(botResponse){
  var text = "";
  var arrNodes =  botResponse[0].nodes;
  for(var i =0; i < arrNodes.length; i++){
    for(var index in arrNodes[i]){
      var node = arrNodes[i][index];
      if(node.type === 'text'){
        text+=node.message;
        text+='\n'; 
      }
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
  var arrNodes =  botResponse[0].nodes;
  for(var i =0; i < arrNodes.length; i++){
    for(var index in arrNodes[i]){
      var node = arrNodes[i][index];
      if(node.type === 'button'){
        buttons.push(node);
      }
    }
  }
  var arrNodesButtons = botResponse[1].nodes; 
    for(var i =0; i < arrNodesButtons.length; i++){
      var node = arrNodesButtons[i];
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
  var arrNodes =  botResponse[0].nodes;
  for(var i =0; i < arrNodes.length; i++){
    for(var index in arrNodes[i]){
      var node = arrNodes[i][index];
      if(node.emojiFlag){
        containsEmojis = true; 
      }
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
  var arrNodes =  botResponse[0].nodes;
  for(var i =0; i < arrNodes.length; i++){
    for(var index in arrNodes[i]){
      var node = arrNodes[i][index];
      if(node.type === 'image' || node.type === 'sheetImage' || node.type === 'video' || node.type === 'audio'){
        multimedia = true; 
      }
    }
  }
  return multimedia;
}

//// Heurísticos ////

/**
 * Indicates if the initial message is useful. for that, it makes use of heuristics.
 **
 * @param  {String} helpCommandResponse - the text response given by bot in initial message. 
 * @param  {[{Object}]} buttons - Array with the object received in response in initial message.
 **
 * @return {boolean} - Indicates if the help command is recognised and useful.
 */
function checkInitialMsgUseful(initialMsg,buttons){
  if(buttons.length){ return true;} //si bot nos devuelve botones automáticamente identificamos respuesta help como útil.
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

/**
 * Indicates if the help command is useful. for that, it makes use of heuristics.
 **
 * @param  {String} helpCommandResponse - the text response given by bot against 'help' command. 
 * @param  {[String]} randomMsgsResponses - Array of the random responses given by bot against random text messages.
 * @param  {[{Object}]} buttons - Array with the object received in response against 'help' command.
 **
 * @return {boolean} - Indicates if the help command is recognised and useful.
 */
function checkHelpCommandUseful(helpCommandResponse,randomMsgsResponses,buttons){
  if(buttons.length){ return true;} //si bot nos devuelve botones automáticamente identificamos respuesta help como útil.
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
 * Identifies if there are 2 strings different in an array.
 **
 * @param  {[String]} arrMsgs - array of responses given by bot against same message.
 **
 * @return {[Boolean]} - indicates if at least 2 of the responses are different.
 */
function checkVariations(arrMsgs){
  var variation = false;
  for(var i =0;i<arrMsgs.length-1 && !variation;i++){
    for(var j=i+1;j<arrMsgs.length && !variation;j++){
      if(arrMsgs[i]!=arrMsgs[j]){
        variation = true;
      }
    }
  }
  return variation;
}

/**
 * Indicates if a bot can understand messages when they have typos. With one of the typos recognised as the correct 
 * message, this returns true.
 **
 * @param  {[String]} arrMsgsTypos - array of responses given by each typo.
 * @param  {[String]} arrMsgsCorrects - array of responses given by the bot against the correct message 
 *                                    of which we are testing typos now.
 **
 * @return {boolean} - indicates if at least one typo has been identified.
 */
function checkAdmitsTypos(arrMsgsTypos,arrMsgsCorrects){
  var understood = false;
  for(var i =0;i<arrMsgsTypos.length && !understood;i++){
    for(var j=0;j<arrMsgsCorrects.length && !understood;j++){
      if(arrMsgsTypos[i]===arrMsgsCorrects[j]){
        understood = true;
      }
    }
  }
  return understood;
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
  getButtons: getButtons,
  checkAdmitsTypos:checkAdmitsTypos
}