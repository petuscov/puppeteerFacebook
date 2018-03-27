'use strict'

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'root',
  database : 'messengerbots'
});

/*var options = {
  encoding: 'utf8'
};*/

/**
 * saves message sent to bot, and the time it takes to respond it. (also the response, but dunno if used in the future)
 **
 * @param  {String} - botId - messenger id of the bot.
 * @param  {number} - timeUntilResponse - time in seconds up to 3 decimal positions. xx.yyy
 * @param  {String} - messageSent - message sent to the bot, if button pressed content of the button, if multimedia (image, audio), null.
 * @param  {boolean} - buttonPressed - indicates that a button triggered the response.
 * @param  {boolean} - multimediaMessage - indicates that a multimedia message triggered the response.
 * @param  {String} - the response saved in json.
 */
/*
function saveResponseTime(botId, timeUntilResponse, messageSent, buttonPressed, multimediaMessage, response){
	connection.connect();

	connection.query('insert into botResponse(botId,timeUntilResponse,messageSent,buttonPressed,multimediaMessage,response) values ("'+botId+'","'+timeUntilResponse +'","'+messageSent+'",'+buttonPressed+','+ multimediaMessage',"' +response+ '");', 
	function (error, results, fields) {
		if (error) {
		  return connection.rollback(function() {
			throw error;
		  });
		}
	});
	connection.end();
}*/

/**
 * saves bot info. If bot already exists, updates its info.
 **
 * @param  {String} - id - botId, messenger id of the bot.
 * @param  {String} - name - bot Name.
 * @param  {boolean} - connect - if the bot is reachable or not.
 * @param  {String} - url - url to reach the bot. both ("https://www.messenger.com/t/" + botId) and ("https://www.messenger.com/t/" + botName) are valid. (or is url to facebook page???) TODO
 * @param  {String} - commands - ¿¿TODO??
 * @param  {number} - likes - number of likes.
 * @param  {String} - chatbottle - ¿¿¿¿TODO???
 */
function saveBotInfo(id, name, connect, url, commands,likes){
	return new Promise(function(resolve,reject){
		//connection.connect();
		connection.query('Select * from bots where id="' + id +'";', function(error, results, fields){

			if(!error){
				if(!results.length){
					connection.query('insert into bots(id,name,connect,url,commands,likes) values ("'+id+'","'+name +'",'+connect+',"'+url+'","'+ commands+'",' +likes+ ');', function (error, results, fields) {
						if (error) {
						  return connection.rollback(function() {
							reject();
						  });
						}
					});
				}else{
					connection.query('update bots set connect = '+connect+', url = "'+url+'", commands= "'+commands+'", likes = '+likes+', name = "'+name+'" WHERE id = "'+id+'" ;', function (error, results, fields) {
						if (error) {
						  return connection.rollback(function() {
							reject();
						  });
						}
					});
				}
			}

			//connection.end();
			resolve();
		});
	});
	
	
}

function endConnection(){
	connection.end();
}

module.exports = {
	saveBotInfo : saveBotInfo,
	endConnection:endConnection
	//saveResponseTime: saveResponseTime
};