import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, '.output', 'public')

function fail(message) {
  console.error(`verify-static: ${message}`)
  process.exit(1)
}

if (!existsSync(outDir)) {
  fail('нет .output/public. Сначала выполните npm run generate.')
}

function readText(rel) {
  const path = join(outDir, rel)
  if (!existsSync(path)) fail(`нет файла ${rel}`)
  const stat = statSync(path)
  if (!stat.isFile() || stat.size === 0) fail(`пустой файл ${rel}`)
  return readFileSync(path, 'utf8')
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, acc)
    else acc.push(path)
  }
  return acc
}

function filesSafe() {
  return walk(outDir)
}

function resolvePublicFile(urlPath) {
  const pathname = decodeURIComponent(urlPath.split(/[?#]/, 1)[0] || '')
  if (!pathname.startsWith('/')) return null
  const rel = pathname.replace(/^\/+/, '')
  const abs = rel ? join(outDir, rel) : outDir
  if (existsSync(abs) && statSync(abs).isFile()) return abs
  const asIndex = join(abs, 'index.html')
  if (existsSync(asIndex)) return asIndex
  return null
}

const requiredFiles = [
  'index.html',
  'catalog/index.html',
  'cart/index.html',
  'wishlist/index.html',
  'checkout/index.html',
  'delivery/index.html',
  'privacy/index.html',
  'return/index.html',
  'offer/index.html',
  '404.html',
  '200.html',
  'favicon.ico',
  'favicon-32x32.png',
  'robots.txt',
  'site.webmanifest',
  '404.png',
  '404_mobile.png',
  'decor/cover.png'
]

for (const file of requiredFiles) readText(file)

const home = readText('index.html')
if (!home.includes('Самые популярные')) {
  fail('главная не содержит блок «Самые популярные»')
}
if (!home.includes('/decor/cover.png')) {
  fail('главная не ссылается на обложку /decor/cover.png')
}

const checkout = readText('checkout/index.html')
if (!checkout.includes('Оформление заказа')) {
  fail('страница оформления потеряла заголовок')
}
if (!checkout.includes('стороне Яндекса')) {
  fail('страница оформления потеряла описание чекаута')
}
const checkoutScript = filesSafe().find((file) => {
  if (!file.endsWith('.js')) return false
  return readFileSync(file, 'utf8').includes('Перейти к оформлению')
})
if (!checkoutScript) {
  fail('в клиентском бандле нет кнопки «Перейти к оформлению»')
}

const mock = readFileSync(join(root, 'app/data/catalog.mock.ts'), 'utf8')
const products = [
  ...mock.matchAll(/slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'/g)
].map((match) => ({ slug: match[1], title: match[2] }))

if (products.length < 12) {
  fail(`в моке каталога ожидалось минимум 12 товаров, найдено ${products.length}`)
}

const catalogHtml = readText('catalog/index.html')
if (!catalogHtml.includes('Найдено товаров')) {
  fail('каталог не содержит список товаров')
}

for (const product of products) {
  const html = readText(`catalog/${product.slug}/index.html`)
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || ''
  if (!title.includes(product.title)) {
    fail(
      `title /catalog/${product.slug} = «${title}», ожидалось имя «${product.title}»`
    )
  }
  if (!html.includes('Добавить в корзину')) {
    fail(`страница /catalog/${product.slug} потеряла кнопку корзины`)
  }
  if (html.includes('Найдено товаров')) {
    fail(
      `страница /catalog/${product.slug} отрендерила каталог вместо карточки товара`
    )
  }
}

const files = filesSafe()
for (const file of files.filter((item) => item.endsWith('.html'))) {
  const text = readFileSync(file, 'utf8')
  if (/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(text)) {
    fail(`в ${relative(outDir, file)} записан хост пререндера`)
  }
}
for (const file of files.filter((item) =>
  /\.(html|js|mjs|json)$/.test(item)
)) {
  const text = readFileSync(file, 'utf8')
  if (/postgresql:\/\/|amateru_dev/.test(text)) {
    fail(`в ${relative(outDir, file)} попала строка подключения к базе`)
  }
}

const assetRefs = new Set()
for (const file of files.filter((item) => item.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8')
  for (const match of html.matchAll(
    /(?:src|href)="(\/[^"]+)"/g
  )) {
    assetRefs.add(match[1])
  }
}

let missingAssets = 0
for (const ref of assetRefs) {
  if (
    ref.startsWith('/api/') ||
    ref.startsWith('/v1/') ||
    ref.startsWith('/metrics') ||
    ref.startsWith('/health')
  ) {
    continue
  }
  if (!resolvePublicFile(ref)) {
    missingAssets += 1
    console.error(`нет файла для ссылки ${ref}`)
  }
}
if (missingAssets > 0) {
  fail(`не найдены ${missingAssets} локальных ресурса`)
}

if (existsSync(join(outDir, '_icons', 'index.html'))) {
  fail('в статику попала dev-страница /_icons')
}

const nuxtAssets = files.filter((file) =>
  relative(outDir, file).startsWith('_nuxt/')
)
if (!nuxtAssets.some((file) => file.endsWith('.js'))) {
  fail('в _nuxt нет javascript')
}
if (!nuxtAssets.some((file) => file.endsWith('.css'))) {
  fail('в _nuxt нет css')
}

console.log(
  `verify-static: ok, ${products.length} карточек товара, ${assetRefs.size} локальных ссылок`
)
