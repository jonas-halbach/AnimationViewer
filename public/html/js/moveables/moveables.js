/**
 * Author: Jonas Halbach
 * Creation Date: 24.06.2014
 *
 * This js-File contains all moveable objects like lights.
 */

function Moveable(scenenode, environment) {

    var that = this;
    var root = null;
    var _node = scenenode;
    var _environment = environment;

    var _defaultColor = 0x090909;
    var _highlightColor = 0xdddddd;

    var _scaleRotateTranslateState = ScaleRotateTranslateState.translate;

    init();

    function init() {
        root = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10),  new THREE.MeshLambertMaterial({
            color: _defaultColor
        }));

        //_environment.addToScene(root);
        that.add(root);
        root.add(_node);
    }

    this.move = function (vector) {

    }

    this.rotate = function (degrees, axis) {

    }

    this.HitByRay = function() {
        alert("a ray hit me!");
    }
}

Moveable.prototype = new THREE.Object3D();
Moveable.prototype.constructor = Moveable;



var ScaleRotateTranslateState = {

    scale : 0,
    translate : 1,
    rotate : 2

}

var LightType = {
    ambient : "Ambient",
    area : "Area",
    directional : "Directional",
    hemisphere : "Hemisphere",
    point : "Point",
    spot : "Spot"
}