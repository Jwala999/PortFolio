// ─── ULTIMATE 3D BACKGROUND ───────────────────────────────────
// Wave + Orb + Rings + Stars + Geometry + Flying Dragon

// ─── GLOBALS ──────────────────────────────────────────────────
var dragonMixer = null;
var dragonModel = null;
var previousTime = 0;

// ─── SCENE SETUP ─────────────────────────────────────────────
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.008);

var camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 6, 25);

var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

var container = document.getElementById('canvas-container');
if (!container) {
    container = document.createElement('div');
    container.id = 'canvas-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100vh;z-index:-1;pointer-events:none;';
    document.body.prepend(container);
}
container.innerHTML = '';
container.appendChild(renderer.domElement);

// ─── LIGHTS ───────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x221144, 1.5));

var coreLight = new THREE.PointLight(0x6c63ff, 6, 50);
coreLight.position.set(0, 2, 0);
scene.add(coreLight);

var tealLight = new THREE.PointLight(0x43e8c0, 4, 40);
tealLight.position.set(8, 8, 5);
scene.add(tealLight);

// ─── 1. WAVE PLANE (Purple Points Grid) ──────────────────────
var planeGeo = new THREE.PlaneGeometry(120, 120, 90, 90);
planeGeo.rotateX(-Math.PI / 2);
var vertCount = planeGeo.attributes.position.count;
var baseY = new Float32Array(vertCount);
for (var i = 0; i < vertCount; i++) baseY[i] = planeGeo.attributes.position.getY(i);

var waveMat = new THREE.PointsMaterial({
    size: 0.15, color: 0x6c63ff, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending
});
var waveMesh = new THREE.Points(planeGeo, waveMat);
waveMesh.position.y = -8;
scene.add(waveMesh);

// ─── 2. GLOWING ORB & RINGS ──────────────────────────────────
var orbGroup = new THREE.Group();
orbGroup.position.set(0, 2, -5);
scene.add(orbGroup);

var orbGeo = new THREE.SphereGeometry(3, 64, 64);
var orbMat = new THREE.MeshStandardMaterial({
    color: 0x6c63ff, emissive: 0x4c1d95, emissiveIntensity: 0.8,
    roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.95
});
var orb = new THREE.Mesh(orbGeo, orbMat);
orbGroup.add(orb);

var glowGeo = new THREE.SphereGeometry(3.8, 32, 32);
var glowMat = new THREE.MeshBasicMaterial({
    color: 0x43e8c0, transparent: true, opacity: 0.1,
    blending: THREE.AdditiveBlending, side: THREE.BackSide
});
orbGroup.add(new THREE.Mesh(glowGeo, glowMat));

function createRing(radius, tube, tiltX, tiltZ, color, opacity) {
    var geo = new THREE.TorusGeometry(radius, tube, 2, 100);
    var mat = new THREE.MeshBasicMaterial({
        color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.set(tiltX, 0, tiltZ);
    orbGroup.add(mesh);
    return mesh;
}
var ring1 = createRing(7, 0.02, Math.PI / 2, 0, 0x6c63ff, 0.6);
var ring2 = createRing(9.5, 0.015, Math.PI / 2.2, 0.2, 0x43e8c0, 0.4);
var ring3 = createRing(12, 0.01, Math.PI / 1.8, -0.2, 0xff6b6b, 0.3);

// Orbit Dots
var orbitDots = [];
var dotCount = 24;
var dotGeo = new THREE.SphereGeometry(0.1, 8, 8);
var dotMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.9
});
var ringTilts = [
    { x: Math.PI / 2, z: 0 }, { x: Math.PI / 2.2, z: 0.2 }, { x: Math.PI / 1.8, z: -0.2 }
];
for (var i = 0; i < dotCount; i++) {
    var dot = new THREE.Mesh(dotGeo, dotMat);
    var ringIdx = i % 3;
    var r = ringIdx === 0 ? 7 : ringIdx === 1 ? 9.5 : 12;
    dot.userData = { angle: (i / dotCount) * Math.PI * 2, radius: r, speed: 0.2 + Math.random() * 0.3, ring: ringIdx };
    orbGroup.add(dot);
    orbitDots.push(dot);
}

// ─── 3. STAR FIELD ───────────────────────────────────────────
var starGeo = new THREE.BufferGeometry();
var starPositions = new Float32Array(2000 * 3);
for (var i = 0; i < starPositions.length; i++) starPositions[i] = (Math.random() - 0.5) * 200;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
var starMesh = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.06, color: 0x43e8c0, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending
}));
scene.add(starMesh);

// ─── 4. FLOATING GEOMETRIC SHAPES ───────────────────────────
var shapesGroup = new THREE.Group();
scene.add(shapesGroup);

var matWire = new THREE.MeshStandardMaterial({
    color: 0x6c63ff, roughness: 0.3, metalness: 0.7, wireframe: true, transparent: true, opacity: 0.4
});
var matSolid = new THREE.MeshStandardMaterial({
    color: 0x43e8c0, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.6
});

var shapes = [];
var mesh1 = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 0), matWire);
mesh1.position.set(-15, 8, -10);
shapesGroup.add(mesh1); shapes.push(mesh1);

var mesh2 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.4, 16, 32), matSolid);
mesh2.position.set(12, 5, -8);
shapesGroup.add(mesh2); shapes.push(mesh2);

var mesh3 = new THREE.Mesh(new THREE.OctahedronGeometry(1.8, 0), matWire);
mesh3.position.set(5, 12, -15);
shapesGroup.add(mesh3); shapes.push(mesh3);

// ─── 5. FLYING DRAGON (GLB) ─────────────────────────────────
(function loadDragon() {
    try {
        var gltfLoader = new THREE.GLTFLoader();
    } catch (e) {
        console.warn('GLTFLoader not available, skipping dragon.');
        return;
    }
    gltfLoader.load('model.glb', function(gltf) {
        dragonModel = gltf.scene;
        var box = new THREE.Box3().setFromObject(dragonModel);
        var size = box.getSize(new THREE.Vector3());
        var maxDim = Math.max(size.x, size.y, size.z);
        var targetScale = 12 / maxDim;
        dragonModel.scale.setScalar(targetScale);
        var center = box.getCenter(new THREE.Vector3());
        dragonModel.position.set(-center.x * targetScale, -center.y * targetScale + 5, -center.z * targetScale - 15);

        dragonModel.traverse(function(child) {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.35;
                child.material.blending = THREE.AdditiveBlending;
                child.material.depthWrite = false;
                child.material.side = THREE.DoubleSide;
                if (child.material.emissive !== undefined) {
                    child.material.emissive = new THREE.Color(0x6c63ff);
                    child.material.emissiveIntensity = 0.6;
                }
            }
        });
        scene.add(dragonModel);
        console.log('Dragon loaded! Animations:', gltf.animations.length);

        if (gltf.animations && gltf.animations.length > 0) {
            dragonMixer = new THREE.AnimationMixer(dragonModel);
            gltf.animations.forEach(function(clip) {
                dragonMixer.clipAction(clip).play();
            });
        }
    }, function(xhr) {
        if (xhr.total) console.log('Dragon loading: ' + Math.round(xhr.loaded / xhr.total * 100) + '%');
    }, function(err) {
        console.error('Dragon GLB load error:', err);
    });
})();

// ─── SCROLL & MOUSE ──────────────────────────────────────────
var scrollPercent = 0;
document.addEventListener('scroll', function() {
    var t = document.documentElement.scrollTop || document.body.scrollTop;
    var max = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
    scrollPercent = Math.max(0, Math.min(1, t / max));
});

var bgMouseX = 0, bgMouseY = 0;
document.addEventListener('mousemove', function(e) {
    bgMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    bgMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ─── MAIN ANIMATION LOOP ────────────────────────────────────
var clock = new THREE.Clock();

function animate3D() {
    requestAnimationFrame(animate3D);
    var currentTime = clock.getElapsedTime();
    var delta = currentTime - previousTime;
    previousTime = currentTime;
    var time = currentTime * 0.4;

    // Wave
    var pos = planeGeo.attributes.position;
    for (var i = 0; i < vertCount; i++) {
        var x = pos.getX(i), z = pos.getZ(i);
        pos.setY(i, baseY[i]
            + Math.sin(x * 0.12 + time) * 1.8
            + Math.cos(z * 0.10 + time * 0.7) * 1.5
            + Math.sin((x + z) * 0.07 + time * 1.1) * 2);
    }
    pos.needsUpdate = true;
    waveMat.color.setHSL(0.72 + Math.sin(time * 0.15) * 0.04, 0.85, 0.55);

    // Orb & Rings
    var pulse = 1 + Math.sin(time * 2) * 0.05;
    orb.scale.set(pulse, pulse, pulse);
    orbGroup.position.y = 2 + Math.sin(time * 1.5) * 0.5;
    ring1.rotation.y = time * 0.15;
    ring2.rotation.y = -time * 0.12;
    ring3.rotation.y = time * 0.08;

    orbitDots.forEach(function(dot) {
        dot.userData.angle += dot.userData.speed * 0.01;
        var a = dot.userData.angle, r = dot.userData.radius, tilt = ringTilts[dot.userData.ring];
        var xp = r * Math.cos(a), yp = r * Math.sin(a);
        var cosX = Math.cos(tilt.x), sinX = Math.sin(tilt.x), cosZ = Math.cos(tilt.z), sinZ = Math.sin(tilt.z);
        var y1 = yp * cosX, z1 = yp * sinX;
        dot.position.set(xp * cosZ - y1 * sinZ, xp * sinZ + y1 * cosZ, z1);
    });

    // Floating Shapes
    shapes.forEach(function(s, idx) {
        s.rotation.x += 0.01 * (idx + 1);
        s.rotation.y += 0.015 * (idx + 1);
        s.position.y += Math.sin(time * 2 + idx) * 0.02;
    });

    starMesh.rotation.y = time * 0.05;

    // Dragon flight
    if (dragonMixer) dragonMixer.update(delta);
    if (dragonModel) {
        var flightRadius = 35;
        var flightSpeed = 0.12;
        dragonModel.position.x = Math.sin(currentTime * flightSpeed) * flightRadius;
        dragonModel.position.z = Math.cos(currentTime * flightSpeed) * flightRadius - 15;
        dragonModel.position.y = 6 + Math.sin(currentTime * 0.3) * 5;
        var dx = Math.cos(currentTime * flightSpeed) * flightRadius * flightSpeed;
        var dz = -Math.sin(currentTime * flightSpeed) * flightRadius * flightSpeed;
        var dy = Math.cos(currentTime * 0.3) * 5 * 0.3;
        dragonModel.lookAt(dragonModel.position.x + dx, dragonModel.position.y + dy, dragonModel.position.z + dz);
    }

    // Camera
    camera.position.x += (bgMouseX * 3 - camera.position.x) * 0.05;
    camera.position.y += (-bgMouseY * 2 + 6 - scrollPercent * 8 - camera.position.y) * 0.05;
    camera.position.z = 25 - scrollPercent * 10;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
animate3D();

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── SCROLL REVEAL ───────────────────────────────────────────
var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('.skill-card, .project-card, .edu-card, .cert-card')
                .forEach(function(child, index) {
                    setTimeout(function() {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, index * 100);
                });
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });