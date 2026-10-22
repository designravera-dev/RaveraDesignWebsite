import type { CatalogProduct } from './catalogTypes'

export function buildQuoteMessage(products: readonly Pick<CatalogProduct, 'name'>[], story: string): string {
  const names = [...new Set(products.flatMap((product) => {
    const name = typeof product?.name === 'string' ? product.name.trim() : ''
    return name ? [name] : []
  }))]
  if (!names.length) return ''
  const message = [
    'Olá! Gostei das seguintes peças da RAVERA:',
    names.map((name) => `• ${name}`).join('\n'),
    'Gostaria de solicitar um orçamento personalizado baseado nessas peças.',
  ].join('\n\n')
  const meaningfulStory = story.trim()
  return meaningfulStory ? `${message}\n\nMinha história:\n${meaningfulStory}` : message
}
