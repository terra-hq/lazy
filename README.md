# @terrahq/lazy

Lightweight lazy loading library built on `IntersectionObserver`. Zero dependencies.

Supports `<img>`, `<picture>`, `<video>`, `<iframe>`, and background images.

## Install

```bash
npm install @terrahq/lazy
```

## Quick Start

```html
<img class="g--lazy-01" data-src="image.jpg" alt="..." />
```

```js
import Lazy from '@terrahq/lazy';

const lazy = new Lazy();
```

That's it. Images load automatically when they enter the viewport.

---

## HTML

Add the class `g--lazy-01` and use `data-src` instead of `src`:

### Image

```html
<img class="g--lazy-01" data-src="photo.jpg" alt="..." />
```

### Image with srcset

```html
<img class="g--lazy-01" data-src="photo.jpg" data-srcset="photo-2x.jpg 2x" alt="..." />
```

### Picture

```html
<picture class="g--lazy-01">
    <source data-srcset="photo.avif" type="image/avif" />
    <source data-srcset="photo.webp" type="image/webp" />
    <img data-src="photo.jpg" alt="..." />
</picture>
```

### Background image

```html
<div class="g--lazy-01" data-src="hero.jpg"></div>
```

### Video

```html
<!-- Direct src -->
<video class="g--lazy-01" data-src="clip.mp4" muted autoplay loop playsinline></video>

<!-- Multiple sources -->
<video class="g--lazy-01" muted autoplay loop playsinline>
    <source data-src="clip.webm" type="video/webm" />
    <source data-src="clip.mp4" type="video/mp4" />
</video>
```

### Iframe

```html
<iframe class="g--lazy-01" data-src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
```

---

## CSS

Minimal recommended styles:

```css
.g--lazy-01 {
    opacity: 0;
    transition: opacity 0.4s ease;
}

.g--lazy-01--is-loading {
    opacity: 0.3;
}

.g--lazy-01--is-active {
    opacity: 1;
}

.g--lazy-01--is-error {
    opacity: 1;
    outline: 2px solid red;
}
```

---

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selector` | `string` | `'.g--lazy-01'` | CSS selector for elements to observe |
| `src` | `string` | `'data-src'` | Attribute name for `src` |
| `srcset` | `string` | `'data-srcset'` | Attribute name for `srcset` |
| `loadingClass` | `string` | `'g--lazy-01--is-loading'` | Class added while loading |
| `successClass` | `string` | `'g--lazy-01--is-active'` | Class added on successful load |
| `errorClass` | `string` | `'g--lazy-01--is-error'` | Class added on error |
| `root` | `Element\|null` | `null` | `IntersectionObserver` root (`null` = viewport) |
| `rootMargin` | `string` | `'100px 0px'` | Margin around root (loads before entering viewport) |
| `threshold` | `number` | `0` | Intersection ratio to trigger (0 = first pixel) |
| `loadInvisible` | `boolean` | `false` | Whether to observe hidden elements (`display:none`) |

### Callbacks

| Callback | Arguments | When it fires |
|----------|-----------|---------------|
| `onLoading` | `(element)` | Element starts loading |
| `onSuccess` | `(element)` | Element loaded successfully |
| `onError` | `(element)` | Element failed to load |
| `onComplete` | none | All observed elements have been processed |
| `onDestroy` | none | `destroy()` is called (manual or automatic) |
| `onRevalidate` | `(newCount)` | `revalidate()` finishes, receives count of new elements found |

```js
const lazy = new Lazy({
    selector: '.g--lazy-01',
    rootMargin: '200px 0px',
    loadInvisible: true,
    onLoading: (el) => console.log('Loading:', el),
    onSuccess: (el) => console.log('Loaded:', el),
    onError: (el) => console.warn('Failed:', el),
    onComplete: () => console.log('All elements processed'),
    onDestroy: () => console.log('Observer disconnected'),
    onRevalidate: (count) => console.log(`Found ${count} new elements`),
});
```

---

## Methods

### `revalidate()`

Re-scans the DOM for new elements matching the selector. Skips elements that already have `successClass` or `errorClass`. Useful after dynamically adding content or when elements become visible (e.g., slider transitions).

```js
container.innerHTML += '<img class="g--lazy-01" data-src="new.jpg" />';
lazy.revalidate();
```

### `load(element, force?)`

Manually trigger loading of a specific element. Bypasses the `IntersectionObserver` — loads immediately.

```js
lazy.load(document.querySelector('#my-image'));

// Force reload even if already loaded
lazy.load(document.querySelector('#my-image'), true);
```

### `destroy()`

Disconnects the observer and cleans up. Called **automatically** when all observed elements have been processed. Call it manually when you need to tear down (e.g., page transitions).

```js
lazy.destroy();
```

---

## Examples

### Basic — auto-load on scroll

```js
import Lazy from '@terrahq/lazy';

const lazy = new Lazy({
    selector: '.g--lazy-01',
    rootMargin: '200px 0px',
    onSuccess: (el) => console.log('Loaded:', el.src),
});
```

### Manual trigger — click to load

```html
<button id="btn">Load image</button>
<img id="hero" class="g--lazy-manual" data-src="hero.jpg" alt="..." />
```

```js
import Lazy from '@terrahq/lazy';

const lazy = new Lazy({
    selector: '.g--lazy-manual',
    successClass: 'g--lazy-01--is-active',
    loadingClass: 'g--lazy-01--is-loading',
    errorClass: 'g--lazy-01--is-error',
});

// Disconnect auto-observation — only load via .load()
lazy.destroy();

document.querySelector('#btn').addEventListener('click', () => {
    lazy.load(document.querySelector('#hero'));
});
```

### With a slider (tiny-slider)

After each slide transition, call `revalidate()` so newly visible slides get observed:

```js
import Lazy from '@terrahq/lazy';
import { tns } from 'tiny-slider';

const lazy = new Lazy();

const slider = tns({
    container: '#slider',
    items: 3,
    loop: false,
});

slider.events.on('transitionEnd', () => {
    lazy.revalidate();
});
```

### With a marquee (@andresclua/infinite-marquee-gsap)

Marquee items move via GSAP transforms — `IntersectionObserver` detects them naturally as they enter the viewport. No `revalidate()` needed:

```js
import Lazy from '@terrahq/lazy';
import gsap from 'gsap';
import { horizontalLoop } from '@andresclua/infinite-marquee-gsap';

const lazy = new Lazy();

const marqueeEl = document.querySelector('#marquee');
const loop = horizontalLoop(marqueeEl.children, {
    paused: false,
    repeat: -1,
    speed: 1,
});

// Pause on hover
marqueeEl.addEventListener('mouseenter', () => {
    gsap.to(loop, { timeScale: 0, overwrite: true });
});
marqueeEl.addEventListener('mouseleave', () => {
    gsap.to(loop, { timeScale: 1, overwrite: true });
});
```

### SPA / page transitions (Swup, Barba, etc.)

Destroy on page leave, create a new instance on page enter:

```js
import Lazy from '@terrahq/lazy';

let lazy;

// On page enter
function onContentReplaced() {
    lazy = new Lazy({
        selector: '.g--lazy-01',
        loadInvisible: true,
        onComplete: () => console.log('Page images ready'),
    });
}

// On page leave
function onWillReplaceContent() {
    if (lazy) {
        lazy.destroy();
        lazy = null;
    }
}
```

---

## How It Works

### Lifecycle

```
constructor()
  └─ _init() → querySelectorAll(selector) → IntersectionObserver.observe()

Element enters viewport:
  └─ onLoading(el) → adds loadingClass
  └─ _loadElement(el) → detects type (img/picture/video/iframe/background)
  └─ preloads via new Image() (images & backgrounds)
      ├─ success → onSuccess(el) → removes loadingClass, adds successClass
      └─ error   → onError(el)   → removes loadingClass, adds errorClass

All elements processed:
  └─ onComplete()
  └─ destroy() → onDestroy() → observer.disconnect()
```

### Element type detection

| Element | How it loads |
|---------|-------------|
| `<img>` | Preloads with `new Image()`, then sets `src`/`srcset` on the real element |
| `<picture>` | Sets `srcset` on each `<source>`, then loads the inner `<img>` |
| `<video>` | Sets `src` on `<source>` children and/or the element itself, calls `.load()` |
| `<iframe>` | Sets `src` directly, listens for `onload`/`onerror` |
| Any other | Preloads with `new Image()`, then applies as `background-image` |

### Auto-cleanup

After each element loads (success or error), the internal counter decrements. When it reaches zero, `onComplete` fires and `destroy()` is called automatically — the observer disconnects and no longer consumes resources.

### Scroll direction

`IntersectionObserver` is direction-agnostic. It detects geometric intersection between the element and the root, regardless of whether the element became visible via vertical scroll, horizontal scroll, CSS transforms, or layout changes. Works with sliders, marquees, and any scroll direction.

---

## Browser Support

All modern browsers. Uses [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) (Chrome 51+, Firefox 55+, Safari 12.1+, Edge 15+).

## Development

```bash
npm run dev      # Start dev server with demo page
npm run build    # Build to dist/ (ES + UMD)
```

## License

MIT
