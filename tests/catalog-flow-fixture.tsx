// Browser-only hook fixture, served by Vite in development; never imported by the site.
/* eslint-disable react/only-export-components -- This fixture exposes a mount/unmount helper for lifecycle tests. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CatalogSelectionProvider from '../src/site/catalog/CatalogSelectionProvider'
import { useCatalogSelection } from '../src/site/catalog/catalogSelectionContext'
import useCatalogQuote from '../src/site/catalog/useCatalogQuote'

function QuoteFixture() {
  const { add } = useCatalogSelection()
  const quote = useCatalogQuote()
  return (
    <>
      <button type="button" onClick={() => add('memoria-em-flor')}>Selecionar peça no teste</button>
      <button type="button" disabled={!quote.enabled || quote.processing} aria-busy={quote.processing} onClick={() => void quote.requestQuote()}>Abrir Instagram no teste</button>
      <p role="status">{quote.feedback?.message}</p>
    </>
  )
}

export function mountFixture(container: HTMLElement) {
  const root = createRoot(container)
  root.render(<StrictMode><CatalogSelectionProvider><QuoteFixture /></CatalogSelectionProvider></StrictMode>)
  return () => root.unmount()
}
