'use client';

export const renderCheerOnCanvas = (canvasObj, type = 'fireworks') => {
  // نتجاهل السبورة تماماً عشان نمنع اللاج (Lag)
  // ونبني النظام الجديد كطبقة شفافة طايرة فوق الشاشة
  if (typeof window === 'undefined') return;

  const overlay = document.createElement('canvas');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.pointerEvents = 'none'; // عشان الماوس يعدي منها وميعطلش الشرح
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  const ctx = overlay.getContext('2d');
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // تظبيط الجودة للشاشات العالية (Retina Displays)
  overlay.width = width * window.devicePixelRatio;
  overlay.height = height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  let particles = [];
  let animationId;
  const colors = ['#facc15', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#ff69b4', '#fb923c'];

  // تصميم التشجيعات
  if (type === 'applause') {
    const emojis = ['👏', '👏🏻', '👏🏽', '🙌', '🌟', '🎉'];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: width / 2 + (Math.random() * 400 - 200),
        y: height - Math.random() * 50,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: Math.random() * 25 + 30, // حجم الإيموجي
        velocityY: -(Math.random() * 6 + 4),
        velocityX: Math.random() * 3 - 1.5,
        opacity: 1,
        life: Math.random() * 60 + 80,
        type: 'emoji'
      });
    }
  } else if (type === 'balloons') {
    const emojis = ['🎈', '🎈', '🎉', '🎁'];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: height + Math.random() * 100,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: Math.random() * 30 + 40,
        velocityY: -(Math.random() * 3 + 2),
        velocityX: Math.random() * 2 - 1,
        opacity: 1,
        life: Math.random() * 100 + 150,
        type: 'emoji'
      });
    }
  } else if (type === 'confetti_rain') {
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * width,
        y: -Math.random() * 200,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        velocityX: (Math.random() * 2 - 1),
        velocityY: (Math.random() * 5 + 3),
        gravity: 0.05,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        opacity: 1,
        isCircle: Math.random() > 0.5,
        type: 'shape'
      });
    }
  } else if (type === 'neon_blast') {
    const neonColors = ['#0ff', '#f0f', '#0f0', '#ff0'];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        size: Math.random() * 6 + 2,
        velocityX: (Math.random() * 30 - 15),
        velocityY: (Math.random() * 30 - 15),
        gravity: 0,
        rotation: 0,
        rotationSpeed: 0,
        opacity: 1,
        isCircle: true,
        type: 'neon',
        life: 100
      });
    }
  } else {
    // للألعاب النارية والبطولة والسحر (مؤثرات متفجرة)
    const count = type === 'victory' ? 120 : (type === 'magic' ? 60 : 90);
    const magicColors = ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'];
    const victoryColors = ['#fbbf24', '#facc15', '#ef4444'];
    const pColors = type === 'magic' ? magicColors : (type === 'victory' ? victoryColors : colors);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2,
        y: height / 2 + 100, // الانفجار بيبدأ من النص شوية لتحت
        color: pColors[Math.floor(Math.random() * pColors.length)],
        size: Math.random() * 8 + 5,
        velocityX: (Math.random() * 24 - 12), // انتشار أفقي
        velocityY: (Math.random() * -18 - 6), // انتشار عمودي
        gravity: 0.4, // جاذبية النزول لتحت
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 15 - 7.5,
        opacity: 1,
        isCircle: type === 'magic' || Math.random() > 0.5,
        type: 'shape'
      });
    }
  }

  // محرك الأنيميشن (بدون ما يلمس السبورة نهائياً)
  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    let activeParticles = 0;

    particles.forEach(p => {
      if (p.opacity <= 0) return;
      activeParticles++;

      if (p.type === 'emoji') {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.opacity = p.life / 100;
        p.life--;
        
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.font = `${p.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, p.x, p.y);
      } else if (p.type === 'neon') {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.opacity = p.life / 100;
        p.life -= 2;
        
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for other particles
      } else {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.velocityY += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      // بعد ما الأنيميشن يخلص، بنمسح الطبقة الشفافة خالص عشان منسحبش من الذاكرة
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }
  };

  animate();
};
