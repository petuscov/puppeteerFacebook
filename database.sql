CREATE DATABASE messengerbots;
USE messengerbots;
CREATE TABLE bots(
	id VARCHAR(15) NOT NULL, #messenger id of the bot.
	name VARCHAR(25),
	chatbottleurl VARCHAR(600), 
	likes INT(15),
	commands VARCHAR(50),
	url VARCHAR(45),
	connect TINYINT(1),
	ecommerce TINYINT(1),
	PRIMARY KEY(id)
);
CREATE TABLE messagesenttobot(
	id INT(11) NOT NULL AUTO_INCREMENT,
	analysisdate NOT NULL VARCHAR(15),
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

#Independiente del resto.
CREATE TABLE chatbottle(
	link VARCHAR(600), #en la 2da pagina uno de 77... 116 en pagina 6..., 200 sigue siendo poco para alguno.. 400 TAMBIEN.
	likes INT(15)
);
