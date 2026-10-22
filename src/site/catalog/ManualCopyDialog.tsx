import { useEffect, useRef, type RefObject } from 'react'

type Props = {
  message: string | null
  status: string
  destination: string
  processing: boolean
  triggerRef: RefObject<HTMLButtonElement | null>
  onCopy: () => Promise<void>
  onClose: () => void
}

export default function ManualCopyDialog({ message, status, destination, processing, triggerRef, onCopy, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const open = message !== null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return
    dialog.showModal()
    textRef.current?.focus()
    textRef.current?.setSelectionRange(0, 0)
    if (textRef.current) textRef.current.scrollTop = 0
    const trigger = triggerRef.current
    return () => {
      dialog.close()
      trigger?.focus({ preventScroll: true })
    }
  }, [open, triggerRef])

  return (
    <dialog
      ref={dialogRef}
      className="ts-manual-copy-dialog"
      aria-modal="true"
      aria-labelledby="manual-copy-title"
      aria-describedby="manual-copy-status"
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose() }}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key !== 'Tab') return
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, a[href]')
        if (!controls?.length) return
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }}
    >
      <header className="ts-selection-heading">
        <h2 id="manual-copy-title">Copie sua seleção</h2>
        <button className="ts-selection-close" type="button" onClick={onClose} aria-label="Fechar cópia manual"><span aria-hidden="true">×</span></button>
      </header>
      <div className="ts-manual-copy-body">
        <p id="manual-copy-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
        <label htmlFor="manual-copy-text">Mensagem para colar no Direct</label>
        <textarea ref={textRef} id="manual-copy-text" rows={8} readOnly value={message ?? ''} />
        <button type="button" className="ts-button ts-button--wine" disabled={processing} aria-busy={processing} onClick={() => void onCopy()}>Copiar mensagem {processing && <span className="ts-copy-spinner" aria-hidden="true" />}</button>
        <a className="ts-link" href={destination} target="_blank" rel="noopener noreferrer">Abrir Direct do Instagram <span aria-hidden="true">↗</span></a>
        <p>Depois de copiar, cole no Direct usando Ctrl+V ou ⌘V no computador, ou tocando e segurando para colar no celular. Envie a mensagem quando estiver pronta.</p>
      </div>
    </dialog>
  )
}
