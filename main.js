import * as THREE from 'three';
import perlin from './gamelibs/perlin.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directional = new THREE.DirectionalLight(0xffffff, 0.8);
directional.position.set(5, 10, 7.5);
scene.add(directional);

const textureLoader = new THREE.TextureLoader();
const terrainTexture = textureLoader.load('./tex/grass.png');
const terrain = new THREE.Mesh(
    perlin(1000, 1000, 130),
    new THREE.MeshStandardMaterial({ map: terrainTexture })
    
);

terrainTexture.wrapS = THREE.RepeatWrapping;
terrainTexture.wrapT = THREE.RepeatWrapping;
terrainTexture.repeat.set(20, 20);

terrain.position.y = -2;
scene.add(terrain);

const yawObject = new THREE.Object3D();
yawObject.position.set(0, 2, 5);
yawObject.add(camera);
scene.add(yawObject);

let keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup', e => { keys[e.code] = false; });

let yaw = 0, pitch = 0;
let mouseActive = false;
document.body.addEventListener('click', () => { document.body.requestPointerLock(); });
document.addEventListener('pointerlockchange', () => { mouseActive = document.pointerLockElement === document.body; });
document.addEventListener('mousemove', e => {
    if (mouseActive) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
        yawObject.rotation.y = yaw;
        camera.rotation.x = pitch;
    }
});

function getTerrainY(x, z) {
    const pos = terrain.geometry.attributes.position;
    let closestY = 0, minDist = Infinity;
    for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vz = pos.getZ(i);
        const dist = Math.hypot(x - vx, z - vz);
        if (dist < minDist) { minDist = dist; closestY = pos.getY(i); }
    }
    return closestY + terrain.position.y + 2;
}

function animate() {
    requestAnimationFrame(animate);
    let forward = new THREE.Vector3(0,0,-1);
    let right = new THREE.Vector3(1,0,0);
    forward.applyQuaternion(yawObject.quaternion); forward.y = 0; forward.normalize();
    right.applyQuaternion(yawObject.quaternion); right.y = 0; right.normalize();
    let speed = 0.2;
    if (keys['KeyW']) yawObject.position.add(forward.clone().multiplyScalar(speed));
    if (keys['KeyS']) yawObject.position.add(forward.clone().multiplyScalar(-speed));
    if (keys['KeyA']) yawObject.position.add(right.clone().multiplyScalar(-speed));
    if (keys['KeyD']) yawObject.position.add(right.clone().multiplyScalar(speed));
    yawObject.position.y = getTerrainY(yawObject.position.x, yawObject.position.z);
    renderer.render(scene, camera);
}

animate();