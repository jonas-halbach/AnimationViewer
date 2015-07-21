/**
 * Author: Jonas Halbach
 * Creation Date: 06.06.2014
 *
 * This class is js-File is used to control a camera object.
 *
 */

/**
 * This class is used to control a camera.
 * @constructor
 */
function CameraController() {

    //Specifying if camera shall rotate around its own axis or around the scenes zero point
    var rotateAroundZero = true;

    /**
     * translating the camera in z-direction, to zoom in odr out the scene
     * @param camera {THREE.Camera} is the camera which will be translated
     * @param value how far the translation shall be
     */
    this.zoomCamera = function(camera, value) {
        camera.translateZ(value);
    }

    /**
     * Rotation the camera. Two options are possible depending on the class-value:
     * The camera can be rotated around its own zero-point, or around the worlds zero-point.
     * @param camera to rotate{THREE.Camera}
     * @param rotateVector the avis to rotate around
     */
    this.rotateCamera = function(camera, rotateVector) {

        // Rotation-vector needs to be normalized
        rotateVector = rotateVector.normalize();

        var up = new THREE.Vector3(0, 1, 0);
        var left = new THREE.Vector3(1, 0, 0);

        console.log("RotateVector.x: " + rotateVector.x + " RotateVector.y: " + rotateVector.y);

        // Calculating the distance to the scenes center
        var distance = camera.position.length();

        var cameraDirection = new THREE.Vector3(0, 0, 1);

        if(rotateAroundZero) {
            // If rotate around scenes center camera shall always look in this direction
            camera.lookAt(new THREE.Vector3(0, 0, 0));

            // Translating the camera to the scenes center
            var vector = new THREE.Vector3();
            vector.copy(cameraDirection);
            vector.multiplyScalar(-distance);
            camera.translateOnAxis(cameraDirection, -distance);
        }

        // Rotate the camera around the rotateVector. Rotation around view-direction of camera is not allowed.
        camera.rotateOnAxis(up, rotateVector.x * 0.02);
        camera.rotateOnAxis(left, rotateVector.y  * 0.02);

        // if camera shall rotate around scene centre, camera needs to be translated back around the same distance
        // along cameras, z-axis.
        if(rotateAroundZero) {
            camera.translateOnAxis(cameraDirection, distance);
            console.log("Camera.position: " + vectorToString(camera.position))
        }

    }

    /**
     * Move camera on viewplane
     * @param camera to move
     * @param moveVector the vector the camera shall moved on.
     */
    this.moveCamera = function (camera, moveVector) {
        camera.translateX(moveVector.x);
        camera.translateY(-moveVector.y);

    }

    /**
     * Specify if camera shall rotate around scene centre.
     * @param shallRotateAroundZero true if shall around zero. false if shall rotate around own axis.
     */
    this.setRotateAroundZero = function(shallRotateAroundZero) {
        rotateAroundZero = shallRotateAroundZero;
    }



}