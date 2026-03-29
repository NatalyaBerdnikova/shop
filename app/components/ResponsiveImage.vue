<script setup lang="ts">
export type ResponsiveImageSource = {
  type: string
  srcset: string
  media?: string
}

const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    /** Явные источники (avif, webp и т.д.) — порядок: от предпочтительного к запасному */
    sources?: ResponsiveImageSource[]
    /** srcset для финального <img> */
    srcset?: string
    sizes?: string
    width?: number
    height?: number
    loading?: 'lazy' | 'eager'
    decoding?: 'async' | 'sync' | 'auto'
    imgClass?: string
    pictureClass?: string
    /** Генерация avif/webp и DPR для images.unsplash.com; не используется при `sources` */
    unsplash?: boolean
  }>(),
  {
    loading: 'lazy',
    decoding: 'async',
    imgClass: '',
    pictureClass: '',
    unsplash: false
  }
)

function isUnsplashUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    return (
      u.hostname.includes('images.unsplash.com') ||
      u.hostname.includes('source.unsplash.com')
    )
  } catch {
    return false
  }
}

function toUnsplashVariant(
  rawSrc: string,
  options: { dpr: number; format?: 'avif' | 'webp' }
) {
  try {
    const url = new URL(rawSrc)
    if (!isUnsplashUrl(rawSrc)) return rawSrc

    const baseWidth = Number(url.searchParams.get('w') || props.width || 900)
    const pixelWidth = Math.min(3200, Math.round(baseWidth * options.dpr))

    url.searchParams.set('auto', 'format')
    url.searchParams.set('fit', url.searchParams.get('fit') || 'crop')
    url.searchParams.set('w', String(pixelWidth))
    url.searchParams.set('dpr', String(options.dpr))

    if (options.format) {
      url.searchParams.set('fm', options.format)
    } else {
      url.searchParams.delete('fm')
    }

    return url.toString()
  } catch {
    return rawSrc
  }
}

const unsplashAvif = computed(() =>
  [1, 2, 3]
    .map(
      (dpr) =>
        `${toUnsplashVariant(props.src, { dpr, format: 'avif' })} ${dpr}x`
    )
    .join(', ')
)

const unsplashWebp = computed(() =>
  [1, 2, 3]
    .map(
      (dpr) =>
        `${toUnsplashVariant(props.src, { dpr, format: 'webp' })} ${dpr}x`
    )
    .join(', ')
)

const unsplashFallbackSrc = computed(() =>
  toUnsplashVariant(props.src, { dpr: 1 })
)

const unsplashFallbackSrcset = computed(() =>
  [1, 2, 3]
    .map((dpr) => `${toUnsplashVariant(props.src, { dpr })} ${dpr}x`)
    .join(', ')
)

const resolvedSources = computed((): ResponsiveImageSource[] => {
  if (props.sources?.length) return props.sources
  if (
    props.unsplash &&
    isUnsplashUrl(props.src)
  ) {
    return [
      { type: 'image/avif', srcset: unsplashAvif.value },
      { type: 'image/webp', srcset: unsplashWebp.value }
    ]
  }
  return []
})

const usePicture = computed(
  () => resolvedSources.value.length > 0
)

const resolvedImgSrc = computed(() =>
  props.unsplash && isUnsplashUrl(props.src) && !props.sources?.length
    ? unsplashFallbackSrc.value
    : props.src
)

const resolvedImgSrcset = computed(() => {
  if (props.srcset) return props.srcset
  if (
    props.unsplash &&
    isUnsplashUrl(props.src) &&
    !props.sources?.length
  ) {
    return unsplashFallbackSrcset.value
  }
  return undefined
})
</script>

<template>
  <picture v-if="usePicture" :class="pictureClass">
    <source
      v-for="(s, i) in resolvedSources"
      :key="`${s.type}-${i}`"
      :type="s.type"
      :srcset="s.srcset"
      :media="s.media"
    />
    <img
      :src="resolvedImgSrc"
      :srcset="resolvedImgSrcset"
      :sizes="sizes"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      :decoding="decoding"
      :class="imgClass"
    />
  </picture>
  <img
    v-else
    :src="src"
    :srcset="srcset"
    :sizes="sizes"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    :decoding="decoding"
    :class="imgClass"
  />
</template>
