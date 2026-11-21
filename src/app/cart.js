const cartKey = (userId) => `eventora-cart-${userId}`

function createCartId() {
    // Some older mobile browsers and in-app webviews do not implement
    // crypto.randomUUID(). A cart id only needs to be locally unique.
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
    return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

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
    const next = [...items, { ...item, cartId: createCartId() }]
    saveCart(userId, next)
    return next
}
