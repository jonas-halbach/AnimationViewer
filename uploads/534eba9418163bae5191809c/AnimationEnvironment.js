function AnimationEnvironment() {

	var START_ANIM_URI = 'Models/anim exported 266.js';

	var VIEW_ANGLE = 30;
	var NEAR = 1;
	var FAR = 100000;
	
	var self = this;
	
	var width, height;
	
	var viewportSettings = [];
	var lights = [];
	
	var scene = null;
	var animation = null;
	
	var paused = false;
	
	var functionsToInformAboutAnimationTime = [];
	
	this.init = function() {
		var aspect;

		width = $('.viewport').parent().width();
		height = window.innerHeight * 0.9;
		
		aspect = width / height,
		
		scene = new THREE.Scene();
		initRenderer(width, height);
		
		addCamera(VIEW_ANGLE, aspect, NEAR, FAR, 0, 0, width, height);
		
		initEnvironment();
		
		setAnimation(START_ANIM_URI);
	}
	
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
		
		container.appendChild(renderer.domElement);
	}
	
	function addCamera(viewAngle, aspect, near, far, viewportx, viewporty, viewportwidth, viewportheight) {
		var camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);

		camera.position.set(Math.floor((Math.random()*400) - 200), Math.floor((Math.random()*400) - 200), Math.floor((Math.random()*400) - 200));
		camera.lookAt(scene.position);
		
		scene.add(camera);

		viewportSettings.push(new ViewPortSettings(camera, viewportx, viewporty, viewportwidth, viewportheight));	
		viewportSettings[viewportSettings.length - 1].setName("viewport " + (viewportSettings.length - 1));
		viewportSettings[viewportSettings.length - 1].setId(viewportSettings.length - 1);
	}
	
	this.getViewPortSettings = function() {
		return viewportSettings;
	}
	
	function setAnimation(animationURI) {
		
		var loader = new THREE.JSONLoader();
		// load the model and create everything
		loader.load(animationURI, function (geometry, materials) {
		
			  var material;

			  // create a mesh
			  mesh = new THREE.SkinnedMesh(
				geometry,
				new THREE.MeshFaceMaterial(materials)
			  );
			  mesh.position.set(0, 0, 0);
			  mesh.scale.set(10,10,10);
			  // define materials collection
			  material = mesh.material.materials;

			  // enable skinning
			  for (var i = 0; i < materials.length; i++) {
				var mat = materials[i];

				mat.skinning = true;
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

			  render();
		});
	}
	
	this.startAnimation = function() {
		animation.play(0);
	}
	
	this.togglePlayPause = function() {
		animation.pause();
		paused = !paused;
	}
	
	this.pauseAnimation = function(pause) {
		if(self.isAnimationPlaying() && pause) {
			animation.pause();
		} else if(!self.isAnimationPlaying() && !pause) {
			animation.pause();
		}
		
	}
	
	this.isAnimationPlaying = function() {
		
		return !paused && animation.isPlaying && !animation.isPaused;
	}
	
	this.nextAnimationFrame = function() {
		makeAnimationStep(0.01);
	}
	
	this.previousAnimationFrame = function() {
		makeAnimationStep(-0.01);
	}
	
	this.setAnimationFrameTime = function(time) {
		
		setPlayFromAnimationTime(time);		
	}
	
	this.getAnimationTotalTime = function() {
		return animation.data.length
	}
	
	var makeAnimationStep = function(stepSize) {
		
		var tempTime = animation.currentTime + stepSize;
		setPlayFromAnimationTime(tempTime);
	}
	
	var setPlayFromAnimationTime = function(time) {
		var wasPlaying = self.isAnimationPlaying();
		animation.stop();
		animation.play(time);
		THREE.AnimationHandler.update(0);
		if (!wasPlaying) {
			renderSingleFrame();
			animation.pause()
		}
	}
	
	this.registerNeedsTimeUpdate = function(toCall) {
		functionsToInformAboutAnimationTime.push(toCall);
	}
	
	var informAboutTimeChange = function() {
		for(i = 0; i < functionsToInformAboutAnimationTime.length; i++) {
			functionsToInformAboutAnimationTime[i](animation.currentTime);
		}
	}
	
	function initEnvironment() {
		// GROUND
		var floor = -250;
		
		var groundMaterial = new THREE.MeshPhongMaterial( { emissive: 0xbbbbbb } );
		var planeGeometry = new THREE.PlaneGeometry( 16000, 16000 );

		var ground = new THREE.Mesh( planeGeometry, groundMaterial );
		ground.position.set( 0, floor, 0 );
		ground.rotation.x = -Math.PI/2;
		scene.add( ground );

		ground.receiveShadow = true;

		initLights();
		
		// RED CUBE, currently just for testing
		var cube = new THREE.Mesh(
		  new THREE.CubeGeometry(10, 10, 10),
		  new THREE.MeshLambertMaterial({
			color: 0xff0000
		  })
		);
		scene.add(cube);
	}
	
	function renderSingleFrame() {
		
		renderer.setViewport(0, 0, width, height);
		renderer.clear();
		var cam;
		var camPosString;
		var camRotString;
		
		for(i = 0; i < viewportSettings.length; i++) {
			renderer.setViewport(viewportSettings[i].getX(),
								 viewportSettings[i].getY(), 
								 viewportSettings[i].getWidth(), 
								 viewportSettings[i].getHeight());
			//console.log("Viewport settings of viewport " + i + ": " + viewportSettings[i].getX() 
			//			+ ", " + viewportSettings[i].getY() + " " 
			//			+ viewportSettings[i].getWidth() + " " 
			//			+ viewportSettings[i].getHeight());
			 
			cam = viewportSettings[i].camera;
			camPosString = "[" + cam.position.x + ", " + cam.position.y + ", " + cam.position.z + "]";
			camRotString = "[" + cam.rotation.x + ", " + cam.rotation.y + ", " + cam.rotation.z + ", " + cam.rotation.w + "]";
			//console.log("Camera Viewport " + i + " Position: " + camPosString + " rotation: " + camRotString);
			viewportSettings[i].camera.updateProjectionMatrix();
			renderer.render(scene, viewportSettings[i].camera);
		}
		
		informAboutTimeChange();
	}
	
	function render() {
		if(self.isAnimationPlaying()) {
			THREE.AnimationHandler.update(0.01);
		}
		
		renderSingleFrame();
		  
		requestAnimationFrame(render);
	}
	
	function initLights() {
		// LIGHTS

		var light = new THREE.DirectionalLight(0xffffff);

		light.position.set(0, 100, 60);
		light.castShadow = true;
		light.shadowCameraLeft = -60;
		light.shadowCameraTop = -60;
		light.shadowCameraRight = 60;
		light.shadowCameraBottom = 60;
		light.shadowCameraNear = 1;
		light.shadowCameraFar = 1000;
		light.shadowBias = -.0001
		light.shadowMapWidth = light.shadowMapHeight = 1024;
		light.shadowDarkness = .7;
		
		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;
		
		scene.add( light );

		var ambient = new THREE.AmbientLight( 0x222222 );
		scene.add( ambient );


		light = new THREE.DirectionalLight( 0xebf3ff, 1.6 );
		light.position.set( 0, 140, 500 ).multiplyScalar( 1.1 );
		scene.add( light );

		light.castShadow = true;

		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;

		var d = 390;

		light.shadowCameraLeft = -d * 2;
		light.shadowCameraRight = d * 2;
		light.shadowCameraTop = d * 1.5;
		light.shadowCameraBottom = -d;

		light.shadowCameraFar = 3500;
		light.shadowCameraVisible = true;

		light = new THREE.DirectionalLight( 0x497f13, 1 );
		light.position.set( 0, -1, 0 );
		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;
		scene.add( light );
	}
}

function ViewPortSettings(camera, _x, _y, _width, _height) {
	this.camera = camera;
	
	var name = "defaultName";
	var id = 0;
	var x = _x;
	var y = _y;
	var width = _width;
	var height = _height;
	
	console.log("viewport initialisation: x:" + x + " y:" + y + " width: " + width + " height: " + height);
	
	this.getX = function() {
		return x;
	}
	
	this.setX = function(_x) {
		x = _x;
	}
	
	this.setId = function(_id) {
		id = _id;
	}
	
	this.getId = function() {
		return id;
	}
	
	this.getY = function() {
		return y;
	}
	
	this.setY = function(_y) {
		y = _y;
	}
	
	this.getWidth = function() {
		return width;
	}
	
	this.setWidth = function(_width) {
		width = _width;
		updateAspectRatio();
	}
	
	this.getHeight = function() {
		return height;
	}
	
	this.setHeight = function(_height) {
		height = _height;
		updateAspectRatio();
	}
	
	this.splitHorizontal = function(){
		height = height / 2;
		updateAspectRatio();
	}
	
	this.splitVertical = function() {
		height = height / 2;
		updateAspectRatio();
	}
	
	this.getName = function() {
		return name;
	}
	
	this.setName = function(_name) {
		name = _name;
	}
 	
	function updateAspectRatio() {
		camera.aspect = width / height;
	}	
}

var SplitDirection = {
	VERTICAL : 0,
	HORIZONTAL : 1
};