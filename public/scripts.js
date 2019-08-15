
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
//
var instantiateLogo = function(){
  // const textureLoader = new THREE.TextureLoader();
  // const material = new THREE.MeshLambertMaterial({
  //   map: textureLoader.load( logoPath )
  // });

  // var geometry = new THREE.PlaneGeometry(67.5,17.1);
  // var mesh = new THREE.Mesh ( geometry, material );
  // mesh.position.set( 0,0,0 );

  // logoScene.add( logoCamera, mesh );

  // fileLoader.load( logoPath, (logo) => onLoad(logo)); 

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

var animate = function() {
  requestAnimationFrame(animate);
  update();
  controls.update();
  renderer.render(scene, camera);
  
};

// listens to load actions on the whole window 
window.addEventListener("load", function() {
  document.getElementById("real-file").onchange = function(event) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(event.srcElement.files[0]);
    // var me = this;
    reader.onload = function () {
      // linkToFile = reader.result;
      loadGLTFFromFile(reader.result);
    }
}});

//Only works for animated files 
var loadGLTFFromFile = function(arrayBuff) {
  const glbLoader = new THREE.GLTFLoader();

  //reusable upload function 
  const onLoad = function( obj, scale, position ) {
    //adjust position and scale of loaded model 
    const model = obj.scene.children[ 0 ];
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

  const onError = ( errorMessage ) => { console.log( errorMessage )};


  const scale = new THREE.Vector3( 1,1,1 );
  const position = new THREE.Vector3( 0,0,0 );
  glbLoader.parse(arrayBuff, '',  obj => onLoad( obj, scale, position ),  onError);
}


main();
animate();