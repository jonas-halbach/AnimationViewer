/**
 * Author: Jonas Halbach
 * Creation Date: 24.06.2014
 *
 * This js-File contains all gizmos which are used to translate/scale moveable objects like lights.
 */


/**
 * A gizmo is a graphical object which helps to transform an other object connected to the gizmo
 * @param context the rendering environment(AnimationEnvironment)
 * @param toControl the object which shall be controlled
 * @constructor
 */
Gizmo = function(context, toControl) {

    // The object which shall be controlled
    var _toControl = toControl;

    // The rendering environment(AnimationEnvironment)
    _context = context;

    /**
     * Set set visibility of the gizmo
     * @param show true if shall be visible, false if shall be hidden
     */
    this.show  = function(show) {

    }

    /**
     * Getting the axis the mouse-cursor is over
     * @param mousePos Object of type THREE.Vector2
     */
    this.getAxis = function(mousePos) {

    }

    /**
     * Deselect the whole gizmo
     */
    this.deselect = function() {
    }
}

/**
 * Translate-gizmo is a gizmo which will be used to translate an object into the directions x, y, z
 * @param context the rendering-environment(Animationenvironment)
 * @param toControl the object which shall be controlled by the gizmo
 * @constructor
 */
TranslateGizmo = function(context, toControl) {

    // This need to be done to use the functions of THREE.Object
    THREE.Object3D.call( this );
    var that = this;

    // the rendering-environment(Animationenvironment)
    that._context = context;

    // the object which shall be controlled by the gizmo
    that._toControl = toControl;

    // dimensions of the direction-arrows
    var arrowLength = 30;
    var arrowRadius = 5;
    var width = 5;
    var height = 5;
    var depth = 5;

    // speed how fast the gizmo shall move
    var movingSpeed = 5;

    // rootnode of this gizmo
    var node = new THREE.Object3D();

    var colliderVisible = false;

    // the three axes in which the gizmo can be moved
    var y = node.up;
    var x = new THREE.Vector3(1, 0, 0).applyQuaternion(node.quaternion);
    var z = new THREE.Vector3(0, 0, 1).applyQuaternion(node.quaternion);

    // container to store the axis which is selected by a mouse-click
    var selectedAxis = null;

    // container for all objects which shall be informed about the gizmos change.
    var changeListener = [];

    createGizmo();

    /**
     * This function creates the three-dimensional-translate-gizmo-object
     */
    function createGizmo()
    {

        // Adding the gizmo to the rendering-context
        that._context.addToScene(that);

        // Adding the root of the gizmo to this THREE.Object
        that.add(node);

        node.axis = Axis.all;

        // function which will be called if the root is clicked by mouse.
        node.hitByRay = function() {selectedAxis = node.axis; console.log("Selected Axis: " + selectedAxis );};

        var corner = new THREE.Mesh(
            new THREE.CubeGeometry(width, height, depth),
            new THREE.MeshLambertMaterial({
                color: 0x00ff00
            })
        );

        node.add(corner);

        // The following part created the arrow pointing in x-direction.
        var arrowX = createArrow(new THREE.Vector3(1, 0, 0), 0xff0000, width, arrowLength);
        arrowX.axis = Axis.x;

        // Function whch will be called if the x-arrow will be clicked
        arrowX.hitByRay = function() {selectedAxis = arrowX.axis; console.log("Selected Axis: " + selectedAxis );};

        // The collider helps that the click does not need to hit the arrow precisely
        var colliderX = new THREE.Mesh(new THREE.BoxGeometry(width * 2, arrowLength + arrowLength / 10, width * 2, 1, 1, 1),
            new THREE.MeshLambertMaterial({color:0xff0000})
        );

        // Adjustiong the collider to the arrow
        colliderX.translateOnAxis(new THREE.Vector3(0, 1, 0), arrowLength / 2 + width);
        colliderX.visible = colliderVisible;
        colliderX.isCollder = true;
        colliderX.hitByRay = function() {selectedAxis = arrowX.axis; console.log("Hit collider!");};

        arrowX.add(colliderX);

        node.add(arrowX);

        // The following part created the arrow pointing in y-direction.
        var arrowY = createArrow(new THREE.Vector3(0, 1, 0), 0x0000ff, width, arrowLength);
        arrowY.axis = Axis.y;
        arrowY.hitByRay = function() {selectedAxis = arrowY.axis; console.log("Selected Axis: " + selectedAxis );};

        // The collider helps that the click does not need to hit the arrow precisely
        var colliderY = new THREE.Mesh(new THREE.BoxGeometry(width * 2, arrowLength + arrowLength / 10, width * 2, 1, 1, 1),
            new THREE.MeshLambertMaterial({color:0x0000ff})
        );

        // Adjustiong the collider to the arrow
        colliderY.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI);
        colliderY.translateOnAxis(new THREE.Vector3(0, -1, 0), arrowLength / 2 + width);
        colliderY.visible = colliderVisible;
        colliderY.isCollder = true;

        // will be called if mouse clicks collider
        colliderY.hitByRay = function() {selectedAxis = arrowY.axis; console.log("Hit collider!");};

        arrowY.add(colliderY);

        node.add(arrowY);

        // The following part created the arrow pointing in z-direction.
        var arrowZ = createArrow(new THREE.Vector3(0, 0, -1), 0x00ff00, width, arrowLength);
        arrowZ.axis = Axis.z;
        arrowZ.hitByRay = function() {selectedAxis = arrowZ.axis; console.log("Selected Axis: " + selectedAxis );};

        // The collider helps that the click does not need to hit the arrow precisely
        var colliderZ = new THREE.Mesh(new THREE.BoxGeometry(width * 2, arrowLength + arrowLength / 10, width * 2, 1, 1, 1),
            new THREE.MeshLambertMaterial({color:0x00ff00})
        );

        // Adjustiong the collider to the arrow
        colliderZ.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
        colliderZ.translateOnAxis(new THREE.Vector3(0, 1, 0), arrowLength / 2 + width);
        colliderZ.visible = colliderVisible;
        colliderZ.isCollder = true;

        // will be called if mouse clicks collider
        colliderZ.hitByRay = function() {selectedAxis = arrowZ.axis; console.log("Hit collider!");};

        arrowZ.add(colliderZ);

        node.add(arrowZ);
    }

    /**
     * Set the visibility of the gizmo
     * @param show true if shall be visible, false if shall be hidden
     */
    this.show = function (show) {
        var children = node.getDescendants();

        // Iterating over all gizmo-children and setting their visibility.
        for(var i = 0; i < children.length; i++) {
            if (!children[i].isCollder) {

                children[i].visible = show;
                console.log("Visible: " + show);
            }
        }
        this.visible = show;
    }

    /**
     * Moving the gizmo
     * @param vector in which the gizmo shall be moved, but direction is also dependent from the selected axis.
     */
    this.move = function(vector) {
        var distance = movingSpeed;

        var moveDirection = null;

        if(selectedAxis == Axis.x) {

            // dot product between the vector and the x vector will give the direction on the x-axis(positiv or negative)
            moveDirection = vector.dot(x);

            vector = new THREE.Vector3(1, 0, 0);
        }
        else if(selectedAxis == Axis.y)
        {
            // dot product between the vector and the x vector will give the direction on the y-axis(positiv or negative)
            moveDirection = - vector.dot(y);

            vector = new THREE.Vector3(0, 1, 0);
        } else if (selectedAxis == Axis.z) {

            // dot product between the vector and the x vector will give the direction on the z-axis(positiv or negative)
            moveDirection = vector.dot(z);

            vector = new THREE.Vector3(0, 0, 1);
        }

        if(moveDirection < 0) {
            distance = -distance;
        }

        this.translateOnAxis(vector, distance);

        // updating the position of the object which sgall be controlled by the gizmo
        that._toControl.position = this.position;
        changed();
    }

    /**
     * This method will call all listener, if the poistion of this gizmo has changed
     */
    function changed() {
        for(var i = 0; i < changeListener.length; i++) {
            changeListener[i].changed();
        }
    }

    /**
     * Adding a change listener to this gizmo
     * @param listener an object with a "changed"-method
     */
    this.addChangeListener = function(listener) {
        changeListener.push(listener);
    }

    /**
     * Getting the root node of this gizmo
     * @returns {THREE.Object3D} the root-node of this gizmo
     */
    this.getNode = function() {
        return node;
    }
}

/**
 * This method creates an three-dimensional arrow-object
 * @param direction in which the arrow points
 * @param color of the arrow
 * @param width of the arrow
 * @param length of the arrow without the pike. The pike has a length of 1/10th of length
 * @returns {THREE.ArrowHelper}
 */
var createArrow = function(direction, color, width, length) {
    var origin = new THREE.Vector3();

    var arrowHelper = new THREE.ArrowHelper(direction, origin, length, color, length / 10, width);

    return arrowHelper;
}

Gizmo.prototype = Object.create( THREE.Object3D.prototype );


TranslateGizmo.prototype = new Gizmo;
TranslateGizmo.prototype.constructor = TranslateGizmo;
TranslateGizmo.prototype.deselect = function () {
    this.axis = null;
}

/**
 * Struct defining the 4 possible moving directions
 * @type {{x: number, y: number, z: number, all: number}}
 */
var Axis = {
    x: 0,
    y: 1,
    z: 2,
    all: 3
}
