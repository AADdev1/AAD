export function writeLocalCart(items) {
   window.localStorage.setItem('Cart', JSON.stringify(items))
}

export function getLocalCart() {
   if (typeof window !== 'undefined' && window.localStorage) {
      try {
         return JSON.parse(window.localStorage.getItem('Cart'))
      } catch (error) {
         writeLocalCart({ items: [] })
         return { items: [] }
      }
   }
}
export function getCountInCart({ cartItems = [], productId }) {
  try {
    return cartItems.find(item => item?.productId === productId)?.count ?? 0
  } catch (error) {
    console.error({ error })
    return 0
  }
}
