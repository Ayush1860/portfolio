import {
  AREA_PER_BUTTERFLY,
  BASE_FLAP_HZ,
  BASE_SPEED,
  DEFAULT_CONFIG,
  DPR_CAP,
  LOW_CORE_COUNT,
  MAX_DESKTOP,
  MAX_MOBILE,
  MIN_COUNT,
  MOBILE_WIDTH,
  RESIZE_DEBOUNCE_MS,
  readPalette,
  type FieldConfig,
  type Palette,
} from './config';
import { FRAME_COUNT, VARIANT_COUNT, buildSprites, speciesFlapRate, type SpriteSet } from './sprites';

interface Butterfly {
  x: number; // centre, CSS px
  y: number;
  z: number; // depth: farthestDepth (far) .. 1 (near)
  level: number; // index into sprites.levels
  alpha: number;
  offset: number; // own heading offset from the shared direction, radians
  heading: number; // current heading, radians
  phase: number; // flap phase
  flapHz: number;
  gliding: boolean;
  glideTimer: number; // seconds until gliding toggles
  wobble: number; // flutter phase
  variant: number; // shimmer variant in use
  shimmerTimer: number;
  sparkTime: number; // seconds of sparkle left
  sparkCell: number;
}

const TAU = Math.PI * 2;
const MIN_FADE = 0.2; // smallest alpha a single trail-fade step may use
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Keys whose change needs new sprites and a fresh flock. */
const REBUILD_KEYS: (keyof FieldConfig)[] = [
  'species',
  'size',
  'cellSize',
  'asciiDetail',
  'shimmer',
  'direction',
  'density',
  'farthestDepth',
  'farBias',
  'distanceFade',
  'grid',
];

/**
 * A full-screen field of pixel-grid butterflies on one Canvas 2D.
 * Lives outside React: nothing here re-renders, and scroll never touches the loop.
 */
export class ButterflyField {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private cfg: FieldConfig;
  private palette: Palette;
  private sprites!: SpriteSet;
  private flock: Butterfly[] = [];
  private scratch: HTMLCanvasElement | null = null;

  private width = 0; // CSS px
  private height = 0;
  private dpr = 1;
  private renderScale = 1; // drops toward 0.5 as the CSS blur rises
  private reduced: boolean;
  private started = false;
  private running = false;
  private raf = 0;
  private last = 0;
  private resizeTimer = 0;
  private fadeClock = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly wrap: HTMLElement,
    overrides: Partial<FieldConfig> = {},
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not available');
    this.ctx = ctx;
    this.cfg = { ...DEFAULT_CONFIG, ...overrides };
    this.palette = readPalette();
    this.reduced = this.motionQuery.matches;

    this.measure();
    this.rebuild();

    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.motionQuery.addEventListener('change', this.onMotionChange);
  }

  /* ---------- public API ---------- */

  /** Begin animating (or draw the single still frame under reduced motion). */
  start() {
    this.started = true;
    if (this.reduced) this.drawStill();
    else this.run();
  }

  getConfig(): FieldConfig {
    return { ...this.cfg };
  }

  /** Change settings live; used by the /lab sliders. */
  setConfig(patch: Partial<FieldConfig>) {
    const keys = Object.keys(patch) as (keyof FieldConfig)[];
    this.cfg = { ...this.cfg, ...patch };
    if (keys.some((key) => REBUILD_KEYS.includes(key))) this.rebuild();
    if (this.started && this.reduced) this.drawStill();
  }

  destroy() {
    this.halt();
    window.clearTimeout(this.resizeTimer);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.motionQuery.removeEventListener('change', this.onMotionChange);
  }

  /* ---------- setup ---------- */

  private measure() {
    this.width = Math.max(1, this.wrap.clientWidth);
    this.height = Math.max(1, this.wrap.clientHeight);
    this.dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    this.sizeCanvas(false);
  }

  /** Set the backing-store size. `keep` carries the current pixels (trails) across. */
  private sizeCanvas(keep: boolean) {
    const { canvas, ctx } = this;
    const k = this.dpr * this.renderScale;
    const w = Math.max(1, Math.round(this.width * k));
    const h = Math.max(1, Math.round(this.height * k));

    if (canvas.width !== w || canvas.height !== h) {
      let copy: HTMLCanvasElement | null = null;
      if (keep && canvas.width > 1) {
        copy = this.scratch ??= document.createElement('canvas');
        copy.width = canvas.width;
        copy.height = canvas.height;
        copy.getContext('2d')!.drawImage(canvas, 0, 0);
      }
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(w / this.width, 0, 0, h / this.height, 0, 0);
      if (copy) ctx.drawImage(copy, 0, 0, this.width, this.height);
    }
    // Everything below draws in CSS px.
    ctx.setTransform(w / this.width, 0, 0, h / this.height, 0, 0);
  }

  private rebuild() {
    this.sprites = buildSprites(this.cfg, this.palette, this.dpr);

    // Dot grid: every second cell of the nearest butterflies, so cells sit on it.
    const pitch = this.sprites.levels[0].pitch;
    const gridPitch = pitch * Math.max(1, Math.round(2 * this.cfg.grid));
    this.wrap.style.setProperty('--grid-pitch', `${gridPitch}px`);
    this.wrap.style.setProperty('--grid-dot-r', `${(0.7 * this.cfg.grid).toFixed(2)}px`);

    this.seed();
  }

  private targetCount() {
    const mobile = window.innerWidth < MOBILE_WIDTH;
    const lowPower = (navigator.hardwareConcurrency || 8) <= LOW_CORE_COUNT;
    let count = (this.cfg.density * this.width * this.height) / AREA_PER_BUTTERFLY;
    if (mobile || lowPower) count /= 2;
    count = Math.min(count, mobile ? MAX_MOBILE : MAX_DESKTOP);
    return Math.max(MIN_COUNT, Math.round(count));
  }

  private seed() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.flock = [];
    const count = this.targetCount();
    for (let i = 0; i < count; i++) {
      const b = this.create();
      // Spread the first flock over the screen, keeping some distance between them.
      let best = { x: 0, y: 0, score: -1 };
      for (let attempt = 0; attempt < 6; attempt++) {
        const x = rand(0, this.width);
        const y = rand(0, this.height);
        let nearest = Infinity;
        for (const other of this.flock) nearest = Math.min(nearest, Math.hypot(other.x - x, other.y - y));
        if (nearest > best.score) best = { x, y, score: nearest };
      }
      b.x = best.x;
      b.y = best.y;
      this.flock.push(b);
    }
    this.sortByDepth();
  }

  /** A new butterfly with a fresh depth; the caller places it. */
  private create(): Butterfly {
    const { cfg, sprites } = this;
    const far = Math.min(1, Math.max(0.05, cfg.farthestDepth));
    const z = far + (1 - far) * Math.pow(Math.random(), Math.max(0.1, cfg.farBias));
    const nearness = far < 1 ? (z - far) / (1 - far) : 1;

    // Pick the pre-rendered size closest to this depth.
    const wanted = sprites.levels[0].pitch * z;
    let level = 0;
    sprites.levels.forEach((l, i) => {
      if (Math.abs(l.pitch - wanted) < Math.abs(sprites.levels[level].pitch - wanted)) level = i;
    });

    const offset = toRad(rand(-cfg.spread, cfg.spread));
    return {
      x: 0,
      y: 0,
      z,
      level,
      alpha: 1 - cfg.distanceFade * (1 - nearness),
      offset,
      heading: toRad(cfg.direction) + offset,
      phase: rand(0, TAU),
      flapHz: BASE_FLAP_HZ * speciesFlapRate(cfg.species) * rand(0.85, 1.2),
      gliding: false,
      glideTimer: rand(0.5, 6),
      wobble: rand(0, TAU),
      variant: Math.floor(Math.random() * VARIANT_COUNT),
      shimmerTimer: rand(0.05, 0.3),
      sparkTime: 0,
      sparkCell: 0,
    };
  }

  /** Re-enter from the upwind edges once a butterfly has left the screen. */
  private respawn(index: number) {
    const b = this.create();
    const half = this.sprites.levels[b.level].size / 2;
    const dir = toRad(this.cfg.direction);
    // Weight each edge by how much traffic crosses it, so density stays even.
    const viaTop = this.width * Math.abs(Math.sin(dir));
    const viaSide = this.height * Math.abs(Math.cos(dir));
    if (Math.random() * (viaTop + viaSide) < viaTop) {
      b.x = rand(0, this.width);
      b.y = Math.sin(dir) >= 0 ? -half - rand(0, 60) : this.height + half + rand(0, 60);
    } else {
      b.x = Math.cos(dir) >= 0 ? -half - rand(0, 60) : this.width + half + rand(0, 60);
      b.y = rand(0, this.height);
    }
    this.flock[index] = b;
  }

  private sortByDepth() {
    this.flock.sort((a, b) => a.z - b.z); // far first, so near ones cover them
  }

  /* ---------- loop ---------- */

  private run() {
    if (this.running || document.hidden) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private halt() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame = (now: number) => {
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, 0.05); // delta time: same speed at any refresh rate
    this.last = now;
    this.syncRenderScale();
    this.update(dt);
    this.draw(dt);
    this.raf = requestAnimationFrame(this.frame);
  };

  /** Render fewer pixels as the CSS blur rises; the blur hides the lost detail. */
  private syncRenderScale() {
    const progress = parseFloat(document.documentElement.style.getPropertyValue('--blur-progress')) || 0;
    const scale = progress < 0.3 ? 1 : progress < 0.65 ? 0.75 : 0.5;
    if (scale !== this.renderScale) {
      this.renderScale = scale;
      this.sizeCanvas(true);
    }
  }

  private update(dt: number) {
    const { cfg, flock } = this;
    const direction = toRad(cfg.direction);
    const reach = cfg.separation * 0.25;
    let respawned = false;

    for (let i = 0; i < flock.length; i++) {
      const b = flock[i];

      // Steer away from close neighbours at a similar depth.
      let steer = 0;
      if (reach > 0) {
        const fx = Math.cos(b.heading);
        const fy = Math.sin(b.heading);
        for (let j = 0; j < flock.length; j++) {
          if (j === i) continue;
          const o = flock[j];
          if (Math.abs(o.z - b.z) > 0.25) continue;
          const dx = o.x - b.x;
          const dy = o.y - b.y;
          const radius = reach * (b.z + o.z) * 0.5;
          const d2 = dx * dx + dy * dy;
          if (d2 >= radius * radius || d2 === 0) continue;
          const side = fx * dy - fy * dx; // > 0: neighbour is on our right-hand side
          steer -= Math.sign(side) * (1 - Math.sqrt(d2) / radius) * 0.6;
        }
      }
      const home = direction + b.offset;
      b.heading += (cfg.holdCourse * (home - b.heading) + steer) * dt;

      // Drift. Near butterflies move faster, which gives the parallax.
      const speed = BASE_SPEED * cfg.speed * b.z * (b.gliding ? 1.1 : 1);
      b.x += Math.cos(b.heading) * speed * dt;
      b.y += Math.sin(b.heading) * speed * dt;
      if (cfg.flutter > 0) {
        b.wobble += dt * 5;
        const sway = Math.sin(b.wobble) * cfg.flutter * 26 * b.z * dt;
        b.x += -Math.sin(b.heading) * sway;
        b.y += Math.cos(b.heading) * sway;
      }

      // Flap, with short glides where the wings hold open.
      const holding = b.gliding && Math.cos(b.phase) > 0.94;
      if (!holding) b.phase = (b.phase + TAU * b.flapHz * cfg.flapRate * dt) % TAU;
      if (cfg.glide > 0) {
        b.glideTimer -= dt;
        if (b.glideTimer <= 0) {
          b.gliding = !b.gliding;
          b.glideTimer = b.gliding ? rand(1, 3) : rand(2.5, 7) * (2.75 / cfg.glide);
        }
      } else {
        b.gliding = false;
      }

      // Shimmer: hop between pre-rendered noise variants.
      b.shimmerTimer -= dt;
      if (b.shimmerTimer <= 0) {
        b.variant = (b.variant + 1 + Math.floor(Math.random() * (VARIANT_COUNT - 1))) % VARIANT_COUNT;
        b.shimmerTimer = rand(0.09, 0.3);
      }

      // Sparkle: one cell flashes white for two or three frames.
      if (b.sparkTime > 0) {
        b.sparkTime -= dt;
      } else if (Math.random() < cfg.sparkle * 2.2 * dt) {
        b.sparkTime = 0.045;
        b.sparkCell = Math.floor(Math.random() * 4096);
      }

      // Gone past the downwind edges?
      const half = this.sprites.levels[b.level].size / 2;
      const outX = Math.cos(direction) >= 0 ? b.x - half > this.width : b.x + half < 0;
      const outY = Math.sin(direction) >= 0 ? b.y - half > this.height : b.y + half < 0;
      if (outX || outY) {
        this.respawn(i);
        respawned = true;
      }
    }
    if (respawned) this.sortByDepth(); // after the pass, so nobody is updated twice
  }

  private draw(dt: number, still = false) {
    const { ctx, cfg, sprites } = this;

    if (still || cfg.trail <= 0) {
      ctx.clearRect(0, 0, this.width, this.height);
    } else {
      // Trails: fade what is already there instead of clearing it.
      // The fade runs on its own clock in steps of at least MIN_FADE alpha. A weaker
      // per-frame fade (as on a 144 Hz screen) can't finish in 8-bit colour: it rounds
      // back to where it started and leaves a grey smear behind every butterfly.
      const perFrame = Math.min(0.95, Math.max(0.01, cfg.trailFade));
      const framesPerStep = Math.max(2, Math.log(1 - MIN_FADE) / Math.log(1 - perFrame)) * cfg.trail;
      const step = framesPerStep / 60;
      this.fadeClock += dt;
      if (this.fadeClock >= step) {
        const steps = Math.floor(this.fadeClock / step);
        this.fadeClock -= steps * step;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1 - Math.pow(1 - perFrame, (steps * framesPerStep) / cfg.trail);
        ctx.fillRect(0, 0, this.width, this.height);
      }
    }

    for (const b of this.flock) {
      const level = sprites.levels[b.level];
      const open = 0.5 + 0.5 * Math.cos(b.phase);
      const frame = Math.round((1 - open) * (FRAME_COUNT - 1));
      const sprite = level.frames[frame][b.variant];
      // Snap to the butterfly's own cell grid: this is what makes it read as "ASCII".
      const x = Math.round((b.x - level.size / 2) / level.pitch) * level.pitch;
      const y = Math.round((b.y - level.size / 2) / level.pitch) * level.pitch;

      // Punch out the footprint first so a dim, slow butterfly doesn't brighten over its own trail.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.drawImage(sprite, x, y, level.size, level.size);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = b.alpha;
      ctx.drawImage(sprite, x, y, level.size, level.size);

      if (b.sparkTime > 0) {
        const cells = sprites.filled[frame];
        const n = cells.length / 2;
        if (n > 0) {
          const k = (b.sparkCell % n) * 2;
          ctx.globalAlpha = Math.min(1, b.alpha + 0.45);
          ctx.fillStyle = this.palette.spark;
          ctx.fillRect(x + cells[k] * level.pitch, y + cells[k + 1] * level.pitch, level.pitch, level.pitch);
        }
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  /** Reduced motion: one still frame, no loop. */
  private drawStill() {
    this.halt();
    this.syncRenderScale();
    this.draw(0, true);
  }

  /* ---------- events ---------- */

  private onResize = () => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      const prevWidth = this.width;
      const prevHeight = this.height;
      const prevDpr = this.dpr;
      const w = Math.max(1, this.wrap.clientWidth);
      const h = Math.max(1, this.wrap.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      if (w === prevWidth && h === prevHeight && dpr === prevDpr) return;

      // A mobile URL bar sliding away only nudges the height: keep the flock.
      const minor = w === prevWidth && dpr === prevDpr && Math.abs(h - prevHeight) < 160;
      this.width = w;
      this.height = h;
      this.dpr = dpr;
      this.sizeCanvas(minor);
      if (!minor) this.rebuild();
      if (this.started && this.reduced) this.drawStill();
    }, RESIZE_DEBOUNCE_MS);
  };

  private onVisibility = () => {
    if (document.hidden) this.halt();
    else if (this.started && !this.reduced) this.run();
  };

  private onMotionChange = (event: MediaQueryListEvent) => {
    this.reduced = event.matches;
    if (!this.started) return;
    if (this.reduced) this.drawStill();
    else this.run();
  };
}
