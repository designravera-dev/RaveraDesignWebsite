import { useEffect, useState } from 'react'
import { fetchProducts } from './catalogService'
import type { CatalogProduct } from './catalogTypes'
import { CATALOG_PATH, productHref } from './catalogRoutes'
import CatalogImage from './CatalogImage'
import './catalog.css'

export default function CatalogSection() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (err) {
        console.error('Error loading preview products:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (!isLoading && products.length === 0) return null

  return (
    <section id="catalogo" className="ts-catalog-intro ts-dark" aria-labelledby="ts-catalog-intro-title">
      <div className="ts-container">
        <div className="ts-catalog-intro-heading" data-reveal>
          <div>
            <p className="ts-kicker">Catálogo RAVERA</p>
            <h2 id="ts-catalog-intro-title">Cinco caminhos para escolher uma peça <em>com intenção.</em></h2>
          </div>
          <div className="ts-catalog-intro-copy">
            <p>Proporções, texturas e narrativas afetivas em uma seleção mais completa.</p>
            <a className="ts-button ts-button--gold" href={`${CATALOG_PATH}/`}>Ver catálogo completo <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <ul className="ts-catalog-preview">
          {products.slice(0, 5).map((product, index) => (
            <li key={product.id}>
              <a href={productHref(product.id)}>
                <div className="ts-catalog-preview-image"><CatalogImage image={product.image} /></div>
                <div className="ts-catalog-preview-caption">
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{product.name}</h3>
                  <span aria-hidden="true">↗</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
