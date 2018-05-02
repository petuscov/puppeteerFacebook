"use strict";
var socket = io();

var datos = [];
var emojis = [];
var inicialTimesChart;
var myPieChart;
var myChart;

window.onload = ()=>{
	inicialTimesChart = document.getElementById("timesChart");
	timesChart();
	emojisChart();
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

//Chart of message times
function timesChart(){
	var ctx = document.getElementById("timesChart").getContext('2d');
	var labels = [];
	var data = [];

	datos.forEach((element)=>{
		labels.push(element.message);
		data.push(element.time);
	});
	
	

	myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: labels,
	        datasets: [{
	            label: 'Seconds until response',
	            data: data,
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

//chart of emojis
function emojisChart(){
	var ctx = document.getElementById("emojisChart").getContext('2d');
	var data = [],
		contadorNoEmojis = 0,
		contadorEmojis = 0;

	emojis.forEach((emojiFlag)=>{
		if(!emojiFlag){
			contadorNoEmojis++;
		}else{
			contadorEmojis++;
		}
	});
	data.push(contadorNoEmojis);
	data.push(contadorEmojis);
	//calcular al final. No se puede mostrar en el gráfico al realizar hover sobre trozo (no fácilmente)
	//var porcentajeNoEmojis = (contadorNoEmojis / (contadorNoEmojis + contadorEmojis)) * 100;
	//var porcentajeEmojis = (contadorEmojis / (contadorNoEmojis + contadorEmojis)) * 100;
	
	myPieChart = new Chart(ctx,{
	    type: 'pie',
	    data: {
	    	labels: ["no emoji","emojis"],
	        datasets: [{
	            //labels: [porcentajeNoEmojis,porcentajeEmojis],
	            data: data,
	            backgroundColor: [
	               color1,
	               color2
	            ],
	            borderWidth: 1
	        }]
	    }
	});
}

socket.on("info",function(data){

	datos.push({message : data.message, time: data.time});
	emojis.push(data.emojiFlag);
	
	if(myChart){
		myChart.destroy();
	}
	timesChart(); 

	if(myPieChart){
		myPieChart.destroy();
	}
	emojisChart();
});