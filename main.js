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
let cheerSoundLoaded = false;
const cheerSound = new Audio('cheer.mp3');
cheerSound.addEventListener('canplaythrough', () => {
  cheerSoundLoaded = true;
  console.log('cheer.mp3 loaded successfully');
});
cheerSound.addEventListener('error', (e) => {
  console.error('Error loading cheer.mp3:', e);
});

const fortunes = [
  "Do not be afraid of competition.",
  "An exciting opportunity lies ahead of you.",
  "You love peace.",
  "Get your mind set…confidence will lead you on.",
  "You will always be surrounded by true friends.",
  "Sell your ideas-they have exceptional merit.",
  "You should be able to undertake and complete anything.",
  "You are kind and friendly.",
  "You are wise beyond your years.",
  "Your ability to juggle many tasks will take you far.",
  "A routine task will turn into an enchanting adventure.",
  "Be true to your work, your word, and your friend.",
  "Goodness is the only investment that never fails.",
  "A journey of a thousand miles begins with a single step.",
  "Respect yourself and others will respect you.",
  "A man cannot be comfortable without his own approval.",
  "Always do right. This will gratify some people and astonish the rest.",
  "It is easier to stay out than to get out.",
  "Sing everyday and chase the mean blues away.",
  "You will receive money from an unexpected source.",
  "Attitude is a little thing that makes a big difference.",
  "Plan for many pleasures ahead.",
  "Experience is the best teacher.",
  "You will be happy with your spouse.",
  "Expect the unexpected.",
  "Stay healthy. Walk a mile.",
  "The family that plays together stays together.",
  "Eat chocolate to have a sweeter life.",
  "Once you make a decision the universe conspires to make it happen.",
  "Make yourself necessary to someone.",
  "The only way to have a friend is to be one.",
  "Nothing great was ever achieved without enthusiasm.",
  "Dance as if no one is watching.",
  "Your life will be happy and peaceful.",
  "Reach for joy and all else will follow.",
  "Move in the direction of your dreams.",
  "Bloom where you are planted.",
  "Appreciate. Appreciate. Appreciate.",
  "Happy News is on its way.",
  "A closed mouth gathers no feet.",
  "He who throws dirt is losing ground.",
  "Borrow money from a pessimist. They don't expect it back.",
  "Life is what happens to you while you are busy making other plans.",
  "Help! I'm being held prisoner in a fortune cookie factory.",
  "Paradise is always where love dwells.",
  "The one you love is closer than you think.",
  "In dreams and in love there are no impossibilities.",
  "Love isn't something you find. Love is something that finds you.",
  "True love is not something that comes everyday, follow your heart, it knows the right answer."
];
let fortuneCardElement = null;

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

    // Remove existing fortune card if any
    if (fortuneCardElement) {
      fortuneCardElement.remove();
      fortuneCardElement = null;
    }

    try {
      sparkleSound.currentTime = 0;
      sparkleSound.play();
    } catch (e) {
      console.error('Error playing sparkle.mp3:', e);
    }

    if (idx === 0) { // Check if the pink star was clicked
      if (cheerSoundLoaded) {
        try {
          new Audio('cheer.mp3').play().catch(e => console.error('Error playing cheer.mp3 on click:', e));
        } catch (e) {
          console.error('Error creating or playing new Audio for cheer.mp3:', e);
        }
      }

      // Display fortune for the pink star
      const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
      fortuneCardElement = document.createElement('div');
      fortuneCardElement.classList.add('fortune-card');
      fortuneCardElement.textContent = randomFortune;
      fortuneCardElement.style.display = 'block'; // Ensure the card is displayed
      document.body.appendChild(fortuneCardElement);

      console.log('Fortune card element created and appended:', fortuneCardElement);

      // Remove the card after a few seconds
      setTimeout(() => {
        if (fortuneCardElement) {
          fortuneCardElement.remove();
          fortuneCardElement = null;
        }
      }, 8000); // Display for 8 seconds
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