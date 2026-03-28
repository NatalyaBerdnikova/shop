<script setup lang="ts">
import type { HeroSlide } from '~/data/heroSlides'
import { DEFAULT_HERO_SLIDES } from '~/data/heroSlides'

export type { HeroSlide }

const props = withDefaults(
  defineProps<{
    slides?: HeroSlide[]
    /** Интервал автопрокрутки, мс */
    intervalMs?: number
  }>(),
  {
    intervalMs: 6500,
    slides: () => DEFAULT_HERO_SLIDES
  }
)

const slides = computed(() => props.slides ?? DEFAULT_HERO_SLIDES)

const current = ref(0)
const reducedMotion = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const regionId = useId()
const liveId = `${regionId}-live`

function go(delta: number) {
  const n = slides.value.length
  if (n === 0) return
  current.value = (current.value + delta + n) % n
}

function goTo(index: number) {
  if (index >= 0 && index < slides.value.length) {
    current.value = index
  }
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startAutoplay() {
  stopAutoplay()
  if (reducedMotion.value || slides.value.length <= 1) return
  timer = setInterval(() => go(1), props.intervalMs)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  startAutoplay()
})

onUnmounted(() => stopAutoplay())

watch(
  () => props.intervalMs,
  () => startAutoplay()
)

const currentSlide = computed(() => slides.value[current.value])
</script>

<template lang="pug">
section.hero(
  :id="regionId"
  role="region"
  aria-roledescription="карусель"
  aria-label="Главная галерея"
  @mouseenter="stopAutoplay"
  @mouseleave="startAutoplay"
  @focusin="stopAutoplay"
  @focusout="startAutoplay"
)
  .hero__media(aria-hidden="true")
    Transition(name="hero-fade")
      img.hero__img(
        v-if="currentSlide"
        :key="current"
        :src="currentSlide.src"
        :alt="currentSlide.alt"
        :fetchpriority="current === 0 ? 'high' : 'low'"
        :loading="current === 0 ? 'eager' : 'lazy'"
        sizes="100vw"
      )
  .hero__scrim(aria-hidden="true")
  .hero__content
    Transition(name="hero-text" mode="out-in")
      .hero__text(
        v-if="currentSlide"
        :key="currentSlide.src"
      )
        h1.hero__title {{ currentSlide.headline }}
        p.hero__tagline(v-if="currentSlide.tagline") {{ currentSlide.tagline }}
  .hero__live(
    :id="liveId"
    aria-live="polite"
    aria-atomic="true"
  )
    template(v-if="currentSlide")
      | Слайд {{ current + 1 }} из {{ slides.length }}: {{ currentSlide.headline }}
  .hero__controls(v-if="slides.length > 1")
    button.hero__btn.hero__btn--prev(
      type="button"
      aria-label="Предыдущий слайд"
      @click="go(-1)"
    )
      span.hero__chevron(aria-hidden="true") ‹
    button.hero__btn.hero__btn--next(
      type="button"
      aria-label="Следующий слайд"
      @click="go(1)"
    )
      span.hero__chevron(aria-hidden="true") ›
  .hero__dots(
    v-if="slides.length > 1"
    role="tablist"
    aria-label="Выбор слайда"
  )
    button.hero__dot(
      v-for="(_, i) in slides"
      :key="i"
      type="button"
      role="tab"
      :class="{ 'hero__dot--active': i === current }"
      :aria-selected="i === current"
      :tabindex="i === current ? 0 : -1"
      :aria-label="`Слайд ${i + 1}`"
      @click="goTo(i)"
    )
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 2000px;
  margin-inline: auto;
  min-height: min(88vh, 900px);
  max-height: 1000px;
  display: flex;
  align-items: flex-end;
  color: #fafafa;
  overflow: hidden;
  background: #0f0f10;
}

.hero__media {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.85s ease;
}

.hero-fade-leave-active {
  position: absolute;
  inset: 0;
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}

.hero__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgb(15 15 16 / 35%) 0%,
    rgb(15 15 16 / 55%) 45%,
    rgb(15 15 16 / 88%) 100%
  );
  pointer-events: none;
}

.hero__content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 720px;
  padding: clamp(1.5rem, 4vw, 3.5rem);
  padding-bottom: clamp(4rem, 12vw, 6rem);
}

.hero__title {
  margin: 0;
  font-size: clamp(1.85rem, 5vw, 3.25rem);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.12;
}

.hero__tagline {
  margin: 0.85rem 0 0;
  font-size: clamp(1rem, 2.2vw, 1.2rem);
  line-height: 1.45;
  opacity: 0.92;
  max-width: 36ch;
}

.hero-text-enter-active,
.hero-text-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.hero-text-enter-from,
.hero-text-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.hero__live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.hero__controls {
  position: absolute;
  z-index: 3;
  inset: 0;
  pointer-events: none;
}

.hero__btn {
  pointer-events: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.75rem;
  height: 2.75rem;
  border: none;
  border-radius: 999px;
  background: rgb(255 255 255 / 14%);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  backdrop-filter: blur(8px);
  transition: background 0.2s ease, transform 0.2s ease;
}

.hero__btn:hover {
  background: rgb(255 255 255 / 24%);
}

.hero__btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.hero__btn--prev {
  left: clamp(0.75rem, 3vw, 1.5rem);
}

.hero__btn--next {
  right: clamp(0.75rem, 3vw, 1.5rem);
}

.hero__chevron {
  font-size: 1.75rem;
  line-height: 1;
  font-weight: 300;
  margin-top: -0.15em;
}

.hero__dots {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: clamp(1rem, 3vw, 1.75rem);
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.hero__dot {
  width: 0.55rem;
  height: 0.55rem;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgb(255 255 255 / 35%);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.hero__dot:hover {
  background: rgb(255 255 255 / 55%);
}

.hero__dot--active {
  background: #fff;
  transform: scale(1.2);
}

.hero__dot:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .hero-fade-enter-active,
  .hero-fade-leave-active,
  .hero-text-enter-active,
  .hero-text-leave-active {
    transition: none;
  }

  .hero-text-enter-from,
  .hero-text-leave-to {
    transform: none;
  }
}
</style>
