"use strict";
const mysqlManager = require('./../_connectionMySQL.js');

var data = {
  basicInfo:{//V
    "name": "bambino", 
    "id": "435678",
    "likes": 4 
  },
  respond:true,
  messages : [], //still not saved. //interesante guardar la respuesta junto con el mensaje que la origina...
  "emojis":{ 
    "numYes": 0, 
    "numNo": 0 
  },
  "multimedia":{ 
    "numYes": 0,
    "numNo": 0 
  },
  "reviewedFeatures":{
    "initialButton":false, 
    "initialMsgUseful":true,
    "helpCommand":false, 
    "variation":true, //con porcentaje, 3 pruebas diferentes, en random, en hello, en goodbye...
    "typosHandled":false, //con porcentaje, 3 pruebas diferentes, en random, en hello, en goodbye...
    "buttonEquivalent":true, 
	}
};

(async function(){
	await mysqlManager.checkBotsTable();
	await mysqlManager.saveBotInfo(data);
	mysqlManager.endConnection();
})();
