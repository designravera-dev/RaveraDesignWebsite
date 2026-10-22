import type { CopyFeedback } from './useCatalogQuote'

export default function CopyStatusToast({ feedback, destination, onDismiss }: { feedback: CopyFeedback | null; destination: string; onDismiss: () => void }) {
  return (
    <div className={`ts-copy-status${feedback ? ' is-visible' : ''}`}>
      <div role="status" aria-live="polite" aria-atomic="true">
        {feedback && <p key={feedback.version}>{feedback.message}</p>}
      </div>
      {feedback?.blocked && <a className="ts-link" href={destination} target="_blank" rel="noopener noreferrer">Abrir Direct do Instagram <span aria-hidden="true">↗</span></a>}
      {feedback && <button className="ts-selection-close" type="button" onClick={onDismiss} aria-label="Fechar aviso de cópia"><span aria-hidden="true">×</span></button>}
    </div>
  )
}
