export default defineNuxtPlugin(() => {
  const cart = useCartStore()
  cart.hydrate()
  cart.startPersisting()
})
