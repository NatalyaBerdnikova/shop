export default defineNuxtPlugin(() => {
  const wishlist = useWishlistStore()
  wishlist.hydrate()
  wishlist.startPersisting()
})
