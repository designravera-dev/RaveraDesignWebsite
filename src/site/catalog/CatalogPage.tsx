import { useEffect, useRef, useState } from 'react'
import { INSTAGRAM_URL } from '../shared/contact'
import '../landing3/landing3.css'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import useSectionReveal from '../shared/useSectionReveal'
import CatalogSelectionProvider from './CatalogSelectionProvider'
import { fetchProducts, fetchProductById } from './catalogService'
import type { CatalogProduct } from './catalogTypes'
import { CATALOG_PATH } from './catalogRoutes'
import CatalogImage from './CatalogImage'
import ProductCard from './ProductCard'
import SelectionAction from './SelectionAction'
import SelectionLeafButton from './SelectionLeafButton'
import './catalog.css'

export default function CatalogPage({ productSlug }: { productSlug?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useSectionReveal(rootRef)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        if (productSlug) {
          const p = await fetchProductById(productSlug)
          setProduct(p)
        } else {
          const ps = await fetchProducts()
          setProducts(ps)
        }
      } catch (e) {
        console.error('Failed to load catalog data:', e)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [productSlug])

  useEffect(() => {
    document.title = `${product?.name ?? (products[0]?.name ?? 'Catálogo')} — RAVERA | Peças autorais de design`
  }, [product, products])

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#381F2E', color: 'white', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Jost, sans-serif' }}>
        <p>Carregando catálogo...</p>
      </div>
    )
  }

  return (
    <CatalogSelectionProvider>
      <div className="ts ts-catalog" id="topo" ref={rootRef}>
        <a className="ts-skip" href="#conteudo">Pular para o conteúdo</a>
        <SiteHeader />
        <main id="conteudo" tabIndex={-1}>
          {productSlug ? product ? (
            <>
              <div className="ts-catalog-detail-bar ts-dark"><div className="ts-container"><a className="ts-link" href={`${CATALOG_PATH}/`}><span aria-hidden="true">←</span> Voltar ao catálogo</a></div></div>
              <article className="ts-container ts-catalog-detail" aria-labelledby="ts-product-title">
                <div className="ts-catalog-detail-image"><CatalogImage image={product.image} eager /></div>
                <div className="ts-catalog-detail-copy">
                  <p className="ts-kicker">Peça autoral</p>
                  <h1 id="ts-product-title">{product.name}</h1>
                  {product.summary && <p className="ts-catalog-summary">{product.summary}</p>}
                  <dl>
                    {product.material && <div><dt>Material</dt><dd>{product.material}</dd></div>}
                    {product.size && <div><dt>Dimensões</dt><dd>{product.size}</dd></div>}
                  </dl>
                  <SelectionAction product={product} />
                  <a className="ts-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Consultar disponibilidade <span aria-hidden="true">↗</span></a>
                </div>
              </article>
            </>
          ) : (
            <section className="ts-catalog-hero ts-dark"><div className="ts-container"><p className="ts-kicker">Catálogo RAVERA</p><h1>Peça não encontrada.</h1><a className="ts-button ts-button--gold" href={`${CATALOG_PATH}/`}>Voltar ao catálogo</a></div></section>
          ) : (
            <>
              <section className="ts-catalog-hero ts-dark" aria-labelledby="ts-catalog-title">
                <div className="ts-container ts-catalog-hero-grid">
                  <div><p className="ts-kicker">Catálogo RAVERA</p><h1 id="ts-catalog-title">Peças autorais para presentear <em>e guardar.</em></h1></div>
                  <div className="ts-catalog-hero-copy"><p>Objetos com presença, memória e acabamento autoral.</p><a className="ts-link" href="#catalogo-pecas">Explorar as peças <span aria-hidden="true">↓</span></a></div>
                </div>
              </section>
              <section id="catalogo-pecas" className="ts-container ts-catalog-collection" aria-label="Peças do catálogo">
                <div className="ts-catalog-index"><p className="ts-kicker">Peças autorais</p><span>{products.length} {products.length === 1 ? 'peça' : 'peças'}</span></div>
                {products.length ? <div className="ts-catalog-grid">{products.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div> : <p className="ts-catalog-no-products">Nenhuma peça no catálogo no momento.</p>}
              </section>
            </>
          )}
        </main>
        <SiteFooter />
        <SelectionLeafButton />
      </div>
    </CatalogSelectionProvider>
  )
}
