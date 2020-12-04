/*jshint esversion: 6 */

var scene, camera, renderer, controls;
const CLOUD_RADIUS = 8;
const WATER_LEVEL = 4;
const ZOOM = 20;
const TERRAIN_SIZE = 40;

function generateCubeGeometry() {
  const boxUnit = 1;
  const boxWidth = boxUnit;
  const boxHeight = boxUnit;
  const boxDepth = boxUnit;
  return new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
}

function generateRainGeometry() {
  const boxUnit = 1;
  const boxWidth = boxUnit/4;
  const boxHeight = boxUnit;
  const boxDepth = boxUnit/4;
  return new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
}

function hsl(h, s, l) {
  return (new THREE.Color()).setHSL(h, s, l);
}

const loader = new THREE.TextureLoader();
loader.setPath( 'textures/' );
const GrassMaterials = [
  new THREE.MeshPhongMaterial({map: loader.load('grass_block_side.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('grass_block_side.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('grass_block_top.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('dirt.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('grass_block_side.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('grass_block_side.png')}),
];

const DirtMaterials = [
  new THREE.MeshPhongMaterial({map: loader.load('dirt.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('dirt.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('dirt.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('dirt.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('dirt.png')}),
  new THREE.MeshPhongMaterial({map: loader.load('dirt.png')}),
];

const waterColor = hsl(5 / 8, 1, 0.5);
const WaterMaterials = [
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0.5, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0, transparent: true})),
];

const rainColor = hsl(5 / 8, 1, 0.5);
const RainMaterials = [
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0.5, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0.5, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0.5, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0.5, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0.5, transparent: true})),
  new THREE.MeshPhongMaterial(({color: waterColor, opacity: 0.5, transparent: true})),
];

const cloudColor = hsl(0, 1, 1);
const CloudMaterials = [
  new THREE.MeshPhongMaterial(({color: cloudColor, opacity: 1, transparent: true})),
  new THREE.MeshPhongMaterial(({color: cloudColor, opacity: 1, transparent: true})),
  new THREE.MeshPhongMaterial(({color: cloudColor, opacity: 1, transparent: true})),
  new THREE.MeshPhongMaterial(({color: cloudColor, opacity: 1, transparent: true})),
  new THREE.MeshPhongMaterial(({color: cloudColor, opacity: 1, transparent: true})),
  new THREE.MeshPhongMaterial(({color: cloudColor, opacity: 1, transparent: true})),
];

function makeInstance(geometry, x, y = 0, z = 0, material = "dirt") {
  var materials = DirtMaterials;
  switch (material) {
    case "grass":
      materials = GrassMaterials;
      break;
    case "dirt":
      materials = DirtMaterials;
      break;
    case "water":
      materials = WaterMaterials;
      break;
    case "cloud":
      materials = CloudMaterials;
      break;
    default:

  }
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);

  cube.position.x = x;
  cube.position.y = y;
  cube.position.z = z;

  return cube;
}


var rainDataX = new Array();
var rainDataY = new Array();
var rainDataZ = new Array();
var rainData = new Array();
var cloudHeight = 0;
function generateCloud(height, x, y) {
  const cubeGeometry = generateCubeGeometry();
  const rainGeometry = generateRainGeometry();
  cloudHeight = height;
  x = x - CLOUD_RADIUS/2;
  y = y - CLOUD_RADIUS/2;
  for (var i = 0; i < CLOUD_RADIUS; i++) {
    for (var j = 0; j < CLOUD_RADIUS; j++) {
      const variableheight = Math.floor(Math.random() * height);
      const coorX = x+i;
      const coorY = height;
      const coorZ = y+j;
      makeInstance(cubeGeometry, coorX, coorY, coorZ, "cloud");
      rainDataX[i*CLOUD_RADIUS + j] = coorX;
      rainDataY[i*CLOUD_RADIUS + j] = coorY - variableheight;
      rainDataZ[i*CLOUD_RADIUS + j] = coorZ;
      // var drop
      rainData[i*CLOUD_RADIUS + j] = new THREE.Mesh(rainGeometry, RainMaterials);
      // drop = rainData[i*CLOUD_RADIUS + j];

      scene.add(rainData[i*CLOUD_RADIUS + j]);

      rainData[i*CLOUD_RADIUS + j].position.x = coorX;
      rainData[i*CLOUD_RADIUS + j].position.y = coorY - variableheight;
      rainData[i*CLOUD_RADIUS + j].position.z = coorZ;
    }
  }
}

var terrainData = new Array();
function generateTerrain(width, length) {
  function isEdgeCube(x, y, z, maxY){
    // return true;
    if(x == 0 || y == -1 || z == 0) {
      return true;
    }
    if(x == width-1 || y == maxY-1 || z == length - 1) {
      return true;
    }
    return false;
  }

  function isHiddenCube(x, y, z, terrainData) {
    if(y == terrainData[x][z]-1){
      return false;
    }
    if(isEdgeCube(x, y, z, terrainData[x][z])){
      return false;
    }
    if(y > terrainData[x-1][z]-1 || y > terrainData[x][z-1]-1 || y > terrainData[x+1][z]-1 || y > terrainData[x][z+1]-1){
      return false;
    }
    return true;
  }

  const cubeGeometry = generateCubeGeometry();
  noise.seed(Math.random());

  var maxHeight = 0;

  //march cube through all topological cubes
  for(var x = 0; x < width; x++) {
    terrainData[x] = new Array();
    for(var z = 0; z < length; z++) {
      //for every topological coordinate get generated height
      //perlin2 takes float, divide our coordinate to make smaller than 0
      const genValue = noise.perlin2(x / ZOOM, z / ZOOM);
      const y = Math.floor(Math.abs(genValue) * ZOOM);
      terrainData[x][z] = y;
      maxHeight = Math.max(maxHeight, y);
    }
  }

  //march cube through ALL cubes in space
  for(var x = 0; x < width; x++) {
    for(var z = 0; z < length; z++) {
      const maxY = terrainData[x][z];
      const isBelowWater = maxY < WATER_LEVEL;
      if(isBelowWater) {
        makeInstance(cubeGeometry, x - width/2, WATER_LEVEL-1.1, z-length/2, "water");
      }
      for(var y = -1; y < maxY; y++) {
        if(!isHiddenCube(x,y,z, terrainData)) {
          const isTop = y == maxY-1;
          makeInstance(cubeGeometry, x - width/2, y, z-length/2, isTop && !isBelowWater ? "grass" : "dirt");
        }
      }
    }
  }

  generateCloud(maxHeight+3, 0, 0);
}

function main() {
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({canvas});

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 200;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 20;
  camera.position.y = 20;
  scene = new THREE.Scene();
  // Add OrbitControls so that we can pan around with the mouse.
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    // const light = new THREE.DirectionalLight(color, intensity);
    // light.position.set(-1, 2, 4);
    const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add(light);
    scene.add(light);
  }
  generateTerrain(TERRAIN_SIZE,TERRAIN_SIZE);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = canvas.clientWidth  * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    // console.log("frame")
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    const rainSpeed = 0.5;
    for (var i = 0; i < rainDataX.length; i++) {
      // console.log("loop");
      if(i == 0){
        // console.log("before");
        // console.log(rainDataY[i]);
      }
      rainDataY[i] = rainDataY[i] - (rainSpeed);
      rainData[i].position.y = rainDataY[i];
      // const rainX = CLOUD_RADIUS - rainDataX[i];
      // const rainZ = CLOUD_RADIUS - rainDataZ[i];
      // const terrainHeight = terrainData[rainX][rainZ];
      if(rainDataY[i] <= 0 || rainDataY[i] <= WATER_LEVEL){
        rainDataY[i] = cloudHeight;
      }
    }

    // rainData.forEach((rain, i) => {
    //   const speed = 1 + i * 0.1;
    //   rain.position.y -= speed;
    // });


    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
