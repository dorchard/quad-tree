// State

var maxObjectsInQuadrant = 4;
var width = 800;
var height = 800;
var numCircles = 25;
var rad = 15; // radius
var maxSpeed = 4;

var frameDelay = 1000/36;
var unpaused = true;

// Control flags
var labels = false;
var quadTree = false;
var method = "slow";
var methodNew = "slow";

// Color of a normal blob
var normalColor = "rgb(220,220,220,0.5)";

var circles = [];

// quad tree (if using this method)
var root = null;

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
	    "Paused<br />" + document.getElementById("status").innerHTML;
    }
}

function render(){
    var start = new Date().getTime();

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

	    collisions(circles[i], localObjs);
	}

	// Show the time taken
	var end = new Date().getTime();
	var time = end - start;
	document.getElementById("speed").innerHTML = time + "ms";
	method = methodNew;
    }

    setTimeout(render, frameDelay);
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

// Check whether a circle collides with a list of other circles
function collisions(circle, objs) {
    for (var j = 0; j < objs.length; j++) {
	if (circle != objs[j]) {
	    ax = circle.circ.cx.baseVal.value;
	    ay = circle.circ.cy.baseVal.value;

	    bx = objs[j].circ.cx.baseVal.value;
	    by = objs[j].circ.cy.baseVal.value;

	    // Colission!
	    if (((bx-ax)**2 + (ay-by)**2) <= (2*rad)**2) {
		circle.circ.setAttributeNS(null, 'style', "fill:rgb(250,110,110,0.5)");
	    }
	}
    }
}
