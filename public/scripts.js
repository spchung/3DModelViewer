
// Global Vars 
var scene;
var camera, logoCamera;
var renderer;
var models = [];
var controls; //orbitControl

//logo
var logo;

var linkToFile;

// dat GUI helper you see on the top right of your window
var gui = new dat.GUI();

//Animation 
const mixers = [];
const clock = new THREE.Clock();

//ui elements 
const realFileBtn = document.getElementById( 'real-file' );
const customBtn = document.getElementById( 'load-button' );
const customText = document.getElementById( 'load-text' );
const resetBtn = document.getElementById( 'reset-button' ); 

resetBtn.addEventListener( "click", function() {
  // scene.remove( models[0] );
  resetScene();
  
});

customBtn.addEventListener( "click", function() {
  realFileBtn.click();
}); 

realFileBtn.addEventListener( "change", function() {
  if (realFileBtn.value) {
    customText.innerHTML = realFileBtn.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
  }
  else {
    customText.innerHTML = "No File Chosen Yet."
  }
});

// Main Functions 
var main = function () {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild( renderer.domElement );

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  scene.background  = new THREE.Color( '#8f97a8' );

  var ambLight = new THREE.AmbientLight( 0x404040, 1 ); // soft white light
  var topLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
  var bottomLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
  var sideLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
  var backLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
  bottomLight.position.set( 0,-5,0 );
  sideLight.position.set( 0,0,5 );
  backLight.position.set( 0,0,-5) ;
  scene.add( ambLight, sideLight, bottomLight, topLight );
  
  instantiateLogo();

  camera.position.z = 50;
}

// AEMASS LOGO
const logoPath = '/assets/dark-transparent.png';
// to be replaced by an Aemass 3D logo 
var instantiateLogo = function(){
  var geometry = new THREE.BoxGeometry(2, 2, 2);
  var material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true
  });

  logo = new THREE.Mesh(geometry, material);
  models.push( logo );
  scene.add( logo );
}

// for reseting the scene 
var resetScene = function() {
  if (models.length > 0){
    for (let i=0; i < models.length; i++){
      scene.remove(models.pop());
      console.log( "current number of models: ", models.length );
    }
  }
  else {
    console.log( "no more models" );
    
  }
  instantiateLogo();
  
};

// for animations 
var update = function () {
  const delta = clock.getDelta();
  // console.log("animating");
  for ( const mixer of mixers ) {
    mixer.update( delta );
  }
}

// listens to load actions on the whole window 
window.addEventListener("load", function() {
  document.getElementById("real-file").onchange = function(event) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(event.srcElement.files[0]);
    // var me = this;
    reader.onload = function () {
      loadGLTFFromFile(reader.result);
    }
}});

// Works for both animated and non-animated GLBs
var loadGLTFFromFile = function( arrayBuff ) {
  const glbLoader = new THREE.GLTFLoader();
  // var boxHeight;

  var scale = new THREE.Vector3( 1,1,1 );
  var position = new THREE.Vector3( 0,0,0 );
  
  const animationCheck = function( obj ) {
    // coverage box of the loaded model > used to compute model center point 
    var objBox = new THREE.Box3().setFromObject ( obj.scene.children[0] );
    position.y = -(objBox.min.y + objBox.max.y)/2; 

    if ( obj.animations.length > 0 ) {
      console.log( " found animations ");
      loadAnimatedModel( obj, scale, position );
    }
    else {
      console.log(" no animation  ");
      
      loadStaticModel(obj, scale, position );
    }
  }

  //reusable upload function 
  const loadAnimatedModel = function( obj, scale, position ) {
    //adjust position and scale of loaded model 
    var model = obj.scene.children[ 0 ];
    model.position.copy( position );
    model.scale.copy( scale );

    //get and append animation to the global mixers array 
    const animations = obj.animations[ 0 ];
    const mixer = new THREE.AnimationMixer( model ); 
    mixers.push( mixer );

    const action = mixer.clipAction( animations );
    action.play();

    models.push( model );

    scene.remove( logo );
    scene.add( model );
    addToDatGui( model );
  };

  const loadStaticModel = function( obj, scale, position ) {
    var model = obj.scene.children[ 0 ]; 
    model.position.copy( position );
    model.scale.copy( scale );

    models.push ( model );
    scene.remove( logo );
    scene.add( model );
  }

  const onError = ( errorMessage ) => { console.log( errorMessage )};

  
  glbLoader.parse(arrayBuff, '',  obj => animationCheck( obj ),  onError);
  
}

var getScale = function(an_object) {
  var objBox = new THREE.Box3().setFromObject( an_object );
  console.log( objBox.min, objBox.max )
}

//DAT GUI 
///////////
//gui element placeholders 
var controller = new function() {
  this.scale = 1;
  this.positionX = 0;
  this.positionY = 0;
  this.positionZ = 0;
  this.rotationX = 0;
  this.rotationY = 90;
  this.rotationZ = 0;
  // this.boxColor = color;
  this.castShadow = true;
  this.boxOpacity = 1;
}();

// Add elements to gui 
var addToDatGui = function( sceneObject ) {
  console.log( Object.keys( sceneObject ) );

  gui.add( controller, 'scale', 0.1, 5).onChange( function(){
    sceneObject.scale.x = controller.scale;
    sceneObject.scale.y = controller.scale;
    sceneObject.scale.z = controller.scale;
  });
  // var f1 = gui.addFolder('Scale');
  gui.add 

};

//animation
///////////
var animate = function() {
  requestAnimationFrame(animate);
  update();
  controls.update();
  renderer.render(scene, camera);
  
};


main();
animate();
