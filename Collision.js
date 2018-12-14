// State

var maxObjectsInQuadrant = 4;
var width = 800;
var height = 800;
var numCircles = 5;
var rad = 60; // radius
var maxSpeed = 4;

var frameDelay = 1000/30;
var unpaused = true;

// Control flags
var labels = false;
var quadTree = false;
var method = "slow";
var methodNew = "slow";

// Color of a normal blob
var normalColor = "rgb(220,220,220,0.5)";

// Object state
var circles = [];

// quad tree (if using this method)
var root = null;

// For timing purposes
var runs = 0;
var totalTime = 0;

function setup() {
    // Set up event handlers
    document.body.addEventListener("keypress", pause);

    // Set up the form
    document.getElementById("circles").value = numCircles;
    document.getElementById("radius").value = rad;
    setupMain();

    // Trigger the main loop
    setTimeout(render, frameDelay);
}

function setupMain() {
    // Wipe the circle state
    circles = [];

    // Set up the canvas
    var canvas = document.getElementById("canvas");
    canvas.setAttributeNS(null, 'height', height);
    canvas.setAttributeNS(null, 'width', width);
    for (var i = 0; i < numCircles; i++) {
	// Creat the circle
	let circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	let x = Math.round(Math.random()*width);
	let y = Math.round(Math.random()*height);
	circ.setAttributeNS(null, 'cx', x);
	circ.setAttributeNS(null, 'cy', y);
	circ.setAttributeNS(null, 'r', rad);
	circ.setAttributeNS(null, 'style', "fill:" + normalColor);
	canvas.appendChild(circ);

	// Create a label but these may get hidden
	let txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
	txt.setAttributeNS(null, 'x', -100);
	txt.setAttributeNS(null, 'y', -100);
	txt.innerHTML = i;
	canvas.appendChild(txt);

	// Randomise the velocity
	circles.push({circ: circ, txt: txt,
		      xv: Math.round(Math.random()*maxSpeed),
		      yv: Math.round(Math.random()*maxSpeed)});
    }
}

// Called when the 'Restart' button is hit
function updateCircles() {
    totalTime = 0;
    runs = 0;
    rad = parseInt(document.getElementById("radius").value);
    numCircles = parseInt(document.getElementById("circles").value);
    methodNew = document.getElementById("panel").elements["method"].value;

    // Remove all the old circles
    var canvas = document.getElementById("canvas");
    while (canvas.children.length > 0) {
	canvas.removeChild(canvas.firstElementChild);
    }
    // Reboot
    setupMain();

}

// When the check boxes are edited, do the these updates
function updateControls() {
    labels = document.getElementById('labels').checked;
    quadTree = document.getElementById('quad').checked;

    if (!labels) {
	// Move all the labels away
	for (var i = 0; i < circles.length; i++) {
	    circles[i].txt.x.baseVal[0].value = -100
	}
    }
}

// Pause handler
function pause(event) {
    if (event.key == "p") {
	unpaused = !unpaused;
    }
    if (!unpaused) {
	document.getElementById("status").innerHTML =
	    "<span style='color:red'>Paused</span><br />"
	  + document.getElementById("status").innerHTML;
    }
}

function render(){
    var start = new Date().getTime();
    var time = 0;

    if (unpaused) {
	root = newQuadTreeRoot();

	for (var i = 0; i < circles.length; i++) {

	    let xv = circles[i].xv;
	    let yv = circles[i].yv;

	    circles[i].circ.cx.baseVal.value =
		(circles[i].circ.cx.baseVal.value + xv) % width;

	    circles[i].circ.cy.baseVal.value =
  		(circles[i].circ.cy.baseVal.value + yv) % height;

	    // Move the labels if we are viewing labels
	    if (labels) {
		circles[i].txt.x.baseVal[0].value = circles[i].circ.cx.baseVal.value - (rad/2);
	        circles[i].txt.y.baseVal[0].value = circles[i].circ.cy.baseVal.value + (rad/2);
	    }

	    // Add into quad tree if we are using this method
	    if (method == "fast") {
		insert(circles[i], root);
	    }
	}

	clearState();

	// Draw quad tree if requested
	if (method == "fast" && quadTree) {
	    drawQuadTree(canvas, root, 0);
	}

	// Go through all circles
	for (var i = 0; i < circles.length; i++) {

	    // Retrieve from the quad tree if we are using it
	    if (method == "fast") {
		localObjs = retrieve(circles[i], root);

	    // Else compare with all the other circles
	    } else {
		localObjs = circles;
	    }

	    collisionsN(circles[i], localObjs);
	}

	// Show the time taken
	var end = new Date().getTime();
	time = end - start;
	totalTime += time;
	runs++;
	document.getElementById("speed").innerHTML = (totalTime / runs).toFixed(1) + "ms";
	method = methodNew;
    }

    var delay = frameDelay - time;
    if (delay < 0) {
	delay = 10;
    }
    setTimeout(render, delay);
}

// Reset various things that need resetting between frames,
// including collision markers
function clearState() {
    document.getElementById("status").innerHTML = "";
    var canvas = document.getElementById("canvas");
    var oldRects = document.getElementsByTagName("rect");
    for (var i = 0; i < oldRects.length; i++) {
	canvas.removeChild(oldRects[i]);
    }
    for (var i = 0; i < circles.length; i++) {
	circles[i].circ.setAttributeNS(null, 'style', "fill:" + normalColor);
    }
}

function makeCircleRed(circle) {
    circle.circ.setAttributeNS(null, 'style', "fill:rgb(250,110,110,0.5)");
}


// Check whether a circle collides with a list of other circles
function collisionsN(circleA, otherCircles) {

    for (var i = 0; i < otherCircles.length; i++) {

	let circleB = otherCircles[i]

	// Collision of 2 circles
	collision2(circleA, circleB);
    }
}
