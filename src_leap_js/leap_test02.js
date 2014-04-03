// Get the canvas DOM element 
var canvas = document.getElementById('canvas');


// Making sure we have the proper aspect ratio for our canvas
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Create the context we will use for drawing
var c =  canvas.getContext('2d');

// Save the canvas width and canvas height
// as easily accesible variables
var width = canvas.width;
var height = canvas.height;


/*
  
  The leapToScene function takes a position in leap space 
  and converts it to the space in the canvas.

  It does this by using the interaction box, in order to 
  make sure that every part of the canvas is accesible 
  in the interaction area of the leap

*/
function leapToScene( frame , leapPos ){

  // Gets the interaction box of the current frame
  var iBox = frame.interactionBox;

  // Gets the left border and top border of the box
  // In order to convert the position to the proper
  // location for the canvas
  var left = iBox.center[0] - iBox.size[0]/2;
  var top = iBox.center[1] + iBox.size[1]/2;

  // Takes our leap coordinates, and changes them so
  // that the origin is in the top left corner 
  var x = leapPos[0] - left;
  var y = leapPos[1] - top;

  // Divides the position by the size of the box
  // so that x and y values will range from 0 to 1
  // as they lay within the interaction box
  x /= iBox.size[0];
  y /= iBox.size[1];

  // Uses the height and width of the canvas to scale
  // the x and y coordinates in a way that they 
  // take up the entire canvas
  x *= width;
  y *= height;

  // Returns the values, making sure to negate the sign 
  // of the y coordinate, because the y basis in canvas 
  // points down instead of up
  return [ x , -y ];

}
  
 

// Creates our Leap Controller
var controller = new Leap.Controller();

// Tells the controller what to do every time it sees a frame
controller.on( 'frame' , function(frame){

  //Clears the canvas so we are not drawing multiple frames	
  c.clearRect( 0 , 0 , width , height );

  // First we loop through all of the hands that the frame sees
  for( var i=0; i < frame.hands.length; i++ ){

    // For each hand we define it
    var hand = frame.hands[i];

    // and get its position, so that it can be passed through
    // for drawing the connections
    var handPos = leapToScene( frame , hand.palmPosition );

    // Loop through all the fingers of the hand we are on
    for( var j = 0; j < hand.fingers.length; j++ ){

      // Define the finger we are looking at
      var finger = hand.fingers[j];

      // and get its position in Canvas
      var fingerPos = leapToScene( frame , finger.tipPosition );

    
      /*
          First Draw the Connection
      */

      // Setting up the style for the stroke
      c.strokeStyle = "#FFA040";
      c.lineWidth = 3;

      // Drawing the path
      c.beginPath();

      // Move to the hand position
      c.moveTo(   handPos[0] ,   handPos[1] );

      // Draw a line to the finger position
      c.lineTo( fingerPos[0] , fingerPos[1] );

      c.closePath();
      c.stroke();


      /*
          Second Draw the Finger
      */

      // Setting up the style for the stroke
      c.strokeStyle = "#39AECF";
      c.lineWidth = 5;

      // Creating the path for the finger circle
      c.beginPath();

      // Draw a full circle of radius 6 at the finger position
      c.arc(fingerPos[0], fingerPos[1], 20, 0, Math.PI*2); 

      c.closePath();
      c.stroke();

    }


    /*
        Third draw the hand
    */

    // Setting up the style for the fill
    c.fillStyle = "#FF5A40";

    // Creating the path for the hand circle
    c.beginPath();

    // Draw a full circle of radius 10 at the hand position
    c.arc(handPos[0], handPos[1], 40, 0, Math.PI*2);

    c.closePath();
    c.fill();

  }

});

// Get frames rolling by connecting the controller
controller.connect();