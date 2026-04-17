// ============================================================
//  AnimatedPage — Premium animation library
//  Features:
//    - AnimatedPage: page-level enter/exit transitions
//    - StaggerContainer / StaggerItem: staggered children
//    - ScrollReveal: IntersectionObserver-based reveal
//    - TiltCard: mouse-tracking 3D tilt with glassmorphism
//    - ParallaxSection: scroll-driven parallax layer
//    - FloatingCard: spring-based hover lift
//    - CountUp: animated counter
// ============================================================
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

// ── Easing presets ────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const EASE_IN_OUT  = [0.4, 0, 0.2, 1];

// ── Page transition variants ──────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.992, filter: 'blur(3px)' },
  animate: { opacity: 1, y: 0,  scale: 1,     filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -10, scale: 0.996, filter: 'blur(1px)' },
};

const pageTransition = {
  type: 'tween',
  ease: EASE_OUT_EXPO,
  duration: 0.42,
};

// ── AnimatedPage ──────────────────────────────────────────
export function AnimatedPage({ children, style, className }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerContainer ──────────────────────────────────────
const staggerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

export function StaggerContainer({ children, style, className }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerVariants}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerItem ───────────────────────────────────────────
const itemVariants = {
  initial: { opacity: 0, y: 22, scale: 0.97 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'tween', ease: EASE_OUT_EXPO, duration: 0.5 },
  },
};

export function StaggerItem({ children, style, className }) {
  return (
    <motion.div variants={itemVariants} style={style} className={className}>
      {children}
    </motion.div>
  );
}

// ── ScrollReveal ──────────────────────────────────────────
// Fades + slides in when element enters viewport
export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.65,
  distance = 32,
  style,
  className,
  once = true,
}) {
  const dirMap = {
    up:    { y: distance },
    down:  { y: -distance },
    left:  { x: distance },
    right: { x: -distance },
    scale: { scale: 0.88 },
    none:  {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...dirMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ type: 'tween', ease: EASE_OUT_EXPO, duration, delay }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── TiltCard — 3D mouse-tracking tilt with glassmorphism ──
export function TiltCard({
  children,
  style,
  className,
  maxTilt   = 10,          // degrees
  glowColor = 'rgba(99,102,241,0.18)',
  scale     = 1.02,
  perspective= 900,
}) {
  const ref      = useRef(null);
  const [tilt, setTilt]     = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [spotX, setSpotX]   = useState(50);
  const [spotY, setSpotY]   = useState(50);

  const handleMouseMove = useCallback((e) => {
    const el   = ref.current;
    if (!el) return;
    const rect  = el.getBoundingClientRect();
    const cx    = rect.width  / 2;
    const cy    = rect.height / 2;
    const mx    = e.clientX - rect.left - cx;
    const my    = e.clientY - rect.top  - cy;
    const rotX  = -(my / cy) * maxTilt;
    const rotY  =  (mx / cx) * maxTilt;
    setTilt({ x: rotX, y: rotY });
    // spotlight position (%)
    setSpotX(((e.clientX - rect.left) / rect.width)  * 100);
    setSpotY(((e.clientY - rect.top)  / rect.height) * 100);
  }, [maxTilt]);

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Spring-damped tilt for smoothness
  const springX = useSpring(tilt.x, { stiffness: 200, damping: 20 });
  const springY = useSpring(tilt.y, { stiffness: 200, damping: 20 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
        position: 'relative',
        willChange: 'transform',
        ...style,
      }}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale:   hovered ? scale : 1,
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={className}
    >
      {/* Spotlight shimmer layer */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 2,
            background: `radial-gradient(circle at ${spotX}% ${spotY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
            transition: 'opacity 0.2s',
            mixBlendMode: 'overlay',
          }}
        />
      )}
      {/* Glow shadow */}
      <div
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 0,
          boxShadow: hovered
            ? `0 22px 60px rgba(0,0,0,0.14), 0 0 40px ${glowColor}`
            : '0 4px 20px rgba(0,0,0,0.07)',
          transition: 'box-shadow 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
}

// ── ParallaxSection — scroll-driven parallax ──────────────
// Wrap any section to give it a parallax depth effect
export function ParallaxSection({
  children,
  speed  = 0.3,   // 0 = locked, 1 = full scroll, negative = reverse
  style,
  className,
}) {
  const ref            = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rawY           = useTransform(scrollYProgress, [0, 1], [-80 * speed, 80 * speed]);
  const smoothY        = useSpring(rawY, { stiffness: 80, damping: 20 });

  return (
    <div ref={ref} style={{ position: 'relative', overflow: 'hidden', ...style }} className={className}>
      <motion.div style={{ y: smoothY }}>
        {children}
      </motion.div>
    </div>
  );
}

// ── ParallaxLayer — for background parallax elements ──────
export function ParallaxLayer({ children, speed = 0.15, style, className }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, speed * 300]);
  const smoothY = useSpring(y, { stiffness: 50, damping: 18 });
  return (
    <motion.div style={{ y: smoothY, ...style }} className={className}>
      {children}
    </motion.div>
  );
}

// ── FloatingCard — spring hover lift ─────────────────────
export function FloatingCard({ children, style, className, glowColor = 'rgba(99,102,241,0.14)', ...props }) {
  return (
    <motion.div
      {...props}
      whileHover={{
        y: -6,
        scale: 1.008,
        boxShadow: `0 18px 50px rgba(0,0,0,0.12), 0 0 35px ${glowColor}`,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: 'var(--card-bg, #ffffff)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border, rgba(0,0,0,0.07))',
        borderRadius: '16px',
        boxShadow: 'var(--card-shadow, 0 2px 16px rgba(0,0,0,0.06))',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── CountUp — animated number counter ────────────────────
export function CountUp({ target, duration = 1.5, prefix = '', suffix = '', style }) {
  const [count, setCount] = React.useState(0);
  const ref     = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start    = performance.now();
          const numTarget = typeof target === 'string' ? parseFloat(target) : target;
          if (isNaN(numTarget)) { setCount(target); return; }

          const animate = (now) => {
            const progress = Math.min((now - start) / (duration * 1000), 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(numTarget * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref} style={style}>{prefix}{count}{suffix}</span>;
}

// ── RevealText — staggered character/word reveal ─────────
export function RevealText({ text, delay = 0, className, style, byWord = true }) {
  const tokens = byWord ? text.split(' ') : text.split('');

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      style={{ display: 'inline-block', ...style }}
      className={className}
    >
      {tokens.map((token, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1, y: 0,
              transition: { type: 'tween', ease: EASE_OUT_EXPO, duration: 0.55, delay: delay + i * 0.04 },
            },
          }}
          style={{ display: 'inline-block', marginRight: byWord ? '0.28em' : 0 }}
        >
          {token}
        </motion.span>
      ))}
    </motion.span>
  );
}
