const STAR_IMAGE_SRC = 'star.png';
const STAR_SIZE = 16;
const STAR_SIZE_LARGE = 80;

const lineCanvas = document.getElementById('lineLayer');
const starCanvas = document.getElementById('starLayer');
const lineCtx = lineCanvas.getContext('2d');
const starCtx = starCanvas.getContext('2d');

let stars = [];
let selectedStar = null;
let starImg = new window.Image();
starImg.src = STAR_IMAGE_SRC;

const sparkleSound = new Audio('sparkle.mp3');
const cheerSound = new Audio('cheer.mp3');

function resize() {
  lineCanvas.width = window.innerWidth;
  lineCanvas.height = window.innerHeight;
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  generateStars();
  drawLines();
  drawStars();
}

function randomPosition() {
  return {
    x: Math.random() * (window.innerWidth - STAR_SIZE) + STAR_SIZE / 2,
    y: Math.random() * (window.innerHeight - STAR_SIZE) + STAR_SIZE / 2
  };
}

function generateStars() {
  stars = [];
  const baseStarCount = 800;
  const refWidth = 1920;
  const refHeight = 1080;
  const currentArea = window.innerWidth * window.innerHeight;
  const refArea = refWidth * refHeight;
  const dynamicStarCount = Math.max(50, Math.floor(baseStarCount * (currentArea / refArea)));

  const baseConnectDist = 100;
  const refAvgDim = (refWidth + refHeight) / 2;
  const currentAvgDim = (window.innerWidth + window.innerHeight) / 2;
  const dynamicConnectDist = baseConnectDist * (currentAvgDim / refAvgDim);

  window.CONNECT_DIST_DYNAMIC = dynamicConnectDist;

  for (let i = 0; i < dynamicStarCount; i++) {
    let pos = randomPosition();
    // Avoid overlap
    let tries = 0;
    while (tries < 100) {
      let overlap = stars.some(s => Math.hypot(s.x - pos.x, s.y - pos.y) < STAR_SIZE);
      if (!overlap) break;
      pos = randomPosition();
      tries++;
    }
    stars.push({ x: pos.x, y: pos.y, size: STAR_SIZE });
  }
}

function drawLines() {
  lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
  lineCtx.strokeStyle = '#fff2';
  lineCtx.lineWidth = 1;
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      let a = stars[i], b = stars[j];
      let dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < window.CONNECT_DIST_DYNAMIC) {
        lineCtx.beginPath();
        lineCtx.moveTo(a.x, a.y);
        lineCtx.lineTo(b.x, b.y);
        lineCtx.stroke();
      }
    }
  }
}

function drawStars() {
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  for (let i = 0; i < stars.length; i++) {
    let s = stars[i];
    let size = (selectedStar === i) ? STAR_SIZE_LARGE : STAR_SIZE;
    let offset = size / 2;
    starCtx.globalAlpha = (selectedStar === i) ? 1 : 0.7;
    if (i === 0) { // Make the first star pink
      starCtx.fillStyle = 'rgba(255, 105, 180, 0.8)';
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, size / 2, 0, Math.PI * 2);
      starCtx.fill();
    }
    starCtx.drawImage(starImg, s.x - offset, s.y - offset, size, size);
  }
  starCtx.globalAlpha = 1;
}

function animateStarEnlargement() {
  if (selectedStar !== null) {
    let s = stars[selectedStar];
    let currentSize = STAR_SIZE;
    let targetSize = STAR_SIZE_LARGE;
    let currentAlpha = 0.7;
    let targetAlpha = 1;
    let step = 0.1;
    let interval = setInterval(() => {
      currentSize += (targetSize - currentSize) * step;
      currentAlpha += (targetAlpha - currentAlpha) * step;
      if (Math.abs(currentSize - targetSize) < 0.1) {
        clearInterval(interval);
      }
      drawStars();
    }, 16);
  }
}

function getStarAt(x, y) {
  for (let i = stars.length - 1; i >= 0; i--) {
    let s = stars[i];
    let size = (selectedStar === i) ? STAR_SIZE_LARGE : STAR_SIZE;
    let dx = x - s.x, dy = y - s.y;
    if (Math.abs(dx) < size / 2 && Math.abs(dy) < size / 2) {
      return i;
    }
  }
  return null;
}

starCanvas.addEventListener('mousedown', e => {
  const rect = starCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const idx = getStarAt(x, y);
  if (idx !== null) {
    selectedStar = idx;
    sparkleSound.play();
    if (idx === 0) { // Check if the pink star was clicked
      cheerSound.play();
    }
    animateStarEnlargement();
  }
});

window.addEventListener('resize', () => {
  resize();
});

starImg.onload = () => {
  resize();
}; 