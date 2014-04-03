var canvas = document.getElementById('canvas');
var c = canvas.getContext('2d'); 

var width = canvas.width;
var height = canvas.height;

// For using every frame...
var controller = new Leap.Controller();
//var controller = new Leap.Controller({frameEventName: "deviceFrame"});
    
controller.on('connect', function() {
  console.log("Successfully connected.");
});

controller.on('deviceConnected', function() {
  console.log("A Leap device has been connected.");
});

controller.on('deviceDisconnected', function() {
  console.log("A Leap device has been disconnected.");
});

// To measure every frame.
var i = 0;
//controller.on('deviceFrame', function(){
controller.on('frame', function( frame ){
    c.clearRect( 0 , 0 , width , height );
    if( i===0 ){
        console.log('yay');
        console.log(frame);
    }
    i += 1;
});

controller.connect();