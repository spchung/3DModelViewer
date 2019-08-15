
// Global Vars 
var scene;
var camera, logoCamera;
var renderer;
var models = [];

//logo
var logo;

var linkToFile;
var controls;

//Animation 
const mixers = [];
const clock = new THREE.Clock();

//ui elements 
const realFileBtn = document.getElementById( 'real-file' );
const customBtn = document.getElementById( 'load-button' );
const customText = document.getElementById( 'load-text' );
const resetBtn = document.getElementById( 'reset-button' ); 

resetBtn.addEventListener( "click", function() {
  console.log( 'reseting scene', models.length);
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

  var ambLight = new THREE.AmbientLight( 0x404040, 10 ); // soft white light
  scene.add( ambLight );
  
  instantiateLogo();

  camera.position.z = 50;
}

// AEMASS LOGO
const logoPath = '/assets/dark-transparent.png';
// to be replaced by an Aemass 3D logo 
var instantiateLogo = function(){
  var geometry = new THREE.BoxGeometry(1, 1, 1);
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
  scene.remove(models.pop());
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
      console.log(reader.result);
      loadGLTFFromFile(reader.result);
    }
}});

// Works for both animated and non-animated GLBs
var loadGLTFFromFile = function( arrayBuff ) {
  const glbLoader = new THREE.GLTFLoader();

  const animationCheck = function( obj ) {
    if ( obj.animations.length > 0 ) {
      console.log( " found animations ");
      loadAnimatedModel( obj, scale, position );
    }
    else {
      console.log(" hi no ");
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

  const scale = new THREE.Vector3( 1,1,1 );
  const position = new THREE.Vector3( 0,0,0 );
  glbLoader.parse(arrayBuff, '',  obj => animationCheck( obj ),  onError);
}

var animate = function() {
  requestAnimationFrame(animate);
  update();
  controls.update();
  renderer.render(scene, camera);
  
};


main();
animate();