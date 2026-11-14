import { gsap } from 'gsap';

const WIDTH = 1672;
const HEIGHT = 941;

type Tree = { x: number; y: number; rx: number; ry: number; phase: number; patch?: HTMLCanvasElement };
type Seed = { x: number; y: number; phase: number; size: number; speed: number };

const trees: Tree[] = [
  { x: 345, y: 245, rx: 135, ry: 135, phase: .3 },
  { x: 1060, y: 135, rx: 100, ry: 105, phase: 1.4 },
  { x: 1270, y: 385, rx: 74, ry: 80, phase: 2.2 },
  { x: 1110, y: 705, rx: 80, ry: 80, phase: 3.8 },
  { x: 505, y: 680, rx: 63, ry: 70, phase: 4.6 },
];

function makePatch(image: HTMLImageElement, tree: Tree): HTMLCanvasElement {
  const patch = document.createElement('canvas');
  patch.width = tree.rx * 2;
  patch.height = tree.ry * 2;
  const context = patch.getContext('2d')!;
  context.drawImage(image, tree.x - tree.rx, tree.y - tree.ry, tree.rx * 2, tree.ry * 2, 0, 0, patch.width, patch.height);
  context.globalCompositeOperation = 'destination-in';
  const edge = context.createRadialGradient(tree.rx, tree.ry, tree.rx * .4, tree.rx, tree.ry, tree.rx);
  edge.addColorStop(0, '#000');
  edge.addColorStop(1, '#0000');
  context.fillStyle = edge;
  context.fillRect(0, 0, patch.width, patch.height);
  return patch;
}

export function setupMeadowScene() {
  document.querySelectorAll<HTMLElement>('.meadow-break').forEach(section => {
    if (section.dataset.sceneReady) return;
    section.dataset.sceneReady = 'true';

    const canvas = section.querySelector<HTMLCanvasElement>('.meadow-canvas')!;
    const poster = section.querySelector<HTMLImageElement>('.meadow-poster')!;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const image = new Image();
    image.src = poster.currentSrc || poster.src;
    const sceneTrees = trees.map(tree => ({ ...tree }));
    const seeds: Seed[] = Array.from({ length: 60 }, (_, index) => ({
      x: 90 + (index * 373 % 1490),
      y: 115 + (index * 271 % 690),
      phase: index * 1.71,
      size: 1 + (index % 3) * .65,
      speed: .35 + (index % 7) * .09,
    }));
    let visible = false;
    let ready = false;
    let lastFrame = -Infinity;
    let pointerX = 0;
    let pointerY = 0;
    let ripple: { x: number; y: number; at: number } | null = null;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(WIDTH * ratio);
      canvas.height = Math.round(HEIGHT * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const render = (time: number) => {
      if (!ready || !visible || document.hidden || reduced.matches || time - lastFrame < 1 / 30) return;
      lastFrame = time;
      context.clearRect(0, 0, WIDTH, HEIGHT);

      const driftX = Math.sin(time * .14) * 4 + pointerX * 5;
      const driftY = Math.cos(time * .11) * 3 + pointerY * 4;
      context.save();
      context.translate(WIDTH / 2 + driftX, HEIGHT / 2 + driftY);
      context.scale(1.018, 1.018);
      context.drawImage(image, -WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
      context.restore();

      for (const tree of sceneTrees) {
        if (!tree.patch) continue;
        const sway = Math.sin(time * .6 + tree.phase) * 3.5;
        context.drawImage(tree.patch, tree.x - tree.rx + sway + driftX, tree.y - tree.ry + Math.cos(time * .5 + tree.phase) * 1.5 + driftY);
      }

      context.save();
      context.globalCompositeOperation = 'soft-light';
      const lightX = WIDTH * (.55 + Math.sin(time * .09) * .1);
      const light = context.createRadialGradient(lightX, 360, 50, lightX, 360, 450);
      light.addColorStop(0, '#fff8');
      light.addColorStop(1, '#fff0');
      context.fillStyle = light;
      context.fillRect(0, 0, WIDTH, HEIGHT);
      context.restore();

      for (const seed of seeds) {
        const x = seed.x + Math.sin(time * seed.speed + seed.phase) * 8;
        const y = seed.y + Math.cos(time * seed.speed * .7 + seed.phase) * 6;
        context.beginPath();
        context.arc(x, y, seed.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 247, 196, ${.22 + (Math.sin(time * .9 + seed.phase) + 1) * .18})`;
        context.fill();
      }

      const pondX = 1090;
      const pondY = 480;
      const glint = Math.sin(time * 1.4) * 9;
      context.beginPath();
      context.ellipse(pondX + glint, pondY, 21, 4, -.28, 0, Math.PI * 2);
      context.fillStyle = '#e8f5d65c';
      context.fill();
      if (ripple) {
        const age = time - ripple.at;
        if (age > 2.2) ripple = null;
        else {
          context.beginPath();
          context.ellipse(ripple.x, ripple.y, 8 + age * 28, 3 + age * 11, 0, 0, Math.PI * 2);
          context.strokeStyle = `rgba(232, 250, 236, ${.5 * (1 - age / 2.2)})`;
          context.lineWidth = 2;
          context.stroke();
        }
      }
    };

    image.decode().then(() => {
      sceneTrees.forEach(tree => { tree.patch = makePatch(image, tree); });
      resize();
      ready = true;
      section.classList.add('is-ready');
      render(gsap.ticker.time);
    }).catch(() => {});

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(section);
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
    };
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
    canvas.addEventListener('pointerdown', event => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * WIDTH;
      const y = (event.clientY - rect.top) / rect.height * HEIGHT;
      if (Math.hypot((x - 1090) / 130, (y - 480) / 90) < 1) ripple = { x, y, at: gsap.ticker.time };
    });
    gsap.ticker.add(render);
  });
}
