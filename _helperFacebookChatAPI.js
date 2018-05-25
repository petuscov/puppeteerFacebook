"use strict";

const loginAPI = require("facebook-chat-api");
const credentials = require("./credentials.js");
const arrUsers = require("./credentials.js").arrUsers;
const botInteractions = require("./botInteractions.js");
const botsNames = require("./botsNames.js");

//const connection = require("./connectionMySQL.js");


//const parser = require("./parser.js"); needs puppeteer.

var data = {
  basicInfo:{
    //"name": "McDonalds", //cant get this with just facebook-chat-api (puppeteer needed).
    "id": "092183740928374",
    //"likes": "23000000" // same.
  },
  messages : [],
  "emojis":{
    "numYes": 0,
    "numNo": 0
  },
  "multimedia":{ //can be recognised????
    "numYes": 0,
    "numNo": 0
  },
  "reviewedFeatures":{
    "variation":false,
    //"buttonEquivalent":false, //cant be checked with just facebook-chat-api (puppeteer needed).
    "helpCommand":false,
    //"initialButton":false, //same.
    "admitVariations":false,
    "initialMsgUseful":false
  }
}

/**
 * MAIN FUNCTION.
 * @param  {object}
 *    @param  {String} email
 *    @param  {String} password
 */

/*
loginAPI({email: arrUsers[0].username, password: arrUsers[0].password}, async (err, api) => {
  if(err) return console.error(err);
 
  var botID = "79775744089"; //victoriassecret //si introducimos id erróneo supongo que se devolverá promesa rechazada.
   //en web si se intenta acceder a id erróneo se muestra pantalla error, no funciona (500).


  await init(botID,api); //Enviamos 'Get started' a bot.
  var responses = await getRandomMessages(botID,api); //Enviamos 3 mensajes aleatorios y guardamos respuestas en array.
  await waitPromise(2000);
  await checkHelpCommand(botID,api,responses);

  //TODO check variations.

  var today = new Date(); 
  var timestampDay = ""; timestampDay=timestampDay+today.getFullYear();
  timestampDay=timestampDay+"-"+(today.getMonth()+1);
  timestampDay=timestampDay+"-"+today.getDate();
  console.log(timestampDay);
  console.log("help command:" + data.reviewedFeatures.helpCommand);
  console.log("initial msg useful:" + data.reviewedFeatures.initialMsgUseful);
  for(var i=0;i<data.messages.length;i++){
    console.log("msg: " + data.messages[i].message+", time: "+ data.messages[i].time);
  }
  return;
});
*/

/**
 * Funciones, convendría refactorizar.
 */

/**
 * init function, sends message getStarted to bot.
 */
function init(botID,api){
  return new Promise(function(resolve,reject){
    var msgInfo = "Get started";
    var msg = {body: msgInfo };
    var time = new Date();
    api.sendMessage(msg, botID);
    api.listen((err, event) => {  
      if (err) {
        console.log("err: "+err);
      } else if (event.type === 'message') {
        if (event.body) {
          var elapsedTime = (new Date() -time)/1000; 
          var newMsg = {message: msgInfo, time: elapsedTime};
          data.messages.push(newMsg);
          //Analizamos event.body para saber si reconoce comando help y la respuesta es útil con heurísticos.
          var initialMsgUseful = checkInitialMsgWorth(event.body);
          data.reviewedFeatures.initialMsgUseful = initialMsgUseful;
          resolve();
        }
      } else {
        console.log("Ignored. Event type unhandled: "+ event.type);
        console.log("Maybe multimedia messages number should be updated?");
        resolve();
      }
    });
  });
}


function checkHelpCommand(botID,api,randomMsgResponses){
  return new Promise(function(resolve,reject){
    var msgInfo = "help";
    var msg = {body: msgInfo };
    var time = new Date();
    api.sendMessage(msg, botID);
    api.listen((err, event) => {  
      if (err) {
        console.log("err: "+err);
      } else if (event.type === 'message') {
        if (event.body) {
          var elapsedTime = (new Date() -time)/1000; 
          var newMsg = {message: msgInfo, time: elapsedTime};
          data.messages.push(newMsg);
          
          //comprobamos si se reconoce el comando help y la respuesta es útil
          var helpCommandUseful = checkHelpCommandUseful(event.body,randomMsgResponses);
          data.reviewedFeatures.helpCommand = helpCommandUseful;
          resolve();
        }
      } else {
        console.log("Ignored. Event type unhandled: "+ event.type);
        console.log("Maybe multimedia messages number should be updated?");
        resolve();
      }
    });
  });
}

function getRandomMessages(botID,api){
  return new Promise(function(resolve,reject){
    var responses = [];
    var promise = Promise.resolve();
    for(var i=0;i<3;i++){ 
      promise = promise.then(function(){
        waitPromise(2000);
      });
      promise = promise.then(function(){
        return new Promise(function(resolve,reject){
          var msgInfo = randomString(7);
          var msg = {body: msgInfo};
          var time = new Date();
          api.sendMessage(msg, botID);
          api.listen((err, event) => {  
            if (err) {
              console.log("err: "+err);
            } else if (event.type === 'message') {
              if (event.body) {
                var elapsedTime = (new Date() -time)/1000; 
                var newMsg = {message: msgInfo, time: elapsedTime};
                data.messages.push(newMsg);
                responses.push(event.body);
                resolve();
              }
            } else {
              console.log("Ignored. Event type unhandled: "+ event.type);
              console.log("Maybe multimedia messages number should be updated?");
            }
          });
        });
      })
    }
    promise.then(function(){
      resolve(responses);
    });
  });
}

function checkAdmitsVariations(botID,api){
  var msgInfo = "hepl";
  var msg = {body: msgInfo };
  var time = new Date();
  api.sendMessage(msg, botID);
  api.listen((err, event) => {  
    if (err) {
      console.log("err: "+err);
    } else if (event.type === 'message') {
      if (event.body) {
        var elapsedTime = (new Date() -time)/1000; 
        var newMsg = {message: msgInfo, time: elapsedTime};
        data.messages.push(newMsg);
        //TODO procesar event.body para saber si reconoce comando help. heurísticos.
        event.body
      }
    } else {
      console.log("Ignored. Event type unhandled: "+ event.type);
      console.log("Maybe multimedia messages number should be updated?");
    }
  });
  var msgInfo = "helpp";
  var msg = {body: msgInfo };
  var time = new Date();
  api.sendMessage(msg, botID);
  api.listen((err, event) => {  
    if (err) {
      console.log("err: "+err);
    } else if (event.type === 'message') {
      if (event.body) {
        var elapsedTime = (new Date() -time)/1000; 
        var newMsg = {message: msgInfo, time: elapsedTime};
        data.messages.push(newMsg);
       
      }
    } else {
      console.log("Ignored. Event type unhandled: "+ event.type);
      console.log("Maybe multimedia messages number should be updated?");
    }
  });
}

function checkVariations(botID,api){ //TODO incluir estos mensajes que se van a repetir en el gráfico de tiempos?
  var msgInfo = "amazing";
  var msg = {body: msgInfo };
  var time = new Date();
  api.sendMessage(msg, botID);
  api.listen((err, event) => {  
    if (err) {
      console.log("err: "+err);
    } else if (event.type === 'message') {
      if (event.body) {
        var elapsedTime = (new Date() -time)/1000; 
        var newMsg = {message: msgInfo, time: elapsedTime};
        data.messages.push(newMsg);
        //TODO procesar event.body para saber si reconoce comando help. heurísticos.
        var initialMsgUseful = checkInitialMsgWorth(event.body);
        //data.
      }
    } else {
      console.log("Ignored. Event type unhandled: "+ event.type);
      console.log("Maybe multimedia messages number should be updated?");
    }
  });
  var msgInfo = "amazing";
  var msg = {body: msgInfo };
  var time = new Date();
  api.sendMessage(msg, botID);
  api.listen((err, event) => {  
    if (err) {
      console.log("err: "+err);
    } else if (event.type === 'message') {
      if (event.body) {
        var elapsedTime = (new Date() -time)/1000; 
        var newMsg = {message: msgInfo, time: elapsedTime};
        data.messages.push(newMsg);
        //TODO procesar event.body para saber si reconoce comando help.. heurísticos.
        event.body
      }
    } else {
      console.log("Ignored. Event type unhandled: "+ event.type);
      console.log("Maybe multimedia messages number should be updated?");
    }
  });
}


/**
 * UTIL METHODS
 */
function checkInitialMsgWorth(initialMsg){
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
 * UTIL METHODS
 */
function checkHelpCommandUseful(helpCommandResponse,randomMsgsResponses){
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

function randomString(size){
  var word = "";
  for(var i=0;i<size;i++){
    word+=String.fromCharCode(97 + Math.floor(Math.random()*26,1));
  }
  return word;
}

function waitPromise(time){
  return new Promise(function(resolve,reject){
    setTimeout(resolve(),time);
  });
}

module.exports = {
  
}