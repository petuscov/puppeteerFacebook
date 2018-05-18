"use strict";
const botInteractions = require("./botInteractions.js");
const connection = require("./connectionMySQL.js");

/**
 * Método para obtener el número de likes de un bot en facebook, y para saber si es un canal de ventas de una compañia.
 * Necesita que un usuario se haya conectado a facebook messenger previamente.
 * Realiza update en tabla bots mysql.
 **
 * @param  {String} botPageURL - url to the chatbottle bot page.
 * @param {Browser} browser - Puppeteer API Browser instance. (needed for new pages creation).
 */
function parseBotInfo(botPageURL,browser){
	return new Promise(function(resolve,reject){
		(async ()=>{
			var botPage = await browser.newPage(); 
		    await botPage.goto(botPageURL);

			var selectorToButtonMessengerBot = "html body main.container-fluid.main-wrapper.mytrips__general section#votingModelBinding.row div.col-lg-8.col-lg-offset-2.col-sm-10.col-sm-offset-1.col-xs-12 div.row.white-block.white-block--padding-45 div.col-xs-3.col-sm-4.col-md-3.chatbot__logo a.btn.button.hidden-xs";
			
			//var messengerPage = await botPage.target().page(); //bad way of copying.
			var messengerPage = await browser.newPage(); 
			await messengerPage.goto(botPage.url());
			
			
			var button = await messengerPage.$(selectorToButtonMessengerBot);
			/*
			var button = await messengerPage.$(selectorToButtonMessengerBot);
			await Promise.all([
				button.click(), //se situa cursor imaginario sobre el elemento y se hace click. 
				//(puede haber modal, mal posicionamiento del botón, (con screenshot no se captura, etc.))
				messengerPage.waitForNavigation()
			]).catch(()=>{});
			*/
			//await messengerPage.evaluate((el)=>{el.click();},button);	//tampoco funciona.	
			var messengerURL = await messengerPage.evaluate((el)=>{return Promise.resolve(el.outerHTML.split('href="')[1].split('">')[0]);},button);
			messengerURL = "https://chatbottle.co" + messengerURL;
			await Promise.all([
				messengerPage.goto(messengerURL),
				messengerPage.waitForNavigation()
			]).catch(()=>{});
			
			var botonStart = await messengerPage.$("a[href='#']:not([tabindex]):not([aria-label]):not([id]):not([role='button'])");
			if(botonStart){ //boton de iniciar conversacion, cuando está ya iniciada no aparece.
				await botonStart.click(); 
			}else{
				reject(botPageURL + " - conversation is already initialized... must be closed before processing.");
				return;
			}

			var id = await getIdBot(messengerPage);
			//var likesInMessenger = await getBotLikes(messengerPage).catch(()=>{});
			await botInteractions.closeCurrentBotConversation(messengerPage); //TODO NO ESTABA CERRADA LA CONVERSACION





			//var botname = messengerPage.url();
			//var botname = botname.split("https://www.messenger.com/t/")[1]; //no es siempre el nombre, a veces el id.
		
			await messengerPage.close();
			
			var tags = await botPage.$("#votingModelBinding > div > div:nth-child(5) > div.col-xs-9.col-sm-8.col-md-9 > div.category.hidden-xs").catch(()=>{
				console.log("no tags detected. tags object will be undefined or null.");
			});
			tags = await botPage.evaluate(element => element.innerText, tags);
			var likes = await botPage.$("span[title='Facebook likes']");
			var likes = await botPage.evaluate(outerHTML => outerHTML.innerText, likes);
			likes = likes.replace("\n","");
			likes = likes.replace("\n","");
			likes = likes.split(",").join("");
			if(likes!=="N/A"){
				likes = likes.split("");
				var multiplier = likes.pop(); //los usuarios con los que nos loguearemos deberán estar en inglés. 30K people likes this. (en castellano muestra: 'a 30 mil personas les gusta esto')
				likes = likes.join("");
				switch(multiplier){
					case "k": multiplier = 1000;break;
					case "m": multiplier = 1000000;break;
					default: multiplier = 1;break;
				}
			}
			likes = likes*multiplier;
			var finalLikes = likes || null;//likesInMessenger || likes || null;
			var eCommerce = tags.indexOf("E-Commerce") !== -1;
			
			await botPage.close();

			//update en bots mysql.
			console.log("Botid: "+id+", ecommerce: "+eCommerce+", Likes: "+ finalLikes);
			var data ={
				likes:finalLikes,
				chatbottleurl:botPageURL,
				ecommerce:eCommerce
			}
			await connection.saveBotInfo(id,data);
		

		    resolve();
		})();
	});
};

/**
 * Conversation must have been started previously.  
 **
 * @param  {Page} - Puppeteer API Page instance.
 **
 * @return {String} - Bot id.
 **
 */
function getIdBot(page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      var selectorBot;
      try{
      	await page.waitFor(200);
        selectorBot = await page.waitFor("div[id^='row_header_id_user']"); 
      }catch(e){
        console.log("conversation has not been initialized.");
        reject();
        return;
      }
      var idSelector = selectorBot._remoteObject.description.split('#')[1]; //convendría usar page.evaluate()...
      var idBot = idSelector.split(":")[1].split(".")[0];
      resolve(idBot);
    })();
  });
}

/**
 * Conversation must have been started previously.  
 **
 * @param  {Page} - Puppeteer API Page instance. (in facebook messenger).
 **
 * @return {String} - Bot id.
 **
 */
function getBotLikes(page){
  return new Promise(function(resolve,reject){
    (async ()=>{
      var boxBotInfo;
      try{
        boxBotInfo = await page.$("div[direction='left']"); 
      }catch(e){
        console.log("something went wrong when identificating bot likes.");
        reject();
        return;
      }
      boxBotInfo = await page.evaluate(boxInfo => boxInfo.innerText, boxBotInfo);
      var infoLikes = boxBotInfo.split("\n")[2]; //salto de linea, nombre bot, nro likes.
      var likes = infoLikes.split(" ")[0];
      likes = likes.split("");
      var multiplier = likes.pop(); //los usuarios con los que nos loguearemos deberán estar en inglés. 30K people likes this. (en castellano muestra: 'a 30 mil personas les gusta esto')
      likes = likes.join("");
      switch(multiplier){
      	case "K": multiplier = 1000;break;
      	case "M": multiplier = 1000000;break;
      	default: multiplier = 1;break;
      }
      likes = likes*multiplier;
      resolve(likes);
    })();
  });
}

module.exports = {
  parseAllBots: parseAllBots,
  parseBotInfo : parseBotInfo,
  getTop100: getTop100,
  getIdBot: getIdBot,
  getBotLikes: getBotLikes
}