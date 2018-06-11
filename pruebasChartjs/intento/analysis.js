"use strict";
var socket = io("http://localhost:3000"); 

/*
var datos = [];
var emojis = [];
;*/
var messageTimesChart;
var emojisChart;
var multimediaChart;

var data = {
	basicInfo:{//V
		"name": "", 
		"id": "",
		"likes": "" 
	},
	messages : [], //V
	emojis:{ //V
		"numYes": 0, //V
		"numNo": 0 //V
	},
	multimedia:{ //V
		"numYes": 0, //V
		"numNo": 0 //V
	},
	reviewedFeatures:{
		"initialButton":"", //V
		"initialMsgUseful":"", //V
		"helpCommand":"", //V
		"variation":"", //V con porcentaje, 3 pruebas diferentes, en random, en hello, en goodbye...
		"typosHandled":"", //V con porcentaje, 3 pruebas diferentes, en random, en hello, en goodbye...
		"buttonEquivalent":"", //V
	}
};

socket.on("update",(dataR)=>{
	data = dataR;
	setBasicInfo();
	Promise.all([
		setPercentageEmojis(), 
		setPercentageMultimedia(),
		setMeanTime()
	]).then(function(results){
		setStimatedQuality(results[0],results[1],results[2]);
	});
	messageTimesChartSetup();
	emojisChartSetup();
	multimediaChartSetup();
	setTable();
});

/**
 * Data of analysis already finished. 
 */
window.onload = ()=>{
	setBasicInfo();
	Promise.all([
		setPercentageEmojis(), 
		setPercentageMultimedia(),
		setMeanTime()
	]).then(function(results){
		setStimatedQuality(results[0],results[1],results[2]);
	});
	messageTimesChartSetup();
	emojisChartSetup();
	multimediaChartSetup();
	setTable();

};

var colorTimes;
switch(Math.floor(Math.random()*3)){
	case 0: colorTimes = 'rgba(255, 99, 132, 0.2)'; break;
	case 1: colorTimes = 'rgba(54, 162, 235, 0.2)'; break;
	case 2: colorTimes = 'rgba(75, 192, 192, 0.2)'; break;
	default: console.log("out of range");
}
var color1;
switch(Math.floor(Math.random()*3)){
	case 0: color1 = 'rgba(255, 99, 132, 0.2)'; break;
	case 1: color1 = 'rgba(54, 162, 235, 0.2)'; break;
	case 2: color1 = 'rgba(75, 192, 192, 0.2)'; break;
	default: console.log("out of range");
}
var color2;
switch(Math.floor(Math.random()*3)){
	case 0: color2 = 'rgba(255, 99, 82, 0.2)'; break;
	case 1: color2 = 'rgba(54, 0, 125, 0.2)'; break;
	case 2: color2 = 'rgba(0, 192, 255, 0.2)'; break;
	default: console.log("out of range");
}


/**
 * Calculates percentage emojis and sets it.
 */
function setPercentageEmojis(){  //data){ TODO habrá que pasar el objeto data así.
	return new Promise(function(resolve,reject){
		var percentageEmojis = data.emojis.numYes / (data.emojis.numYes+data.emojis.numNo);
		percentageEmojis=percentageEmojis.toFixed(2);
		$('#emojisPercentage').text(percentageEmojis);
		resolve(percentageEmojis);
	});
}

/**
 * Calculates percentage multimedia messages and sets it.
 */
function setPercentageMultimedia(){
	return new Promise(function(resolve,reject){
		var percentageMultimedia = data.multimedia.numYes / (data.multimedia.numYes+data.multimedia.numNo);
		percentageMultimedia=percentageMultimedia.toFixed(2);
		$('#multimediaPercentage').text(percentageMultimedia);
	 	resolve(percentageMultimedia);
	});
}
/**
 * Calculates mean time of responses and sets it.
 */
function setMeanTime(){
	return new Promise(function(resolve,reject){
		var meanTime = 0;
		for(var i=0;i<data.messages.length;i++){
			meanTime += data.messages[i].time;
		}
		meanTime = meanTime/data.messages.length;
		meanTime = meanTime.toFixed(2);
		$('#meanTime').text(meanTime);
		resolve(meanTime);
	});
}

/**
 * Sets chart of message times
 */
function messageTimesChartSetup(){
	var ctx = document.getElementById("timesChart").getContext('2d');
	var labels = [];
	var messTimesData = [];

	for(var i=0;i<data.messages.length;i++){
		labels.push(data.messages[i].message);
		messTimesData.push(data.messages[i].time);
	}

	messageTimesChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: labels,
	        datasets: [{
	            label: 'Seconds until response',
	            data: messTimesData,
	            backgroundColor: [
	               colorTimes
	            ],
	            borderColor: [
	                colorTimes
	            ],
	            borderWidth: 1
	        }]
	    },
	    options: {
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true
	                }
	            }]
	        }
	    }
	});
}

/**
 * Sets chart of emojis
 */
function emojisChartSetup(){
	var ctx = document.getElementById("emojisChart").getContext('2d');
	var emojisData = [];
	emojisData.push(data.emojis.numYes)
	emojisData.push(data.emojis.numNo);

	emojisChart = new Chart(ctx,{
	    type: 'pie',
	    data: {
	    	labels: ["Emojis","No emoji"],
	        datasets: [{
	            data: emojisData,
	            backgroundColor: [
	               color1,
	               color2
	            ],
	            borderWidth: 1
	        }]
	    }
	});
}

/**
 * Sets chart of multimedia messages
 */
function multimediaChartSetup(){
	var ctx = document.getElementById("multimediaChart").getContext('2d');
	var multimediaData = [];
	multimediaData.push(data.multimedia.numYes);
	multimediaData.push(data.multimedia.numNo);

	multimediaChart = new Chart(ctx,{
	    type: 'pie',
	    data: {
	    	labels: ["Multimedia","Simple message"],
	        datasets: [{
	            data: multimediaData,
	            backgroundColor: [
	               color1,
	               color2
	            ],
	            borderWidth: 1
	        }]
	    }
	});
}
/**
 * Sets chart of multimedia messages
 */
function setTable(){
	$('#variation').text(data.reviewedFeatures.variation);
	$('#buttonEquivalent').text(data.reviewedFeatures.buttonEquivalent);
	$('#helpCommand').text(data.reviewedFeatures.helpCommand);
	$('#initialButton').text(data.reviewedFeatures.initialButton);
	$('#admitVariations').text(data.reviewedFeatures.admitVariations);
}
/**
 * Sets chart of multimedia messages
 */
function setBasicInfo(){
	$('#botName').text(data.basicInfo.name);
	$('#botId').text(data.basicInfo.id);
	$('#botLikes').text(data.basicInfo.likes);
}
function setStimatedQuality(percentageEmojis,percentageMultimedia,ponderatedRate){
	var ponderatedRate = 100.00;
	for(var review in data.reviewedFeatures){
		if(!data.reviewedFeatures[review]){
			ponderatedRate-=4;
		}
	}
	if(percentageEmojis<5) ponderatedRate-=10;
	if(percentageEmojis>50) ponderatedRate-=5;
	if(percentageMultimedia<1) ponderatedRate-=10;
	if(percentageMultimedia>20) ponderatedRate-=5;
	if(meanTime>4){
		var timeForPonderation = meanTime-4;
		ponderatedRate -= (timeForPonderation*5);
	}
	$('#stimatedQuality').text(ponderatedRate);
}