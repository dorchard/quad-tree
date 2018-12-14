
// Check whether a circle collides with a list of other circles
function collisions(circleA, otherCircles) {

    for (var i = 0; i < otherCircles.length; i++) {

	let circleB = otherCircles[i]

	// If the circles are actually different circles
	if (circleA != circleB) {

	    // Get mid-point co-ordinates
	    ax = circleA.circ.cx.baseVal.value;
	    ay = circleA.circ.cy.baseVal.value;

	    bx = circleB.circ.cx.baseVal.value;
	    by = circleB.circ.cy.baseVal.value;

	    // Detect collission
	    if (((bx-ax)**2 + (ay-by)**2) <= (2*rad)**2) {

		// Collision!
		makeCircleRed(circleA);

	    }
	}
    }
}
