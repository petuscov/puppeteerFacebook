"use strict";
const puppeteer = require("puppeteer");
const helperPuppeteer = require("./_helperPuppeteer.js");

const credentials = require("./credentials.js");

(async function(){


  const browser = await puppeteer.launch({
      executablePath:"./node_modules/chromium/lib/chromium/chrome-linux/chrome",//
      headless: true//
    });
  const page = await browser.newPage(); 

  await helperPuppeteer.loginWithUser(credentials.arrUsers[0].username,credentials.arrUsers[0].password,page);
  await helperPuppeteer.closeAllBotConversations(page); 
  var nameOrId = 'dominos';
  try{
    await helperPuppeteer.startBotConversation(nameOrId,page);
  } catch (err) {
    await helperPuppeteer.writeMessage(page, "Get started"); 
  }
  var response = await helperPuppeteer.listenBotResponse(page); //30 secs limit exceeded.
  var elapsedTime = (response[0].time > response[1].time) ? response[1].time : response[0].time; 
  var newMsg = {message: "Get started", time: elapsedTime};
  console.log(newMsg);
  var normalMsgs = response[0];
  var bottomButtons = response[1];
  console.log(normalMsgs);
  console.log(bottomButtons);
  /*
  for(var node in normalMsgs.nodes){
    for(var index in normalMsgs.nodes[node]){
      var objectInformation = normalMsgs.nodes[node][index];
      for(var key in objectInformation){
        if(key!=="path"){
          console.log(objectInformation[key]);
        }
      }
    }
  }
  for(var node in bottomButtons.nodes){
    //console.log(bottomButtons.nodes[node]);
    for(var key in bottomButtons.nodes[node]){
      if(key!=="path"){
        console.log(bottomButtons.nodes[node][key]);  
      }
    }
  }*/
  console.log("fué");
  return;
})();








