
// Creates an empty root quad tree
function newQuadTreeRoot() {
    return {x: 0, y: 0, w: width, h: height, children: [], objs: []};
}


// Calculates to which quadrant a circle belongs to for a node
function getIndex(circle, node) {

    var vMidPoint = node.x + node.w / 2
    var hMidPoint = node.y + node.h / 2

    var botQuadrant = circle.circ.cy.baseVal.value + rad < hMidPoint
  	            && circle.circ.cy.baseVal.value - rad > node.y;

    var topQuadrant = circle.circ.cy.baseVal.value - rad >= hMidPoint
	           && circle.circ.cy.baseVal.value + rad < (node.y + node.h);

    var index = -1; // Signifies a boundary crossing circle

    if (circle.circ.cx.baseVal.value + rad < vMidPoint
	&& circle.circ.cx.baseVal.value - rad > node.x) {

	if (botQuadrant) {
	    index = 0;
	} else if (topQuadrant) {
	    index = 2;
	}

    } else if (vMidPoint <= circle.circ.cx.baseVal.value - rad
	       && circle.circ.cx.baseVal.value + rad < (node.x + node.w)) {

	if (botQuadrant) {
	    index = 1;
	} else if (topQuadrant) {
	    index = 3;
	}
    }

    return index;
}

// Insert a circle into a node
function insert(circle, node) {

    // If the node has children, and it belongs to one
    // of these quadrants, then add it to the corresponding
    // quadrant

    if (node.children.length > 0) {
	var index = getIndex(circle, node);
        if (index != -1) {
	    insert(circle, node.children[index]);
	    return;
	}
    }

    // Otherwise, we are at a boundary or we are adding to a leaf
    node.objs.push(circle);

    // Triggers a split
    if (node.children.length == 0 && node.objs.length >= maxObjectsInQuadrant) {
	split(node);
    }
}

// Split a node (implicit pre-condition: the node is a leaf)

function split(node) {
    // Create 4 new child nodes

    var quad0 = {x: node.x,
		 y: node.y,
		 w: node.w/2,
		 h: node.h/2,
		 children: [], objs: []};

    var quad1 = {x: node.x + node.w/2,
		 y: node.y,
		 w: node.w/2,
		 h: node.h/2,
		 children: [], objs: []};

    var quad2 = {x: node.x,
		 y: node.y + node.h/2,
		 w: node.w/2,
		 h: node.h/2,
		 children: [], objs: []};

    var quad3 = {x: node.x + node.w/2,
		 y: node.y + node.h/2,
		 w: node.w/2,
		 h: node.h/2,
		 children: [], objs: []};

    node.children = [quad0, quad1, quad2, quad3];

    var newObjs = [];

    for (var i = 0; i < node.objs.length; i++) {
	let circ = node.objs[i];

	// Assign the objects to the relevant quadrants
	// or keep it in the parent if -1
	let ix = getIndex(circ, node);

	if (ix == -1) {
	    newObjs.push(circ);
	} else {
	    node.children[ix].objs.push(circ);
	}
    }

    node.objs = newObjs;
}

// Retrieve the circles which are colocated with a circle
function retrieve(circ, node) {
    var ix = getIndex(circ, node);
    if (node.children.length > 0) {
	if (ix == -1) {
	// Unforuntate soules not in a quadrant must look at everyone
  	return node.objs.concat(retrieve(circ, node.children[0]))
	                .concat(retrieve(circ, node.children[1]))
  	                .concat(retrieve(circ, node.children[2]))
		        .concat(retrieve(circ, node.children[3]));
	} else {
	    // Those in a quadrant look at the quadrant and the parent objects
	    return node.objs.concat(retrieve(circ, node.children[ix]));
	}
    } else {
	// If we have no quadrants to speak off, just get all the objects
 	return node.objs;
     }
}


// Function for rendering the quad tree
function drawQuadTree(canvas, node, offset) {
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    canvas.appendChild(rect);
    rect.setAttributeNS(null, 'width', node.w + 1);
    rect.setAttributeNS(null, 'height', node.h + 1);
    rect.setAttributeNS(null, 'x', node.x - 1);
    rect.setAttributeNS(null, 'y', node.y - 1);
    rect.setAttributeNS(null, 'style', "stroke-width:1px;stroke:rgb(120,120,120);fill:none;");
    if (node.children.length > 0) {
	drawQuadTree(canvas, node.children[0], offset+1);
	drawQuadTree(canvas, node.children[1], offset+1);
	drawQuadTree(canvas, node.children[2], offset+1);
	drawQuadTree(canvas, node.children[3], offset+1);
    }
}
