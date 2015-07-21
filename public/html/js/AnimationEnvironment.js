/**
 * Author: Jonas Halbach
 * Creation Date: 24.06.2014
 *
 * This js-File is responsible for the whole WebGL processing like, animation loading and playing, adding lights etc...
 */
function AnimationEnvironment() {

    // Default animation-url playing from start
    var START_ANIM_URI = 'Models/anim exported 266.js';

    // Intrinsic camera parameters.
    var VIEW_ANGLE = 30;
    var NEAR = 1;
    var FAR = 100000;

    // The default number of tiles the viewport is splitted into
    var DEFAULT_TILENUMBER = 1;


    // Reference on this object
    var self = this;

    // width and height of the canvas
    var width, height;

    // Container for viewportsettings, which are used to split the canvas into different tiles, and which camera
    // belongs to which viewport
    var viewportSettings = [];

    // Container for all lights
    var lights = [];

    // All lighthelper existing in the scene
    var lightHelperToUpdate = [];

    // root-node for the scenegraph
    var scene = null;

    // Container for the current animation
    var animation = null;

    // Animation is paused?
    var paused = false;

    // Array of callbackfunctions, which will be executed if animation proceeds.
    var functionsToInformAboutAnimationTime = [];

    var viewportTileNumber = 0;

    this.controllPoints = [];

    // if lights are added to the scene materials need to set needsUpdate = true. So this array contains all materials.
    var materialsToUpdate = [];

    // container for all lightgizmos/-helper
    var lightToGizmos = [];
    var lightToHelper = [];

    /**
     * Initianlizing the scene
     */
    this.init = function () {
        var aspect;

        width = $('.viewport').parent().width();

        // Why multiplied with 0.9? comment your code man! TODO: Add a comment
        height = window.innerHeight * 0.9;

        aspect = width / height;

        scene = new THREE.Scene();
        initRenderer(width, height);

        this.setTileNumber(DEFAULT_TILENUMBER);

        initEnvironment();

        // Settings the startanimation
        this.setAnimation(START_ANIM_URI, animationLengthUpdate, render);
    }


    /**
     * Initializing the renderer
     * @param width of the canvas
     * @param height of the canvas
     */
    function initRenderer(width, height) {

        var container;

        container = document.querySelector('.viewport');

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(width, height);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
        renderer.shadowMapType = THREE.PCFShadowMap;
        renderer.shadowMapAutoUpdate = true;
        renderer.autoClear = false;
        renderer.setClearColorHex(0x000000);

        container.appendChild(renderer.domElement);
    }

    /**
     * Function to add a camera to the scene
     * @param viewAngle of the camera
     * @param aspect of the camera
     * @param near distance to image plane of the camera
     * @param far distance to image plane of the camera
     * @param viewportx x coordinate of the viewport, where viewport starts
     * @param viewporty y coordinate of the viewport, where viewport starts
     * @param viewportwidth width of the viewport
     * @param viewportheight height og the viewport
     */
    function addCamera(viewAngle, aspect, near, far, viewportx, viewporty, viewportwidth, viewportheight) {
        var camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);

        camera.position.set(Math.floor((Math.random() * 400) - 200), Math.floor((Math.random() * 400) - 200), Math.floor((Math.random() * 400) - 200));
        camera.lookAt(scene.position);

        scene.add(camera);

        viewportSettings.push(new ViewPortSettings(camera, viewportx, viewporty, viewportwidth, viewportheight));
        viewportSettings[viewportSettings.length - 1].setName("viewport " + (viewportSettings.length - 1));
        viewportSettings[viewportSettings.length - 1].setValue(viewportSettings.length - 1);
    }

    /**
     * Adding an object to the scene
     * @param object the object to add
     */
    this.addToScene = function (object) {
        scene.add(object);
    }

    /**
     * get all viewportsettings of the scene
     * @returns {Array} scenes viewportsettings
     */
    this.getViewPortSettings = function () {
        return viewportSettings;
    }

    /**
     * Stop the current animation and remove the mesh from the scene
     */
    this.removeCurrentModelAndStopAnimation = function () {
        THREE.AnimationHandler.removeFromUpdate(mesh.geometry.animation);
        scene.remove(mesh);
    }

    /**
     * Splitting the canvas into more tiles, by specifying the tilenumber
     * @param tilenumber is the number of tiles the viewport will be splittet into
     *                  Possible: 2 and 4! If any other number is given the viewport will not be splitted
     */
    this.setTileNumber = function (tilenumber) {
        console.log("Viewportsettings.length: " + viewportSettings.length);
        if (viewportTileNumber != tilenumber) {
            removeAllCamerasFromScene();
            viewportSettings = [];
            viewportTileNumber = tilenumber;
            var aspect = width / height;
            switch (tilenumber) {
                case "2":
                    var tilewidth = width / 2;
                    var pos1 = new THREE.Vector3(100, 0, 0);
                    var pos2 = new THREE.Vector3(0, 0, 100);
                    var positions = new Array(pos1, pos2);
                    aspect = tilewidth / height;

                    for (i = 0; i < 2; i++) {
                        var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, aspect, NEAR, FAR);
                        camera.position.set(positions[i].x, positions[i].y, positions[i].z);
                        camera.lookAt(scene.position);
                        scene.add(camera);

                        var viewportX = i * tilewidth;
                        var viewportY = 0;


                        viewportSettings.push(new ViewPortSettings(camera, viewportX, viewportY, tilewidth, height));
                        viewportSettings[i].setName(getViewPortNameByTileIndex(i));
                        viewportSettings[i].setValue(i);
                    }
                    break;
                case "4":
                    var tilewidth = width / 2;
                    var tileheight = height / 2;
                    aspect = tilewidth / tileheight;
                    var pos1 = new THREE.Vector3(100, 0, 0);
                    var pos2 = new THREE.Vector3(0, 0, 100);
                    var pos3 = new THREE.Vector3(0, 100, 0);
                    var pos4 = new THREE.Vector3(100, 100, 0);
                    var positions = new Array(pos1, pos2, pos3, pos4);
                    var k = 0;
                    for (i = 0; i < 2; i++) {
                        for (j = 0; j < 2; j++) {

                            var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, aspect, NEAR, FAR);
                            camera.position.set(positions[k].x, positions[k].y, positions[k].z);
                            camera.lookAt(scene.position);
                            scene.add(camera);

                            var viewportx = j * tilewidth;
                            var viewporty = i * tileheight;

                            console.log("viewportx: " + viewportx + " viewporty: " + viewporty);

                            viewportSettings.push(new ViewPortSettings(camera, viewportx, viewporty, tilewidth, tileheight));
                            viewportSettings[k].setName(getViewPortNameByTileIndex(k));
                            viewportSettings[k].setValue(k);
                            k++
                        }
                    }
                    break;
                default:

                    var positionX = -200
                    var positionY = -200;
                    var positionZ = -200;
                    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, aspect, NEAR, FAR);
                    camera.position.set(positionX, positionY, positionZ);

                    camera.lookAt(scene.position);
                    scene.add(camera);

                    viewportSettings.push(new ViewPortSettings(camera, 0, 0, width, height));
                    viewportSettings[0].setName(getViewPortNameByTileIndex(0));
                    viewportSettings[0].setValue(0);
                    break;
            }
        }
    }


    /**
     * Remove all cameras from the scene
     */
    var removeAllCamerasFromScene = function () {
        for (var i = 0; i < viewportSettings.length; i++) {
            scene.remove(viewportSettings[i].camera);
        }
    }

    /**
     * Getting the name of the viewport specified by index
     * @param index the index of the viewport, which name shall be returned
     * @returns {string} the name of the viewport
     */
    var getViewPortNameByTileIndex = function (index) {

        var viewportname = "Viewport";
        if (viewportSettings.length > 1) {
            switch (index) {
                case "0":
                    viewportname += viewportSettings.length > 2 ? " top" : "";
                    viewportname += " left";
                    break;
                case "1":
                    viewportname += viewportSettings.length > 2 ? " top" : "";
                    viewportname += " right";
                    break;
                case "2":
                    viewportname += " bottom left";
                    break;
                case "3":
                    viewportname += " bottom right";
                    break;
                default:
                    viewportname += index;
                    break;
            }
        } else {
            viewportname = "Full viewport";
        }

        return viewportname;
    }

    /**
     * Getting the camera of the viewport where the cursor is over.
     * @param mousePos the position of the mouse-cursor as THREE.Vector2-Object
     */
    this.getActiveCamera = function (mousePos) {
        var activeViewPort = this.getActiveViewPort(mousePos);
        return activeViewPort.camera;
    }

    /**
     * Getting the viewport where the mouse-cursor is over
     * @param mousePos the position of the mouse-cursor as THREE.Vector2-Object
     * @returns {ViewPortSettings} the viewport where the mousecurser is over
     */
    this.getActiveViewPort = function (mousePos) {
        var activeViewport = null;
        // active viewport is dependent from the number of existing viewports.
        // If just one viewport exists result is always the viewport at index 0.
        if (viewportSettings.length == 1) {
            activeViewport = viewportSettings[0];
        } else {
            if (viewportSettings.length > 1) {
                // If viewport-number is greate than 2
                // Checking if mouse pos lies in the right or left half of the canvas
                var i = (mousePos.x > (width / 2)) ? 1 : 0;
                // If viewport-number is 4
                // checking if the mousepos lies over the horizon of the canvas
                if (viewportSettings.length == 4) {
                    i += (mousePos.y < (height / 2)) ? 2 : 0;
                }
                activeViewport = viewportSettings[i];
            }
        }

        return activeViewport;
    }

    /**
     * This function sets a new animation.
     * @param animationURI The URL where the animation is
     * @param animationLengthUpdate a function which will be called to set the animation length
     *                              needed for the time-slider
     * @param renderCallback a callback to the render function, so that the render-function will not be executed
     *                          several times. The rendercallback must not be given more than one time during execution.
     *                          Otherwise the animation will run faster everytime the callback is specified.
     */
    this.setAnimation = function (animationURI, animationLengthUpdate, renderCallback) {

        materialsToUpdate = [];
        var loader = new THREE.JSONLoader();

        // load the model and create everything
        loader.load(animationURI, function (geometry, materials) {

            var material;

            var meshFaceMaterial = new THREE.MeshFaceMaterial(materials);

            // create a mesh
            mesh = new THREE.SkinnedMesh(
                geometry,
                meshFaceMaterial
            );

            mesh.position.set(0, 0, 0);
            // Scale is ten otherwise the mesh would be to small(For tested meshes).
            mesh.scale.set(10, 10, 10);

            // define materials collection
            material = mesh.material.materials;

            // enable skinning
            for (var i = 0; i < materials.length; i++) {
                var mat = materials[i];

                mat.skinning = true;
                materialsToUpdate.push(mat);
            }

            scene.add(mesh);

            // add animation data to the animation handler
            THREE.AnimationHandler.add(mesh.geometry.animation);

            // create animation
            animation = new THREE.Animation(
                mesh,
                'ArmatureAction',
                THREE.AnimationHandler.CATMULLROM
            );

            // play the anim
            animation.play();

            //Update the animation length
            animationLengthUpdate(mesh.geometry.animation.length);

            if(renderCallback) {
                render();
            }
        });
    }

    /**
     * Start the animation
     */
    this.startAnimation = function () {
        animation.play(0);
    }

    /**
     * Toggle the animation-state: Play -> Pause and Pause -> Play
     */
    this.togglePlayPause = function () {
        // THREE.js has the toggling included
        animation.pause();
        // setting the state if animation is paused. This is needed for resetting the animation time, because the
        // animation will started, and again paused, if it was paused before.
        paused = !paused;
    }

    /**
     * Pause the animation
     * @param pause boolean
     */
    this.pauseAnimation = function (pause) {
        if (self.isAnimationPlaying() && pause) {
            animation.pause();
        } else if (!self.isAnimationPlaying() && !pause) {
            animation.pause();
        }

    }

    /**
     * Checking if animation is playing or paused.
     * @returns {boolean} true if animation is playing.
     */
    this.isAnimationPlaying = function () {

        var isPlaying = false;

        if(animation) {
            isPlaying = !paused && animation.isPlaying && !animation.isPaused;
        }

        return isPlaying;
    }

    /**
     * Setting the animation to the next frame
     */
    this.nextAnimationFrame = function () {
        makeAnimationStep(0.01);
    }

    /**
     * Setting the animation to the previous frame
     */
    this.previousAnimationFrame = function () {
        makeAnimationStep(-0.01);
    }

    /**
     * Setting the time, from which time the animation shall start again
     * @param time the time frim hich the animation shall start again
     */
    this.setAnimationFrameTime = function (time) {

        setPlayFromAnimationTime(time);
    }

    /**
     * Getting the animation-length
     * @returns {int} the animation-length
     */
    this.getAnimationTotalTime = function () {
        return animation.data.length;
    }

    /**
     * Making a animation-timestep in the current animation
     * @param stepSize the time-step size. Negative values are possible
     */
    var makeAnimationStep = function (stepSize) {
        var tempTime = animation.currentTime + stepSize;
        setPlayFromAnimationTime(tempTime);
    }

    /**
     * Setting the time from which the animation shall be played
     * @param time from which the animation shall be played
     */
    var setPlayFromAnimationTime = function (time) {
        //Storing if the animation was playing before
        var wasPlaying = self.isAnimationPlaying();

        animation.stop();

        // Playing the animation from given time-point
        animation.play(time);
        THREE.AnimationHandler.update(0);

        // If animation was paused before setting the time. Rendering the scene and repausing the animation
        if (!wasPlaying) {
            renderSingleFrame();
            animation.pause();
        }
    }

    /**
     * Function to register function which shall be called if animation is proceeding
     * @param toCall the function to call.
     */
    this.registerNeedsTimeUpdate = function (toCall) {
        functionsToInformAboutAnimationTime.push(toCall);
    }

    /**
     * Calling all functions when animation proceeds
     */
    var informAboutTimeChange = function () {
        for (i = 0; i < functionsToInformAboutAnimationTime.length; i++) {
            functionsToInformAboutAnimationTime[i](animation.currentTime);
        }
    }

    /**
     * Initializing the environment.
     */
    function initEnvironment() {
        // GROUND
        var floor = -250;

        var size = 100;
        var step = 10;

        // Adding a grind to the ground of the scene
        var gridHelper = new THREE.GridHelper( size, step );
        gridHelper.setColors(0xeeeeee, 0x333333);
        scene.add( gridHelper );

        initLights();

    }

    /**
     * This function renders a single frame.
     */
    function renderSingleFrame() {

        renderer.setViewport(0, 0, width, height);
        renderer.clear();
        var cam;

        updateLightHelper();

        // Rendering all viewports.
        for (i = 0; i < viewportSettings.length; i++) {

            renderer.setViewport(viewportSettings[i].getX() + 1,
                viewportSettings[i].getY() + 1,
                viewportSettings[i].getWidth() - 1,
                viewportSettings[i].getHeight() - 1);

            cam = viewportSettings[i].camera;

            viewportSettings[i].camera.updateProjectionMatrix();
            renderer.render(scene, viewportSettings[i].camera);
        }

        informAboutTimeChange();
    }

    /**
     * Updating the animation if not paused and frequently rendering the scene.
     */
    function render() {
        if (self.isAnimationPlaying()) {
            THREE.AnimationHandler.update(0.01);
        }

        renderSingleFrame();

        requestAnimationFrame(render);
    }

    /**
     * Adding an initial light to the scene
     */
    function initLights() {
        // LIGHTS
        var ambient = self.addAmbientLight(0x222222);
        lights.push(ambient);
        scene.add(ambient);
    }

    /**
     * Adding a light of a special type to the scene
     * @param lightType the shall be off
     * @returns {THREE.Light} the added light
     */
    this.addLight = function (lightType) {

        var newLightDefaultColor = 0x497f13;

        var light = null;
        if(lightType == LightType.point) {
           light = this.addPointLight(newLightDefaultColor);
        } else if(lightType == LightType.spot) {
            light = this.addSpotLight(newLightDefaultColor);
        } else if(lightType == LightType.directional) {
            light = this.addDirectionalLight(newLightDefaultColor);
        } else if(lightType == LightType.ambient) {
            light = this.addAmbientLight(newLightDefaultColor);
        }

        if(light) {

            lights.push(light);
            scene.add(light);

            // the needsUpdate-property of all materials of the objects, which shall be influenced by light, must be
            // set to true if the light-situation in the scene changed.
            // see also https://github.com/mrdoob/three.js/issues/598
            updateMaterials();
        }

        return light;
    }

    /**
     * Creating a pointlight, which is a light lighting from one center in all directions
     * @param color of the spotlight
     * @returns {THREE.SpotLight} the light-object to add
     */
    this.addPointLight = function(color) {
        var light = new THREE.PointLight(color, 100, 100);
        light.rotateable = false;
        light.type = LightType.point;
        addLightVisuals(light);

        return light;
    }

    /**
     * Creating a spotlight, which is a light, going from one point and lighting to an otherone.
     * has got an opening-angle
     * @param color of the spotlight
     * @returns {THREE.SpotLight} the light-object to add
     */
    this.addSpotLight = function(color) {
        var light = new THREE.SpotLight(color);
        light.rotateable = true;
        light.type = LightType.spot;

        var target = new THREE.Object3D();

        var targetGizmo = new TranslateGizmo(this, target);

        light.changed = function() {
            light.target = target;
        }

        targetGizmo.addChangeListener(light);
        connectLightToGizmo(light, targetGizmo);
        self.controllPoints.push(targetGizmo);

        scene.add(target);

        addLightVisuals(light);

        return light;
    }

    /**
     * Creating a directional-light, which is a light, shining from a special direction, with parallel rays
     * @param color of the directional light
     * @returns {THREE.DirectionalLight} the light-object to add
     */
    this.addDirectionalLight = function(color) {
        var light = new THREE.DirectionalLight(color, 10);
        light.rotateable = false;
        light.type = LightType.directional;

        addLightVisuals(light);

        return light;
    }

    /**
     * Adding an ambient light to the scene
     * @param color the ambient light shall have
     * @returns {THREE.AmbientLight} the ambient light-object
     */
    this.addAmbientLight = function(color) {
        var ambient = new THREE.AmbientLight(color);
        ambient.rotateable = false;
        ambient.type = LightType.ambient;

        return ambient;
    }

    /**
     * Adding visual helpers to the light
     * @param light where the visual helpers(gizmos, lighthelper) will be added to
     */
    function addLightVisuals(light) {
        addLightHelper(light);

        addLightGizmo(light);
    }

    /**
     * add a lighthelper to the light.
     * @param light to which the lighthelper will be connected
     */
    function addLightHelper(light) {
        var lightHelper = null;

        // Lighthelper must be of the type of the light.
        if (light.type == LightType.directional) {
            lightHelper = new THREE.DirectionalLightHelper(light, 10);
        } else if(light.type == LightType.spot) {
            lightHelper = new THREE.SpotLightHelper(light, 10);
        } else if(light.type == LightType.point) {
            lightHelper = new THREE.PointLightHelper(light, 10);
        }
        if(lightHelper) {
            scene.add(lightHelper);
            lightHelperToUpdate.push(lightHelper);
            lightToHelper[light.id] = lightHelper;
        }
    }

    /**
     * Get the lighthelper connected to the light
     * @param light where the helper is connected to
     * @returns {THREE.lighthelper} the lighthelper which is connected to the light
     */
    this.getLightHelper = function(light) {
        var lightHelper = null;
        if(light) {
            lightHelper = lightToHelper[light.id];
        }

        return lightHelper;
    }

    /**
     * Get the first gizmo connected to the light
     * @param light where the gizmo is connected to
     * @returns {TranslateGizmo} the gizmo which is connected to the light
     */
    this.getLightGizmo = function(light) {
        var gizmo = null;
        if(light) {
            var gizmos = lightToGizmos[light.id];
            if(gizmos) {
                gizmo = gizmos[0];
            }
        }
        return gizmo;
    }

    /**
     * Add a lightgizmo to the scene
     * @param light where the gizmo will be connected to
     */
    function addLightGizmo(light) {
        var lightGizmo = new TranslateGizmo(self, light);
        self.controllPoints.push(lightGizmo);
        connectLightToGizmo(light, lightGizmo);
    }

    /**
     * This function associates a light with gizmos.
     * @param light the light where a gizmo shakll be added
     * @param gizmo
     */
    function connectLightToGizmo(light, gizmo) {
        // if a connection between light and gizmo exists yet, just add the new gizmo, otherwise first create a new
        // array and add connect it to the light
        if(lightToGizmos[light.id]) {
            lightToGizmos[light.id].push(gizmo);
        } else {
            lightToGizmos[light.id] = [];
            lightToGizmos[light.id].push(gizmo);
        }
    }

    /**
     * Hiding the gizmo of a special light
     * @param light the light, of which the gizmos shall be hidden
     * @param hide true if gizmo shall be hidden, false if gizmo shall be visible
     */
    this.hideGizmo = function(light, hide) {
        if(lightToGizmos[light.id]) {
            for(var i = 0; i < lightToGizmos[light.id].length; i++) {
                lightToGizmos[light.id][i].show(!hide);
            }
        }
    }

    /**
     * Setting the visibility of all gizmos existing in the scene
     * @param hide true if gizmos shall be hidden, false if gizmos shall be visible
     */
    this.hideAllLightGizmos = function(hide) {
        // Iteration over all lights
        for(var i = 0; i < lights.length; i++) {
            // lightToGizmos is a dictionary connecting the lights in the scene with gizmos, which can be more than one
            var lightGizmos = lightToGizmos[lights[i].id];
            if (lightGizmos) {
                // Setting the visibility of the gizmos of a light.
                for (var j = 0; j < lightGizmos.length; j++) {
                    lightGizmos[j].show(!hide);
                }
            }
        }
    }

    /**
     * Setting the visibility of a lighthelper, which is assigned to a light.
     * @param light the light, of which the lighthelper-visibility shall be setted
     * @param hide true if lighthelper shall be hidden. false if lighthelper shall be visible
     */
    this.hideLightHelper = function(light, hide) {
        if(lightToHelper[light.id]) {

            // lightToHelper is a dictionary assigning a light to a lighthelper
            var lightHelper = lightToHelper[light.id];

            // Setting the visibility of all childelement of the lighthelper to hide-value, because a lighthelper
            // consists of several lines
            lightHelper.traverse(function(child){
                child.visible = !hide;
            });

            lightHelper.visible = !hide;
        }
    }

    /**
     * Setting the visibility of all light-helper in the scene
     * @param hide true if lighthelper shall be hidden. false if lighthelper shall be visible
     */
    this.hideAllLightHelper = function(hide) {
        for(var i = 0; i < lights.length; i++) {
            self.hideLightHelper(lights[i], hide);
        }
    }

    /**
     * returning the light-array
     * @returns {Array} the light-array
     */
    this.getLights = function () {
        return lights;
    }

    /**
     * delelete a light from the scene
     * @param light the light to delete
     */
    this.deleteLight = function(light) {

        if(light) {
            // light can have more than one gizmo(spotlight)
            var gizmos = lightToGizmos[light.id];
            if (gizmos) {

                // Iterating over all gizmos and deleting them from list
                for (var i = 0; i < gizmos.length; i++) {
                    var gizmoIndex = self.controllPoints.indexOf(gizmos[i]);
                    if (gizmoIndex > -1) {
                        self.controllPoints.splice(gizmoIndex, 1);
                    }
                    // Deleting the gizmo from the scene
                    scene.remove(gizmos[i]);
                }
            }

            // Delete the lighthelper which is associated with the light
            if (lightToHelper[light.id]) {
                scene.remove(lightToHelper[light.id]);
            }

            // Delete the light from the light-array
            var lightIndex = lights.indexOf(light);
            if (lightIndex > -1) {
                lights.splice(lightIndex, 1);
            }

            // Delete the light from the scene
            scene.remove(light);
        }

    }

    /**
     * Updates the materials. This is needed, if a new light is added to the scene.
     */
    function updateMaterials() {
        for (var i = 0; i < materialsToUpdate.length; i++) {
            materialsToUpdate[i].needsUpdate = true;
        }
    }

    /**
     * Updates light helper!
     */
    function updateLightHelper() {
        for (var i = 0; i < lightHelperToUpdate.length; i++) {
            lightHelperToUpdate[i].update();
        }
    }
}

/**
 * Class to store the settings of a viewport-segment
 * @param camera which will render this segment
 * @param _x coordinate where segment begins
 * @param _y coordinate where segment begins
 * @param _width of the segment
 * @param _height of the segment
 * @constructor
 */
function ViewPortSettings(camera, _x, _y, _width, _height) {
    this.camera = camera;

    // An name which could be used to idendify the segment in a list
    var name = "defaultName";

    // Storing the order of the viewport:
    // [2 3]
    // [0 1]
    var value = 0;

    var x = _x;
    var y = _y;
    var width = _width;
    var height = _height;

    console.log("viewport initialisation: x:" + x + " y:" + y + " width: " + width + " height: " + height);

    this.getX = function () {
        return x;
    }

    this.setX = function (_x) {
        x = _x;
    }

    this.setValue = function (_value) {
        value = _value;
    }

    this.getValue = function () {
        return value;
    }

    this.getY = function () {
        return y;
    }

    this.setY = function (_y) {
        y = _y;
    }

    this.getWidth = function () {
        return width;
    }

    this.setWidth = function (_width) {
        width = _width;
        updateAspectRatio();
    }

    this.getHeight = function () {
        return height;
    }

    this.setHeight = function (_height) {
        height = _height;
        updateAspectRatio();
    }

    this.splitHorizontal = function () {
        height = height / 2;
        updateAspectRatio();
    }

    this.splitVertical = function () {
        height = height / 2;
        updateAspectRatio();
    }

    this.getName = function () {
        return name;
    }

    this.setName = function (_name) {
        name = _name;
    }

    function updateAspectRatio() {
        camera.aspect = width / height;
    }
}

var SplitDirection = {
    VERTICAL: 0,
    HORIZONTAL: 1
};