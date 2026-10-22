import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'

test('catalog renders safely on the server, with empty data and optional metadata absent', async () => {
  const server = await createServer({ cacheDir: 'node_modules/.vite-ssr-test', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
  try {
    const { default: CatalogPage } = await server.ssrLoadModule('/src/site/catalog/CatalogPage.tsx')
    const { catalogProducts } = await server.ssrLoadModule('/src/site/catalog/catalogData.ts')
    const { default: ProductCard } = await server.ssrLoadModule('/src/site/catalog/ProductCard.tsx')
    const { default: Provider } = await server.ssrLoadModule('/src/site/catalog/CatalogSelectionProvider.tsx')
    const { default: LandingThree } = await server.ssrLoadModule('/src/site/landing3/LandingThree.tsx')
    globalThis.window = { get sessionStorage() { throw new Error('Storage must never be read during render') } }

    const html = renderToString(createElement(CatalogPage))
    assert.ok(html.includes('Minha seleção'))
    assert.ok(html.includes('Memória em Flor'))
    assert.ok(!html.includes('ts-selection-badge'))
    assert.ok(html.includes('disabled=""'))
    assert.ok(html.includes('Conte sua história'))
    assert.ok(html.includes('Solicitar orçamento pelo Instagram'))
    assert.ok(html.includes('Selecione pelo menos uma peça para enviar sua solicitação.'))
    assert.ok(!html.includes('quote-message-text'))
    assert.ok(!/R\$|Unidades selecionadas|ts-selection-quantity|Adicionar outra/.test(html))

    const home = renderToString(createElement(LandingThree))
    assert.ok(home.includes('id="catalogo"'))
    assert.ok(!/Monte seu pedido|id="encomenda"|#encomenda|ts-form|ts-order|ts-piece-price/.test(home))

    const minimal = { id: catalogProducts[0].id, name: catalogProducts[0].name, image: catalogProducts[0].image }
    const card = renderToString(createElement(Provider, null, createElement(ProductCard, { product: minimal, index: 0 })))
    assert.ok(card.includes(minimal.name))
    assert.ok(!card.includes('undefined'))
    assert.ok(!card.includes('ts-catalog-price'))

    const missing = renderToString(createElement(CatalogPage, { productSlug: 'removed-product' }))
    assert.ok(missing.includes('Peça não encontrada.'))
    const original = [...catalogProducts]
    catalogProducts.splice(0)
    try {
      const empty = renderToString(createElement(CatalogPage))
      assert.ok(empty.includes('Nenhuma peça no catálogo no momento.'))
      assert.ok(empty.includes('Minha seleção'))
    } finally {
      catalogProducts.push(...original)
    }
  } finally {
    delete globalThis.window
    await server.close()
  }
})
