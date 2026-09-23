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

const pointerStartX = ref<number | null>(null)
const pointerDeltaX = ref(0)

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  pointerStartX.value = event.clientX
  pointerDeltaX.value = 0
  ;(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (pointerStartX.value == null) return
  pointerDeltaX.value = event.clientX - pointerStartX.value
}

function onPointerUp(event: PointerEvent) {
  if (pointerStartX.value == null) return
  const delta = pointerDeltaX.value
  pointerStartX.value = null
  pointerDeltaX.value = 0
  ;(event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(
    event.pointerId
  )

  const threshold = 48
  if (Math.abs(delta) < threshold) return
  if (delta < 0) go(1)
  else go(-1)
  startAutoplay()
}

function onDragStart(event: DragEvent) {
  event.preventDefault()
}
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
  @pointerdown="onPointerDown"
  @pointermove="onPointerMove"
  @pointerup="onPointerUp"
  @pointercancel="onPointerUp"
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
        draggable="false"
        @dragstart="onDragStart"
      )
  .hero__live(
    :id="liveId"
    aria-live="polite"
    aria-atomic="true"
  )
    template(v-if="currentSlide")
      | Слайд {{ current + 1 }} из {{ slides.length }}
  .hero__dots(
    v-if="slides.length > 1"
    role="tablist"
    aria-label="Выбор слайда"
    @pointerdown.stop
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

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.hero {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 2000px;
  margin-inline: auto;
  height: min(88vh, 400px);
  overflow: hidden;
  background: $color-bg-dark;
  touch-action: pan-y;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &__media {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
  }

  &__live {
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

  &__dots {
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

  &__dot {
    width: 0.55rem;
    height: 0.55rem;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: rgb(255 255 255 / 35%);
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;

    &:hover {
      background: rgb(255 255 255 / 55%);
    }

    &--active {
      background: $color-white;
      transform: scale(1.2);
    }

    &:focus-visible {
      outline: 2px solid $color-white;
      outline-offset: 3px;
    }
  }
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

@media (prefers-reduced-motion: reduce) {
  .hero-fade-enter-active,
  .hero-fade-leave-active {
    transition: none;
  }
}
</style>
