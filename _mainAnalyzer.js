"use strict";
require('dotenv').config();
const puppeteer = require("puppeteer");
//const credentials = require("./credentials.js");
//const botInteractions = require("./botInteractions.js");
//const botsNames = require("./botsNames.js");
const mySQLconnection = require("./_connectionMySQL.js");
//const parser = require("./parser.js");

const events = require('events');
const eventsReceiver = new events.EventEmitter();
const analyzer = require("./_analyzer.js")(eventsReceiver);
var CLI = require('clui'),
  Spinner = CLI.Spinner,
  Line = CLI.Line;

/**
 * File designed to be executed as a terminal script, bot information will be printed to console. 
 * (Example usage: node mainAnalyzer.js victoriassecret OR npm run analysis victoriassecret)
 *
 */
if(process.argv.length>=3){
  if(process.argv.length>3){
    console.log("Detected two arguments or more.");
    console.log("Just first argument will be used, it must be the bot id/name in facebook messenger."); //TODO incluir enlace a pagina wiki con captura con messenger bot name
  }

  var progress = new Spinner('Analysis in progress...  ', ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
  progress.start();
  eventsReceiver.on('update',(data)=>{
    

    if(typeof(data)==='number'){data = "msg time";}
    progress.message('Analysis in progress... Info about ' + data +' processed.           ');
  });

  (async function(){
    var results = await analyzer.analyzeBot(process.argv[2]); 
    progress.stop();

    //TODO guardado en mysql en función de parámetro. (e.g --save)
    await mySQLconnection.checkBotsTable();
    await mySQLconnection.saveBotInfo(results);
    mySQLconnection.endConnection();
    
    printResults(results);
    return;
  })();
  return;
}else{
  console.log("Specify name or id of bot to analyze."); //TODO incluir enlace a pagina wiki con captura con messenger bot name
  process.exit();
}

/**
 * Prints bot analysis information.
 * @param  {object} results 
 *    @param  {object} results.basicInfo 
 *       @param  {string} results.basicInfo.name - bot name in facebook messenger
 *       @param  {string} results.basicInfo.id - bot id in facebook messenger
 *       @param  {number} results.basicInfo.likes - bot likes in facebook messenger
 *    @param  {Array[object]} results.messages
 *       @param  {string} results.messages[i].message - message sent to bot
 *       @param  {number} results.messages[i].time - time bot took to respond message
 *    @param  {object} results.emojis
 *       @param  {number} results.emojis.numYes - number of bot responses that contained an emoji
 *       @param  {number} results.emojis.numNo - number of bot responses that didnt contain an emoji
 *    @param  {object} results.multimedia
 *       @param  {number} results.multimedia.numYes - number of multimedia bot responses (image,audio,video) 
 *       @param  {number} results.multimedia.numNo - number of bot responses that werent multimedia
 *    @param  {object} results.reviewedFeatures
 *       @param  {boolean} results.reviewedFeatures.variation - bot changes responses against same input.
 *       @param  {boolean} results.reviewedFeatures.buttonEquivalent - bot accept both button press and button message.
 *       @param  {boolean} results.reviewedFeatures.helpCommand - bot has a help command and is useful.
 *       @param  {boolean} results.reviewedFeatures.initialButton - bot has an initial button (Get Started).
 *       @param  {boolean} results.reviewedFeatures.admitVariations - bot recognises misspelled messages.
 *       @param  {boolean} results.reviewedFeatures.initialMsgUseful - bot's initial message is useful.
 */
function printResults(results){
  console.log("\n\n");
  for(var key in results){
    console.log(key + ":");
    if(results[key].length>=0){//array.
      var time = 0;
      for(var i=0;i<results[key].length;i++){
        time+=results[key][i].time;
      }
      var avgTime = time/results[key].length;
      avgTime= avgTime.toFixed(2);
      console.log("   average response time: "+avgTime+ " over "+ results[key].length+" messages.");
    }else{
      for(var data in results[key]){
        console.log("   "+data + ":" + results[key][data]);

      }
    }
  }
}