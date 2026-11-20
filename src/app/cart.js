const cartKey = (userId) => `eventora-cart-${userId}`

export function loadCart(userId) {
    try {
        const items = JSON.parse(localStorage.getItem(cartKey(userId)) || '[]')
        return Array.isArray(items) ? items : []
    } catch { return [] }
}

export function saveCart(userId, items) {
    localStorage.setItem(cartKey(userId), JSON.stringify(items))
}

export function addCartItem(userId, item) {
    const items = loadCart(userId)
    const next = [...items, { ...item, cartId: crypto.randomUUID() }]
    saveCart(userId, next)
    return next
}
