import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type RefObject } from 'react'
import { catalogById } from './catalogData'
import { useCatalogSelection } from './catalogSelectionContext'
import LeafIcon from './LeafIcon'
import SelectionItem from './SelectionItem'
import SelectionClearAction from './SelectionClearAction'
import useCatalogQuote from './useCatalogQuote'
import CopyStatusToast from './CopyStatusToast'
import ManualCopyDialog from './ManualCopyDialog'

export default function SelectionDrawer({ open, onClose, leafRef }: { open: boolean; onClose: () => void; leafRef: RefObject<HTMLButtonElement | null> }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const quoteRef = useRef<HTMLButtonElement>(null)
  const { selectedProductIds, story, setStory, selectedCount, storageAvailable, announcement } = useCatalogSelection()
  const quote = useCatalogQuote()

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (dialog?.open && !dialog.contains(document.activeElement)) closeRef.current?.focus()
  }, [selectedProductIds])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return
    dialog.showModal()
    closeRef.current?.focus()
    const leaf = leafRef.current
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    const viewport = window.visualViewport
    const syncViewport = () => {
      dialog.style.setProperty('--selection-viewport-height', `${viewport?.height ?? window.innerHeight}px`)
      dialog.style.setProperty('--selection-viewport-top', `${viewport?.offsetTop ?? 0}px`)
      const active = document.activeElement
      if (active instanceof HTMLTextAreaElement && dialog.contains(active)) active.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    }
    syncViewport()
    viewport?.addEventListener('resize', syncViewport)
    viewport?.addEventListener('scroll', syncViewport)
    window.addEventListener('resize', syncViewport)
    return () => {
      viewport?.removeEventListener('resize', syncViewport)
      viewport?.removeEventListener('scroll', syncViewport)
      window.removeEventListener('resize', syncViewport)
      dialog.style.removeProperty('--selection-viewport-height')
      dialog.style.removeProperty('--selection-viewport-top')
      dialog.close()
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      leaf?.focus({ preventScroll: true })
    }
  }, [open, leafRef])

  function trapFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if ((event.target as HTMLElement).closest('dialog') !== event.currentTarget) return
    if (event.key !== 'Tab') return
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]') ?? [])
      .filter((element) => element.closest('dialog') === dialogRef.current && element.getClientRects().length > 0)
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <dialog
      id="catalog-selection-panel"
      ref={dialogRef}
      className="ts-selection-drawer"
      aria-labelledby="ts-selection-title"
      aria-modal="true"
      onCancel={(event) => { if (event.target === event.currentTarget) { event.preventDefault(); onClose() } }}
      onKeyDown={trapFocus}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
      }}
    >
      <div className="ts-selection-drawer-inner">
        <header className="ts-selection-heading">
          <div><p className="ts-kicker">Catálogo RAVERA</p><h2 id="ts-selection-title">Minha seleção</h2></div>
          <button ref={closeRef} className="ts-selection-close" type="button" onClick={onClose} aria-label="Fechar minha seleção"><span aria-hidden="true">×</span></button>
        </header>
        <div className="ts-selection-body">
          <CopyStatusToast feedback={quote.feedback} destination={quote.destination} onDismiss={quote.dismissFeedback} />
          {selectedCount ? (
            <ul className="ts-selection-list">
              {selectedProductIds.map((id) => {
                const product = catalogById.get(id)
                return product ? <SelectionItem key={id} product={product} /> : null
              })}
            </ul>
          ) : (
            <div className="ts-selection-empty">
              <LeafIcon />
              <h3>Sua seleção está vazia.</h3>
              <p>Escolha no catálogo as peças que mais combinam com a sua história.</p>
              <button className="ts-button ts-button--wine" type="button" onClick={onClose}>Explorar as peças</button>
            </div>
          )}
          <div className="ts-selection-story">
            <label htmlFor="catalog-story">Conte sua história <span>Opcional</span></label>
            <p id="catalog-story-help">Compartilhe a história, lembrança ou ocasião que deseja transformar em uma peça especial.</p>
            <textarea
              id="catalog-story"
              name="historia"
              rows={5}
              value={story}
              onChange={(event) => setStory(event.currentTarget.value)}
              aria-describedby="catalog-story-help"
              placeholder="Exemplo: quero eternizar as flores do meu casamento e criar uma peça que preserve essa memória..."
            />
          </div>
          {(selectedCount > 0 || story.length > 0) && <SelectionClearAction />}
        </div>
        <footer className="ts-selection-footer">
          <p className="ts-selection-summary"><span>{selectedCount === 1 ? 'Peça selecionada' : 'Peças selecionadas'}</span><strong>{selectedCount}</strong></p>
          <button ref={quoteRef} className="ts-button ts-button--wine ts-quote-action" type="button" disabled={!quote.enabled || quote.processing} aria-busy={quote.processing} aria-describedby="catalog-quote-guidance" onClick={(event) => { if (event.detail < 2) void quote.requestQuote() }}>Solicitar orçamento pelo Instagram <span aria-hidden="true">{quote.processing ? <span className="ts-copy-spinner" /> : '↗'}</span></button>
          <p id="catalog-quote-guidance" className="ts-quote-guidance">{!quote.destination ? 'O Direct do Instagram está indisponível. Tente novamente mais tarde.' : quote.enabled ? 'Vamos copiar sua seleção e abrir o Instagram. Cole a mensagem no Direct.' : 'Selecione pelo menos uma peça para enviar sua solicitação.'}</p>
          {!storageAvailable && <small>O armazenamento da sessão está indisponível. A seleção permanece disponível nesta página.</small>}
        </footer>
        <div className="ts-sr-only" role="status" aria-live="polite" aria-atomic="true"><span key={announcement.version}>{announcement.message}</span></div>
        <ManualCopyDialog message={quote.manualMessage} status={quote.manualStatus} destination={quote.destination} processing={quote.processing} triggerRef={quoteRef} onCopy={quote.copyManualMessage} onClose={quote.closeManualDialog} />
      </div>
    </dialog>
  )
}
