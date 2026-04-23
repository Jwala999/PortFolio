// --- THREE.JS 3D ANIMATION ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

// Create container for 3D
const container = document.createElement('div');
container.id = 'canvas-container';
document.getElementById('hero').appendChild(container);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Create Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 5;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const material = new THREE.PointsMaterial({
    size: 0.005,
    color: 0x6c63ff, // Your accent color
    transparent: true,
    opacity: 0.8
});

const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);
camera.position.z = 2;

// Mouse Interaction for 3D
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
});

function animate3D() {
    requestAnimationFrame(animate3D);
    
    // Smooth rotation
    particlesMesh.rotation.y += 0.001;
    
    // React to mouse
    particlesMesh.rotation.x += (mouseY * 0.5 - particlesMesh.rotation.x) * 0.05;
    particlesMesh.rotation.y += (mouseX * 0.5 - particlesMesh.rotation.y) * 0.05;
    
    renderer.render(scene, camera);
}

animate3D();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
// --- SCROLL REVEAL ENGINE ---
const revealOptions = {
  threshold: 0.15, // Trigger when 15% of the element is visible
  rootMargin: "0px 0px -50px 0px" // Slight offset so it triggers before hitting the top
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      
      // If the section has children like cards, stagger their appearance
      const children = entry.target.querySelectorAll('.skill-card, .project-card, .edu-card');
      children.forEach((child, index) => {
        setTimeout(() => {
          child.style.opacity = "1";
          child.style.transform = "translateY(0)";
        }, index * 100); // 100ms delay between each card
      });

      // Optional: Stop observing after it's visible to save performance
      // revealObserver.unobserve(entry.target);
    }
  });
}, revealOptions);

// Apply to all elements with the .reveal class
document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});