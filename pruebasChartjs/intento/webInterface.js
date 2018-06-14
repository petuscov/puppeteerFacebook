"use strict";

var http = require("http");
var fileSystem = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
//var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var analyzer = require('./../../_analyzer.js')();

var opn = require('opn');

const saltRounds = 10;

//var mysqlEvents = require('mysql-events'); //TODO para actualizado de analisis en vivo
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'root',
  database : 'messengerbots' //podemos usar una db distinta a la del analizador.
});

var express = require('express');
var app = express();

//passport mw.
//app.use(passport.session({ secret: 'anything' }));
app.use(cookieParser()) //?
app.use(session({ 
    secret: 'anything',
    resave: true,
    saveUninitialized: true 
}));
//app.use(passport.initialize());
//app.use(passport.session());

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/",function(req,res){
	res.sendFile(__dirname + '/analysis.html');   
})
app.get("/analysis.html",function(req,res){
    res.sendFile(__dirname + '/analysis.html');   
})
app.get("/analysis.js",function(req,res){
    res.sendFile(__dirname + '/analysis.js');   
})
app.get("/analysis.css",function(req,res){
	res.sendFile(__dirname + '/analysis.css');   
})
app.get('/Chart.bundle.min.js',function(req,res){
    res.sendFile(__dirname + '/Chart.bundle.min.js');   
});
app.get('/favicon.ico',function(req,res){
    res.sendFile(__dirname + '/res/analyzer.ico');
});
var serv = require('http').Server(app);

//WS (actualización de análisis en vivo)
	
//ante eventos de mysql-events socket.emit al cliente con la info.
//de momento lo simulamos con setinterval. (o settimeout.)

var io=require('socket.io')(serv,{});
var socketAnalyzer; //node server.
var socketAnalysis; //browser tab page.

io.sockets.on('connection',function(socket){
    if(!socketAnalyzer){ 
        socketAnalyzer = socket;
        opn('http://localhost:3000'); 
    }else{
        if(!socketAnalysis){ 
            socketAnalysis = socket;
        }
    }
    socketAnalyzer.on('update', function(data) {
        socketAnalysis.emit("update",data);   
    });

    socketAnalyzer.on('disconnect', function() {
        console.log("Analysis ended.");       
    });
} );

if(process.argv.length>=3){
    if(process.argv.length>3){
        console.log("Detected two arguments or more.");
        console.log("Just first argument will be used, it must be the bot id/name in facebook messenger."); //TODO incluir enlace a pagina wiki con captura con messenger bot name
    }

    serv.listen(3000,()=>{
        console.log("listening on 3000.");
    });

    (async function(){
        var app = {url: "http://localhost:3000" };
        var exitCode = await analyzer.analyzeBot(process.argv[2],app); //should save results in db. opens navigator tab.
        return;
    })();
    process.exit();
}else{
  console.log("Specify name or id of bot to analyze."); //TODO incluir enlace a pagina wiki con captura con messenger bot name
  process.exit();
}