import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { normalizePath, isCatalogPath } from '../src/site/catalog/catalogRoutes.ts'
import { selectionReducer } from '../src/site/catalog/catalogSelectionReducer.ts'
import { readSelection, writeSelection, validateSelection, migrateLegacySelection, emptySelection, SELECTION_STORAGE_KEY, LEGACY_SELECTION_STORAGE_KEY } from '../src/site/catalog/catalogStorage.ts'
import { buildQuoteMessage } from '../src/site/catalog/catalogQuote.ts'
import { catalogProducts } from '../src/site/catalog/catalogData.ts'
import { quotationContact, whatsappQuoteUrl, INSTAGRAM_DM_URL, WHATSAPP_NUMBER } from '../src/site/shared/contact.ts'

const validIds = new Set(['memoria-em-flor', 'curva-da-materia'])
const first = { selectedProductIds: ['memoria-em-flor'], story: '' }
afterEach(() => { delete globalThis.window })

function mockStorage(initial = null) {
  const values = new Map(initial === null ? [] : [[SELECTION_STORAGE_KEY, initial]])
  globalThis.window = { sessionStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  } }
  return values
}

test('catalog route boundaries include trailing slashes and nested routes', () => {
  assert.equal(normalizePath('/'), '/')
  assert.equal(normalizePath('/prototipos/catalogo///'), '/prototipos/catalogo')
  for (const path of ['/prototipos/catalogo', '/prototipos/catalogo/', '/prototipos/catalogo/memoria-em-flor/']) assert.equal(isCatalogPath(path), true)
  for (const path of ['/', '/landing3/', '/prototipos/landing1', '/prototipos/landing2', '/prototipos/catalogo-outro']) assert.equal(isCatalogPath(path), false)
})

test('adding a product is idempotent and several different products can coexist', () => {
  let selection = selectionReducer(emptySelection(), { type: 'add', productId: 'memoria-em-flor' })
  assert.deepEqual(selection, first)
  assert.equal(selectionReducer(selection, { type: 'add', productId: 'memoria-em-flor' }), selection)
  selection = selectionReducer(selection, { type: 'add', productId: 'curva-da-materia' })
  assert.deepEqual(selection.selectedProductIds, ['memoria-em-flor', 'curva-da-materia'])
})

test('removing one product preserves all other products and the exact multiline story', () => {
  const selection = { selectedProductIds: ['memoria-em-flor', 'curva-da-materia'], story: '  Minha história\n\nFlores & lembranças.  ' }
  const result = selectionReducer(selection, { type: 'remove', productId: 'memoria-em-flor' })
  assert.deepEqual(result, { selectedProductIds: ['curva-da-materia'], story: selection.story })
  assert.deepEqual(selectionReducer(result, { type: 'remove', productId: 'curva-da-materia' }), { selectedProductIds: [], story: selection.story })
  assert.deepEqual(selectionReducer(result, { type: 'clear' }), emptySelection())
})

test('story editing preserves whitespace, line breaks and long text without truncation', () => {
  for (const story of [' \n\t ', 'Primeira linha\n\nSegunda linha 🌸', 'História '.repeat(10000)]) {
    assert.equal(selectionReducer(first, { type: 'story', story }).story, story)
    assert.equal(validateSelection({ ...first, story }, validIds).story, story)
  }
})

test('restoring selection removes duplicates and invalid IDs, and validates the story type', () => {
  assert.deepEqual(validateSelection({ selectedProductIds: ['memoria-em-flor', null, 2, 'removed', 'memoria-em-flor', 'curva-da-materia'], story: 'Minha história' }, validIds), { selectedProductIds: ['memoria-em-flor', 'curva-da-materia'], story: 'Minha história' })
  for (const value of [null, [], 'wrong', 1, {}]) assert.deepEqual(validateSelection(value, validIds), emptySelection())
  assert.deepEqual(validateSelection({ ...first, story: {} }, validIds), first)
  assert.deepEqual(validateSelection(first, new Set()), emptySelection())
})

test('legacy migration discards quantity values while preserving each valid product once', () => {
  const legacy = [{ productId: 'memoria-em-flor', quantity: 100 }, { productId: 'memoria-em-flor', quantity: 2 }, { productId: 'curva-da-materia', quantity: 'invalid' }, { productId: 'removed', quantity: 1 }, null, {}, 'invalid']
  assert.deepEqual(migrateLegacySelection(legacy, validIds), { selectedProductIds: ['memoria-em-flor', 'curva-da-materia'], story: '' })
  assert.deepEqual(migrateLegacySelection({}, validIds), emptySelection())
})

test('v2 round trip persists both IDs and exact story; clear removes both versioned keys', () => {
  const values = mockStorage()
  const selection = { ...first, story: 'Minha história\n\nFlores.' }
  assert.equal(writeSelection(selection), true)
  assert.equal(values.get(SELECTION_STORAGE_KEY), JSON.stringify(selection))
  assert.deepEqual(readSelection(validIds), { selection, available: true })
  values.set(LEGACY_SELECTION_STORAGE_KEY, JSON.stringify([{ productId: 'curva-da-materia', quantity: 1 }]))
  assert.equal(writeSelection(emptySelection()), true)
  assert.equal(values.has(SELECTION_STORAGE_KEY), false)
  assert.equal(values.has(LEGACY_SELECTION_STORAGE_KEY), false)
})

test('a story without selected products remains stored until explicitly cleared', () => {
  const values = mockStorage()
  const selection = { selectedProductIds: [], story: 'Quero guardar esta lembrança.' }
  assert.equal(writeSelection(selection), true)
  assert.deepEqual(readSelection(validIds), { selection, available: true })
  assert.equal(values.has(SELECTION_STORAGE_KEY), true)
})

test('legacy storage is migrated to v2 and existing v2 takes precedence', () => {
  const values = mockStorage()
  values.set(LEGACY_SELECTION_STORAGE_KEY, JSON.stringify([{ productId: 'memoria-em-flor', quantity: 8 }, { productId: 'memoria-em-flor', quantity: 3 }]))
  assert.deepEqual(readSelection(validIds), { selection: first, available: true })
  assert.equal(values.get(SELECTION_STORAGE_KEY), JSON.stringify(first))
  assert.equal(values.has(LEGACY_SELECTION_STORAGE_KEY), false)
  values.set(LEGACY_SELECTION_STORAGE_KEY, JSON.stringify([{ productId: 'curva-da-materia', quantity: 1 }]))
  assert.deepEqual(readSelection(validIds), { selection: first, available: true })
})

test('failed migration writes retain legacy data and still return usable in-memory selection', () => {
  const values = mockStorage()
  const legacy = JSON.stringify([{ productId: 'memoria-em-flor', quantity: 8 }])
  values.set(LEGACY_SELECTION_STORAGE_KEY, legacy)
  window.sessionStorage.setItem = () => { throw new Error('Quota exceeded') }
  assert.deepEqual(readSelection(validIds), { selection: first, available: false })
  assert.equal(values.get(LEGACY_SELECTION_STORAGE_KEY), legacy)
})

test('malformed JSON and invalid stored shapes fail gracefully', () => {
  const values = mockStorage('{broken')
  assert.deepEqual(readSelection(validIds), { selection: emptySelection(), available: true })
  assert.equal(values.has(SELECTION_STORAGE_KEY), false)
  values.set(LEGACY_SELECTION_STORAGE_KEY, '{broken')
  assert.deepEqual(readSelection(validIds), { selection: emptySelection(), available: true })
  assert.equal(values.has(LEGACY_SELECTION_STORAGE_KEY), false)
})

test('unavailable session storage and server execution do not throw', () => {
  assert.deepEqual(readSelection(validIds), { selection: emptySelection(), available: false })
  assert.equal(writeSelection(first), false)
  globalThis.window = { get sessionStorage() { throw new Error('Storage denied') } }
  assert.deepEqual(readSelection(validIds), { selection: emptySelection(), available: false })
  assert.equal(writeSelection(first), false)
})

test('storage read and write failures are caught independently', () => {
  globalThis.window = { sessionStorage: {
    getItem() { throw new Error('Read denied') },
    setItem() { throw new Error('Quota exceeded') },
    removeItem() { throw new Error('Remove denied') },
  } }
  assert.deepEqual(readSelection(validIds), { selection: emptySelection(), available: false })
  assert.equal(writeSelection(first), false)
  assert.equal(writeSelection(emptySelection()), false)
})

test('quote without story follows the exact Portuguese template and only includes real names', () => {
  const products = catalogProducts.slice(0, 2)
  const expected = `Olá! Gostei das seguintes peças da RAVERA:\n\n• ${products[0].name}\n• ${products[1].name}\n\nGostaria de solicitar um orçamento personalizado baseado nessas peças.`
  assert.equal(buildQuoteMessage(products, ''), expected)
  assert.equal(buildQuoteMessage(products, ' \n\t '), expected)
  for (const id of products.map((product) => product.id)) assert.ok(!expected.includes(id))
  assert.ok(!/R\$|quantidade|subtotal|\/ravera\//i.test(expected))
  assert.equal(buildQuoteMessage([], 'Uma história sem produtos'), '')
})

test('meaningful story is appended with preserved internal line breaks and Unicode', () => {
  const story = '  Quero guardar as flores.\n\nUma lembrança para minha mãe 🌸 & família.  '
  const message = buildQuoteMessage(catalogProducts.slice(0, 1), story)
  assert.ok(message.endsWith(`Minha história:\n${story.trim()}`))
  assert.equal(buildQuoteMessage(catalogProducts.slice(0, 1), 'História '.repeat(10000)).split('Minha história:\n')[1], 'História '.repeat(10000).trim())
})

test('message ignores unnamed products and deduplicates trimmed names in selection order', () => {
  const first = catalogProducts[1]
  const second = catalogProducts[0]
  const products = [first, { name: ' \n ' }, { name: null }, second, { name: ` ${first.name} ` }]
  assert.equal(buildQuoteMessage(products, ''), buildQuoteMessage([first, second], ''))
  assert.equal(buildQuoteMessage([{ name: undefined }, { name: '' }], 'História'), '')
})

test('quotation uses the official configured channel; WhatsApp helper safely encodes complete text', () => {
  assert.equal(WHATSAPP_NUMBER, '')
  const message = buildQuoteMessage(catalogProducts.slice(0, 2), 'Flores & nomes?\n+ "Memória" 🌸')
  assert.deepEqual(quotationContact(message), { channel: 'Instagram', href: INSTAGRAM_DM_URL, prefilled: false })
  // Número fictício usado exclusivamente para testar a codificação da URL.
  const url = new URL(whatsappQuoteUrl('5500000000000', message))
  assert.equal(url.origin, 'https://wa.me')
  assert.equal(url.searchParams.get('text'), message)
  assert.equal(url.searchParams.size, 1)
  assert.equal(new URL(whatsappQuoteUrl('5500000000000', '\ud800\n🌸')).searchParams.get('text'), '\ufffd\n🌸')
})
