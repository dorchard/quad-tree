
// Detect whether two circles intersect
function collision2(circleA, circleB) {

    // If the circles are actually different circles
    if (circleA != circleB) {

			// Get mid-point co-ordinates
			ax = circleA.circ.cx.baseVal.value;
			ay = circleA.circ.cy.baseVal.value;

			bx = circleB.circ.cx.baseVal.value;
			by = circleB.circ.cy.baseVal.value;

			if (((bx-ax)**2 + (by-ay)**2) <= (circleA.rad+circleB.rad)**2) {
				// Collision!
				makeCircleRed(circleA);
				makeCircleRed(circleB);
				// Turn this on to do basic bouncing 
				//circleA.xv = -circleA.xv;
				//circleA.yv = -circleA.yv;
				//circleB.xv = -circleB.xv;
				//circleB.yv = -circleB.yv;

			}

  }
}


function checkCollisions(circles) {
	if (method == "fast" && circles.length > 80) {
		for (var i = 0; i < circles.length; i++) {
			var localCircles = retrieve(circles[i], root);
			// check collision foir everything local
			localCircles.forEach(localCircle => collision2(circles[i], localCircle));
		}

	} else {
		quadraticBetter(circles);	
	}
}

function quadraticBetter(circles) {
	// number of checks = (n^2 / 2) - n
	// asymptotic behaviour = O(n^2)

	// Compare all pairs of circles to see if they are colliding

	// i = 1, j = 0
	// i = 2, j = 0,
	// i = 2, j = 1,
	// i = 3, j = 0,
	// i = 3, j = 1
	// i = 3, j = 2,
	// .....
	for (var i = 0; i < circles.length; i++) {
		for (var j = 0; j < i; j++) {
			collision2(circles[i], circles[j]);
		}
	}
}

function quadratic(circles) {
	// number of checks = n^2
	// asymptotic behaviour = O(n^2)

	// Compare all pairs of circles to see if they are colliding
	for (var i = 0; i < circles.length; i++) {
		for (var j = 0; j < circles.length; j++) {
			collision2(circles[i], circles[j]);
		}
	}
}