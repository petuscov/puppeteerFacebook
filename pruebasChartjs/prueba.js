"use strict";
document.onload = ()=>{
	mainFunc();
};
var datos = [{
	message: "holis",
	time: 2.13
},{
	message: "help",
	time: 1.83
},{
	message: "exit",
	time: 2.33
},{
	message: "cancel",
	time: 3.13
},{
	message: "no",
	time: 1.73
},{
	message: "si",
	time: 2.13
},{
	message: "accept",
	time: 1.93
},{
	message: "holy",
	time: 2.13
},{
	message: "films",
	time: 3.33
}];

function mainFunc(){
	var ctx = document.getElementById("myChart").getContext('2d');
	//var labels = ; //TODO
	var myChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
	        datasets: [{
	            label: '# of Votes',
	            data: [12, 19, 3, 5, 2, 3],
	            backgroundColor: [
	                'rgba(255, 99, 132, 0.2)',
	                'rgba(54, 162, 235, 0.2)',
	                'rgba(255, 206, 86, 0.2)',
	                'rgba(75, 192, 192, 0.2)',
	                'rgba(153, 102, 255, 0.2)',
	                'rgba(255, 159, 64, 0.2)'
	            ],
	            borderColor: [
	                'rgba(255,99,132,1)',
	                'rgba(54, 162, 235, 1)',
	                'rgba(255, 206, 86, 1)',
	                'rgba(75, 192, 192, 1)',
	                'rgba(153, 102, 255, 1)',
	                'rgba(255, 159, 64, 1)'
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

