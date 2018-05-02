"use strict";

var http = require("http");
var fileSystem = require('fs');
var path = require('path');

//var mysqlEvents = require('mysql-events');

var express = require('express');
var app = express();
var serv = require('http').Server(app);


app.get("/",function(req,res){
	res.sendFile(__dirname + '/prueba.html');   
})
app.get("/prueba.html",function(req,res){
	res.sendFile(__dirname + '/prueba.html');   
})
app.get("/prueba.js",function(req,res){
	res.sendFile(__dirname + '/prueba.js');   
})
app.get('/index.css',function(req,res){
    res.sendFile(__dirname + '/index.css');   
});
app.get('/Chart.bundle.min.js',function(req,res){
    res.sendFile(__dirname + '/Chart.bundle.min.js');   
});
/*app.get('/favicon.ico',function(req,res){
    res.sendFile(__dirname + '/res/pacman.ico');
});*/

serv.listen(3000,()=>{
	console.log("listening on 3000.");
});


//WS


	
//ante eventos de mysql-events socket.emit al cliente con la info.
//de momento lo simulamos con setinterval. (o settimeout.)


var io=require('socket.io')(serv,{});

io.sockets.on('connection',function(socket){

   	setInterval(function(){
		var message = Math.random().toString(36).substr(2, 5);
    	var time = 3 + (1-Math.random()*2);
    	var emojiFlag = Math.random()>0.5;
        socket.emit("info",{
        	message: message,
        	time: time,
        	emojiFlag : emojiFlag
        });
   	},5000); //simulamos actualización cada 5 secs.

        

    socket.on('disconnect', function() {
       
    });

} );

