/**
 * Author: Jonas Halbach
 * Creation Date: 06.06.2014
 *
 * This module processes the users input.
 */

function InputController (toControl, elementClass) {

    // Container for the old and new mouse position to calculate the moving-direction of the mouse-cursor
    var mousePos1;
    var mousePos2;

    //status of the mouse-buttons
    var mouseIsDown = false;
    var mouseScrollIsDown = false;
    var rightMouseIsDown = false;

    var _toControl = toControl;
    var viewPortSettings = toControl.getViewPortSettings();

    // This camera-contaner is used for camera-transformation(scrolling, moving, rotating), because the camera which
    // will be transformed is chosen by the position of the mouse and on which screen-tile it is
    var activeCamera = null;

    // This camera is used for gizmo-tranformation(translation), because the gizmo is chosen by the mouseposition and
    // the screen-tile the mouse is over, and it will be decided at the beginning of the transformation
    var currentActiveCamera = null;
    var cameraController = new CameraController(activeCamera);

    // A gizmo selected by a mouseclick. Null if none is selected
    var selectedGizmo = null;


    /**
     * This function processes the mouse-scrolls event, which results in moving the active camera for- or backwards.
     * @param evt is a javascript mouse evt.
     */
    this.scroll = function(evt) {

        // mousePos2 is needed to get the viewport the mouse-cursor is over
        if (mousePos2 != null) {

            // Getting the acive camera of AnimationEnvironment
            var activeCamera = _toControl.getActiveCamera(mousePos2);
            if (evt.originalEvent.wheelDelta > 0 || evt.originalEvent.detail > 0) {
                //Scrolling forwand
                cameraController.zoomCamera(activeCamera, 10);
            }
            else {
                // Scrolling back
                cameraController.zoomCamera(activeCamera, -10);
            }
        }
    }


    /**
     * This function processes the left mouse click
     * @param mouseEvt is the javascript-mouse-event
     */
    this.mouseDown = function(mouseEvt) {


        mousePos1 = getRelativeViewportMousePos(mouseEvt);

        // saving the mouse-state
        mouseIsDown = true;

        currentActiveCamera = _toControl.getActiveCamera(mouseEvt);

        selectGizmo (mouseEvt);
    }

    /**
     * This function processes the left mouse-button up event
     * @param mouseEvt is the javascript-mouse-event
     */
    this.mouseUp = function(mouseEvt) {

        currentActiveCamera = null;
        mouseIsDown = false;
    }


    /**
     * This function processes the middle-mouse-button-down-event
     * @param mouseEvt is the javascript-mouse-evt
     */
    this.scrollDown = function(mouseEvt) {


        // in html the mouse-coordinates will be given from the top-right-corner, so the distance needs to be
        // substracted
        mousePos1 = getRelativeViewportMousePos(mouseEvt);
        mouseScrollIsDown = true;
    }

    /**
     * This function processes the middle-mouse-button-up-event
     * @param mouseEvt is the javascript-mouse-evt
     */
    this.scrollUp = function(mouseEvt) {
        mouseScrollIsDown = false;
    }

    /**
     * This function processes the right mouse click
     * @param mouseEvt is the javascript-mouse-event
     */
    this.rightMouseDown = function(mouseEvt) {
        // in html the mouse-coordinates will be given from the top-right-corner, so the distance needs to be
        // substracted
        mousePos1 = getRelativeViewportMousePos(mouseEvt);

        rightMouseIsDown = true;
    }

    /**
     * This function processes the right mouse up event
     * @param mouseEvt is the javascript-mouse-event
     */
    this.rightMouseUp = function(mousePos) {
        rightMouseIsDown = false;
    }

    /**
     * This function calculates the vector between the old and new mouse-position, which is the mouse moving direction.
     * @returns {THREE.Vector2} the mouse moving direction
     */
    this.getMovingVector = function()
    {

        var mousePos2Copy = new THREE.Vector2();
        mousePos2Copy.copy(mousePos2);
        return mousePos2Copy.sub(mousePos1);
    }

    /**
     * This function processes the mouse-move-event
     * @param mouseEvt is the javascript-mouse-event
     */
    this.onMouseMove = function(mouseEvt) {

        // Updating the second mouse-pos
        mousePos2 = getRelativeViewportMousePos(mouseEvt);

        // if a gizmo is selected and left mouse-button-is down
        if(selectedGizmo != null && mouseIsDown) {
            if (currentActiveCamera != null) {
                var movingVector2d = this.getMovingVector();
                var movingVector = new THREE.Vector3(movingVector2d.x, movingVector2d.y, 0);

                // Mouse-direction needs to be converted into world-coordinates, by apllying camera-rotation
                movingVector.applyQuaternion(currentActiveCamera.quaternion);

                // moving the selected-gizmo, which is one of the colliders at the moment. So the parent, of the parent
                // needs to be moved
                selectedGizmo.parent.parent.move(movingVector);

            }
        } else {

            if (mousePos1 != null) {
                activeCamera = _toControl.getActiveCamera(mousePos1);
            }
            if (activeCamera != null) {
                if (mouseScrollIsDown) {

                    // if middle-mouse-buttom is down, than camera will be rotated

                    var movingVector = this.getMovingVector();

                    cameraController.rotateCamera(activeCamera, movingVector);
                } else if (rightMouseIsDown) {

                    // if right-mouse-button is down, than camera will be translated
                    var movingVector = this.getMovingVector();

                    cameraController.moveCamera(activeCamera, movingVector);
                }
            }
        }
        mousePos1 = mousePos2;
    }

    /**
     * This function can be used for debugging. Draws a line from point "from" to point "to"
     * @param from the start point for the line
     * @param to the end point for the line
     */
    var drawLine = function (from, to) {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(from);
        geometry.vertices.push(to);

        var material = new THREE.LineBasicMaterial({color: 0x000ff});

        var line = new THREE.Line(geometry, material)

        _toControl.addToScene(line);
    }

    /**
     * Draws a ray from the mouse-cursor-position on the viewplane. Used for debugging
     * @param mouseEvt a mouse event
     */
    var drawCameraRay = function(mouseEvt)
    {
        var mouse = new THREE.Vector2(
            - (mouseEvt.pageX - $('.' + elementClass).offset().left) / ($('.' + elementClass).width() - $('.' + elementClass).offset().left) ,
            - (mouseEvt.pageY - $('.' + elementClass).offset().top) / ($('.' + elementClass).height() - $('.' + elementClass).offset().top)
        );

        var camera = _toControl.getActiveCamera(mouseEvt);

        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);

        // transforming the mouseposition on view-plane into world-coordinates
        var projector = new THREE.Projector();
        projector.unprojectVector(vector, camera);

        // transforiming the camera facing direction into worldcoordinates
        var cameraDir = new THREE.Vector3( 0, 0, -1 );
        cameraDir.applyQuaternion(camera.quaternion);

        // Calculating start and endpoint for the ray to draw
        var rayVectorCopy = new THREE.Vector3();
        rayVectorCopy.copy(cameraDir);
        rayVectorCopy.multiplyScalar(4);

        var rayEndPoint = new THREE.Vector3();
        rayEndPoint.copy(vector);
        rayEndPoint.add(rayVectorCopy);

        drawLine(vector, rayEndPoint);
    }

    /**
     * This function calculated the mouseposition on the Canvas, which start at the bottom-left corner.
     * @param mouseEvt a javascript-mouse-event on the canvas.
     * @returns {THREE.Vector2} the transformed mouse-position
     */
    function getMousePosOnCanvas(mouseEvt) {
        return new THREE.Vector2(
                (mouseEvt.pageX - $('.' + elementClass).offset().left),
            $('.' + elementClass).height() - (mouseEvt.pageY + $('.' + elementClass).offset().top));
    }

    /**
     * This function calculates the relative mouse-pos on the Canvas, which has its roots corner at the top-left-corner
     * @param mouseEvt a javascript mouse-event on the canvas-
     * @returns {THREE.Vector2} the transformed mouse-position
     */
    function getRelativeViewportMousePos(mouseEvt) {
        var relativeViewPortMousePos = new THREE.Vector2(
                mouseEvt.pageX - $('.' + elementClass).offset().left,
                mouseEvt.pageY - $('.' + elementClass).offset().top
        );

        return relativeViewPortMousePos;
    }

    /**
     * This function transforms the mouse coordinates into cartesisan coordintaes,
     * [-1/ 1 0/ 1 1/ 1]
     * [-1/ 0 0/ 0 1/ 0]
     * [-1/-1 0/-1 1/-1]
     * @param mouseEvt a javascript mouse-event on the canvas
     * @param z just a z value (must be between 1 and -1)
     * @returns {THREE.Vector3}
     */
    function getRelativeMousePosInCartesianCoordinates(mouseEvt, z) {

        // Getting the Mouse Position on the Canvas with respecting the canvas-elements-offset
        // Needed to get the viewport slice under the mouse pointer

        var relativeViewPortMousePos = getRelativeViewportMousePos(mouseEvt);

        var activeViewPortSlice = _toControl.getActiveViewPort(relativeViewPortMousePos);

        var viewPortSliceX = activeViewPortSlice.getX();
        var viewPortSliceY = activeViewPortSlice.getY();
        var viewPortWidth = activeViewPortSlice.getWidth();
        var viewPortHeight = activeViewPortSlice.getHeight();

        // Calculating the mouseposition relative to the viewportslice-corner by inverting the y value of the mouse-pos
        var mousePosOnViewPort = getMousePosOnCanvas(mouseEvt);

        var relativeMousePosInCartesianCoordinates = new THREE.Vector3(
            (mousePosOnViewPort.x - viewPortSliceX) / viewPortWidth * 2 - 1,
            (mousePosOnViewPort.y - viewPortSliceY) / viewPortHeight * 2 - 1,
            z);

        return relativeMousePosInCartesianCoordinates;
    }

    /**
     * This method selects a gizmo. Will be executed if mouse is clicked and mouse-cursor is over one of a gizmos arrow
     * @param mouseEvt a javascript-mouse-event
     */
    function selectGizmo (mouseEvt) {

        selectedGizmo = sendRayCast(mouseEvt);

        if(selectedGizmo != null) {
            selectedGizmo.hitByRay();
        }
    }

    /**
     * Deselects a gizmo if one is selected.
     */
    function deselectGizmo () {
        if(selectedGizmo != null) {
            selectedGizmo.deselect();
        }
        selectedGizmo = null;
    }

    /**
     * Sends a raycast from the mouse-cursor-position into the screen/camera/viewing-direction.
     * @param mouseEvt
     * @returns {*}
     */
    function sendRayCast (mouseEvt) {

        var firstHit = null;

        // Because mousepos is relative to the complete html-page and not jut to the canvas the border needs to be
        // substracted
        var relativeViewPortMousePos = getRelativeViewportMousePos(mouseEvt);

        var camera = _toControl.getActiveCamera(relativeViewPortMousePos);

        var projector = new THREE.Projector();

        // raycaster expects cartesian cartesian coordinates!
        var vector = getRelativeMousePosInCartesianCoordinates(mouseEvt, 0.5);

        var raycaster = projector.pickingRay(vector.clone(), camera);

        var intersects = raycaster.intersectObjects(_toControl.controllPoints, true);

        var activeCamera = null;

        if(intersects.length > 0) {
            console.log("INTERSECTS!!!! Camera id: " + camera.id +  "Camera.pos: " + vectorToString(camera.position) +
                " camera.rot: " + camera.rotation);
            firstHit = intersects[0].object.parent;
        }

        return firstHit;
    }
}

/**
 * Converting a THREE.Vector2 into a string, which is useful for debugging
 * @param vector a THREE.Vector2
 * @returns {string} The vector as string
 */
function vectorToString(vector) {
    return "("+ vector.x + ", " + vector.y + ", " + vector.z +")";
}