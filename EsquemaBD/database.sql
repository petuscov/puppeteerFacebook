CREATE DATABASE messengerbots;
USE messengerbots;

CREATE TABLE bots(
	id VARCHAR(15) NOT NULL,
	name VARCHAR(25),
	likes INT(15),
	respond TINYINT(1),
	initialButton TINYINT(1),
	initialMsgUseful TINYINT(1),
	helpCommand TINYINT(1),
	variation TINYINT(1),
	typosHandled TINYINT(1),
	buttonEquivalent TINYINT(1),
	emojisPercentage DECIMAL(2,2),
	multimediaPercentage DECIMAL(2,2),
	PRIMARY KEY(id)
);



#### TODO plantear, y de ser posible almacenar directamente mensaje enviado y respuesta recibida juntos. ###
CREATE TABLE messagesenttobot(
	id INT(11) NOT NULL AUTO_INCREMENT,
	analysisdate VARCHAR(15) NOT NULL,
	botid VARCHAR(15),
	messagesent VARCHAR(30),
	buttonpressed TINYINT(1),
	multimediamessage TINYINT(1),
	timeuntilresponse DECIMAL(5,3),
	PRIMARY KEY(id),
	FOREIGN KEY(botid) REFERENCES bots(id)
);
CREATE TABLE botresponse(
	id INT(11) NOT NULL AUTO_INCREMENT,
	botid VARCHAR(15),
	idmessagesent INT(11),
	multimediaresponse TINYINT(1),
	isbutton TINYINT(1),
	containsemoji TINYINT(1),
	responsetext TEXT,
	FOREIGN KEY(id) REFERENCES messagesenttobot(id),
	FOREIGN KEY(botid) REFERENCES messagesenttobot(botid)
);
#######


#Independiente del resto, tabla script procesado bots y likes de chatbottle.
CREATE TABLE chatbottle(
	link VARCHAR(600), 
	likes INT(15)
);


