"use strict"; //><

const puppeteer = require("puppeteer");
const credentials = require("./credentials.js");
const botInteractions = require("./botInteractions.js");
//const regExpEmojis = require("./helper.js").regExpEmojis;
(async () => {

  const browser = await puppeteer.launch({
    executablePath:"./node_modules/chromium/lib/chromium/chrome-linux/chrome",//
    headless: true//
  });
  const page = await browser.newPage(); 
  page.on('console', console.log); //Para poder hacer console.log dentro de .evaluate()
  /*var cookies = await page.cookies('https://www.messenger.com/login.php');
  console.log(cookies);
  cookies.forEach(function(element,index){
    (async () => {
      await page.deleteCookie(element.name);
    })();
  });*/ 
  await page.goto('https://www.messenger.com/login.php'); //si ya se ha logeado previamente no encuentra nodo email. ¿eliminamos cookies previamente para esto? No se solventa.

  await page.click("#email"); //no debe haber ningún usuario ya logeado.
  await page.keyboard.type(credentials.username);
  await page.click('#pass'); 
  await page.keyboard.type(credentials.password);

  const [response] = await Promise.all([
    await page.click('#loginbutton'),
    await page.waitForNavigation()
  ]);

  /*//Now we are logged and we can do:
  var idNBA = 8245623462;
  var idBot = idNBA;
  await page.goto('https://www.messenger.com/t/'+idBot).catch(error => console.log(error));*/

  //get id of certain bot
  //SOLO PUEDE/DEBE ESTAR UNA CONVERSACIÓN ACTIVA. (Como cerrar las demás)


  var botName = "WSL";
  await page.screenshot({path: 'initialCap.png'});
  
  var idBot = await getIdBot(botName,page);
  console.log(idBot);
  //await page.screenshot({path: 'conv.png'});

  //await page.screenshot({path: 'archivedConv.png'});
  
  var arrayMessagesUnprocessed = await writeMessage(page,"holis");
  /*.then((res)=>{
    console.log(res.time);
    res.nodes.forEach(function(element){
      console.log(element);
    });
    return res;
  });*/
  var arrBotones = [];
  var arrPaths = [];
  arrayMessagesUnprocessed.nodes[0].forEach(function(element){ // [0] importante.
    if(element.type === "button"){
      arrPaths.push(element.path); 
      console.log("YAY");
    }
  });
  if(arrPaths.length){
    var boton = await page.$(arrPaths[0]);
    await page.screenshot({path: 'buttonNotPressed.png'});
    await boton.click();
  }
 
  //TODO.: guardar el tiempo junto el mensaje que ha originado la respuesta, para reflejarlos juntos. (distinguir ante que mensajes se tarda más).

 

  //await closeCurrentBotConversation(page);
  browser.close();

})();



function saveBotDataScript(botName,connectedPage){
  (async ()=>{
    await botInteractions.startBotConversation(botName,connectedPage);
    await botInteractions.getIdBot(botName,connectedPage);
    await botInteractions.closeCurrentBotConversation(connectedPage);
  })();
}