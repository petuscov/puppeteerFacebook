"use strict";

const puppeteer = require("puppeteer");
const credentials = require("./credentials.js");
const botInteractions = require("./botInteractions.js");
const botsNames = require("./botsNames.js");
//const connection = require("./connectionMySQL.js");
const parser = require("./parser.js");
const analyzer = require("./analyzer.js");

/**
 * File designed to be executed as a terminal script, bot information will be printed to console. 
 * (Example usage: node mainAnalyzer.js victoriassecret OR npm run analysis victoriassecret)
 *
 * TODO PONER MÁS BONITO: COLORES, BARRAS, CHECKS VERDES, AYUDA CON LOS PARÁMETROS NECESARIOS ANTE MAL USO 
 *O COMANDO -HELP -H  https://github.com/nathanpeck/clui 
 */
if(process.argv.length>=3){
  if(process.argv.length>3){
    console.log("Detected two arguments or more.");
    console.log("Just first argument will be used, it must be the bot id/name in facebook messenger.");
  }
  var results = analyzer.analyzeBot(process.argv[2]); //doesnt save results in db.
  printResults(results); 
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