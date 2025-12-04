const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const scale = 12; // độ lớn tim

// 🌟 Tham số chuyển động (tim đập)
const animationSpeed = 0.002;
const beatSpeed = 0.012;
const beatAmplitude = 0.07;
let beatPhase = 0, beatDir = 1, beatScale = 1;

// 🌌 Sao nền
const stars = Array.from({ length: 250 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 1.3,
  opacity: Math.random() * 0.5 + 0.3,
  speed: Math.random() * 0.02 + 0.01,
}));

function drawStars() {
  for (const s of stars) {
    ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    s.y += s.speed;
    if (s.y > canvas.height) s.y = 0;
  }
}

// 🌠 Sao băng
let shootingStar = {
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height / 2,
  len: Math.random() * 200 + 100,
  speed: Math.random() * 10 + 6,
  life: 0,
};

function drawShootingStar() {
  if (Math.random() < 0.004) {
    shootingStar = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height / 3,
      len: Math.random() * 150 + 100,
      speed: Math.random() * 6 + 3,
      life: 0,
    };
  }
  if (shootingStar.life < 100) {
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shootingStar.x, shootingStar.y);
    ctx.lineTo(shootingStar.x - shootingStar.len, shootingStar.y + shootingStar.len / 3);
    ctx.stroke();
    shootingStar.x += shootingStar.speed;
    shootingStar.y -= shootingStar.speed / 3;
    shootingStar.life++;
  }
}

// 💗 Tạo hình trái tim
function createHeartShape(cx, cy, s) {
  const pts = [];
  const n = 3000;
  const step = 2 * Math.PI / n;
  for (let t = 0; t < 2 * Math.PI; t += step) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    const px = cx + x * s + (Math.random() - 0.5) * 6;
    const py = cy + y * s + (Math.random() - 0.5) * 6;
    pts.push({ x: px, y: py });
  }
  return pts;
}

const heartPoints = createHeartShape(centerX, centerY, scale);
const particles = heartPoints.map(p => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  targetX: p.x,
  targetY: p.y,
  vx: 0,
  vy: 0,
  opacity: 0,
  delay: Math.random() * 60,
  size: Math.random() * 1.0 + 0.8,
}));

// 💫 Hạt bay xung quanh
const floating = [];
function spawnFloating() {
  if (Math.random() < 0.08) {
    floating.push({
      x: centerX + (Math.random() - 0.5) * 350,
      y: centerY + (Math.random() - 0.5) * 350,
      size: Math.random() * 2,
      life: 1.0
    });
  }
}
function drawFloating() {
  for (let i = 0; i < floating.length; i++) {
    const f = floating[i];
    ctx.fillStyle = `rgba(255,180,230,${f.life})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fill();
    f.y -= 0.3;
    f.life -= 0.008;
    if (f.life <= 0) floating.splice(i, 1);
  }
}

// 💥 Hiệu ứng click
let clickBursts = [];
canvas.addEventListener("click", (e) => {
  createBurst(e.clientX, e.clientY);
});

function createBurst(x, y) {
  const burst = [];
  const count = 80;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 2 + 1;
    burst.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 2 + 1,
      life: 1,
    });
  }
  clickBursts.push(burst);
}

function drawBursts() {
  for (let b = 0; b < clickBursts.length; b++) {
    const burst = clickBursts[b];
    for (let i = 0; i < burst.length; i++) {
      const p = burst[i];
      const dx = centerX - p.x;
      const dy = centerY - p.y;
      const pull = 0.005;
      p.vx += dx * pull;
      p.vy += dy * pull;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.01;

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      gradient.addColorStop(0, "#fff0ff");
      gradient.addColorStop(0.5, "#ff86d8");
      gradient.addColorStop(1, "rgba(255,0,120,0)");
      ctx.fillStyle = gradient;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    if (burst[0]?.life <= 0) clickBursts.splice(b, 1);
  }
  ctx.globalAlpha = 1;
}

// 💗 Hạt chính của trái tim
function drawParticles() {
  for (const p of particles) {
    if (p.delay > 0) { p.delay -= 1; continue; }

    const dx = (p.targetX - centerX) * beatScale + centerX - p.x;
    const dy = (p.targetY - centerY) * beatScale + centerY - p.y;

    p.vx += dx * 0.008;
    p.vy += dy * 0.008;

    p.vx *= 0.92;
    p.vy *= 0.92;

    p.x += p.vx;
    p.y += p.vy;

    p.opacity = Math.min(1, p.opacity + 0.025);

    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
    gradient.addColorStop(0, "#fff0ff");
    gradient.addColorStop(0.4, "#ff86d8");
    gradient.addColorStop(1, "rgba(255,0,100,0)");
    ctx.fillStyle = gradient;
    ctx.globalAlpha = p.opacity;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// 🖼️ Ảnh nền tim (dự phòng – nhưng KHÔNG vẽ)
const img = new Image();
img.src = "anhdep.jpg";


// 🎬 Animation tổng thể
function animate() {
  ctx.fillStyle = "rgba(10, 0, 30, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();
  drawShootingStar();

  beatPhase += beatSpeed * beatDir;
  if (beatPhase >= 1) beatDir = -1;
  else if (beatPhase <= 0) beatDir = 1;
  beatScale = 1 + Math.sin(beatPhase * Math.PI) * beatAmplitude;

  // ❌ ĐÃ XOÁ HOÀN TOÀN HÌNH TRÒN Ở GIỮA TIM

  drawParticles();
  spawnFloating();
  drawFloating();
  drawBursts();

  requestAnimationFrame(animate);
}

animate();
