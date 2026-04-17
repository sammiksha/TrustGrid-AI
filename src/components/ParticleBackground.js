// ============================================================
//  ParticleBackground v2 — Enhanced Canvas Particle Mesh
//  Features: Color cycling, attraction mode, constellation patterns,
//             mouse interaction, performance-safe animation
// ============================================================
import React, { useRef, useEffect, useCallback } from 'react';

const CONFIG = {
  particleCount: 85,
  connectionDistance: 155,
  mouseRadius: 180,
  speed: 0.28,
  colors: ['#3b82f6', '#8b5cf6', '#06b6d4', '#60a5fa', '#d946ef'],
  lineColor: 'rgba(59, 130, 246, 0.1)',
  lineColorHighlight: 'rgba(139, 92, 246, 0.3)',
  particleMinSize: 1,
  particleMaxSize: 2.5,
  glowSize: 9,
  colorCycleSpeed: 0.0008, // How fast particles shift hue
};

// Neon color palette for cycling
const NEON_PALETTE = [
  [59, 130, 246],   // blue
  [139, 92, 246],   // purple
  [6, 182, 212],    // cyan
  [217, 70, 239],   // magenta
  [96, 165, 250],   // light blue
];

function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
    // Color cycling
    this.colorIndex = Math.floor(Math.random() * NEON_PALETTE.length);
    this.nextColorIndex = (this.colorIndex + 1) % NEON_PALETTE.length;
    this.colorT = Math.random(); // Start at random position in cycle
    this.colorSpeed = CONFIG.colorCycleSpeed * (0.5 + Math.random());
  }

  reset() {
    this.x = Math.random() * (this.canvas.width || 800);
    this.y = Math.random() * (this.canvas.height || 600);
    this.vx = (Math.random() - 0.5) * CONFIG.speed;
    this.vy = (Math.random() - 0.5) * CONFIG.speed;
    this.size = CONFIG.particleMinSize + Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize);
    this.opacity = 0.3 + Math.random() * 0.6;
    this.pulseSpeed = 0.008 + Math.random() * 0.015;
    this.pulseOffset = Math.random() * Math.PI * 2;
    this.constellationId = Math.floor(Math.random() * 8); // For grouping
  }

  getCurrentColor() {
    const c1 = NEON_PALETTE[this.colorIndex];
    const c2 = NEON_PALETTE[this.nextColorIndex];
    const [r, g, b] = lerpColor(c1, c2, this.colorT);
    return { r, g, b, str: `rgb(${r},${g},${b})` };
  }

  update(mouse, time) {
    // Color cycling
    this.colorT += this.colorSpeed;
    if (this.colorT >= 1) {
      this.colorT = 0;
      this.colorIndex = this.nextColorIndex;
      this.nextColorIndex = (this.colorIndex + 1) % NEON_PALETTE.length;
    }

    // Mouse interaction — attraction when close, gentle repulsion when very close
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        if (dist > 60) {
          // Soft attraction
          this.vx -= (dx / dist) * force * 0.015;
          this.vy -= (dy / dist) * force * 0.015;
        } else {
          // Repulsion when very close
          this.vx += (dx / dist) * force * 0.025;
          this.vy += (dy / dist) * force * 0.025;
        }
      }
    }

    // Speed limiting
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > CONFIG.speed * 3) {
      this.vx = (this.vx / speed) * CONFIG.speed * 3;
      this.vy = (this.vy / speed) * CONFIG.speed * 3;
    }

    // Apply velocity with damping
    this.vx *= 0.992;
    this.vy *= 0.992;

    // Minimum speed to keep moving
    if (Math.abs(this.vx) < 0.02) this.vx += (Math.random() - 0.5) * 0.05;
    if (Math.abs(this.vy) < 0.02) this.vy += (Math.random() - 0.5) * 0.05;

    this.x += this.vx;
    this.y += this.vy;

    // Wrap around (instead of bouncing for smoother look)
    const w = this.canvas.width || 800;
    const h = this.canvas.height || 600;
    if (this.x < -10) this.x = w + 10;
    if (this.x > w + 10) this.x = -10;
    if (this.y < -10) this.y = h + 10;
    if (this.y > h + 10) this.y = -10;

    // Pulse opacity
    this.opacity = 0.3 + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.25;
  }

  draw(ctx) {
    const color = this.getCurrentColor();
    const { r, g, b } = color;

    // Glow halo
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * CONFIG.glowSize);
    gradient.addColorStop(0, `rgba(${r},${g},${b},${this.opacity * 0.4})`);
    gradient.addColorStop(0.4, `rgba(${r},${g},${b},${this.opacity * 0.1})`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * CONFIG.glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(this.opacity * 1.5, 1)})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function ParticleBackground({ style, className }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const animIdRef = useRef(null);
  const frameCountRef = useRef(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Use logical dimensions for particles
    const fakeCanvas = { width: w, height: h };
    particlesRef.current = Array.from({ length: CONFIG.particleCount }, () => new Particle(fakeCanvas));
  }, []);

  useEffect(() => {
    init();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;
    let lastTime = 0;

    const handleResize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      const fakeCanvas = { width: w, height: h };
      particlesRef.current.forEach(p => { p.canvas = fakeCanvas; });
    };

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    const animate = (timestamp) => {
      // Throttle to ~60fps max
      if (timestamp - lastTime < 14) {
        animIdRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = timestamp;
      time++;
      frameCountRef.current++;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update all particles
      for (const p of particles) {
        p.update(mouse, time);
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.connectionDistance) {
            const opacity = (1 - dist / CONFIG.connectionDistance) * 0.7;

            let isNearMouse = false;
            if (mouse.x !== null) {
              const mx = (particles[i].x + particles[j].x) / 2 - mouse.x;
              const my = (particles[i].y + particles[j].y) / 2 - mouse.y;
              isNearMouse = Math.sqrt(mx * mx + my * my) < CONFIG.mouseRadius * 0.8;
            }

            // Use color of first particle for line
            const { r, g, b } = particles[i].getCurrentColor();

            if (isNearMouse) {
              ctx.strokeStyle = `rgba(${r},${g},${b},${opacity * 0.55})`;
              ctx.lineWidth = 1.2;
            } else {
              ctx.strokeStyle = `rgba(${r},${g},${b},${opacity * 0.15})`;
              ctx.lineWidth = 0.5;
            }

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        p.draw(ctx);
      }

      // Star burst near mouse
      if (mouse.x !== null && mouse.y !== null && frameCountRef.current % 3 === 0) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.4)';
        ctx.fill();

        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
        gradient.addColorStop(0, 'rgba(59,130,246,0.06)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      animIdRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    animIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animIdRef.current);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        ...style,
      }}
    />
  );
}
