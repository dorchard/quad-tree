
// Detect whether two circles intersect
function collision2(circleA, circleB) {

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
