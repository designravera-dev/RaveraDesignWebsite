// The legacy copy element must live inside the active modal, otherwise it is inert.
function fallbackCopy(message: string): boolean {
  if (typeof document === 'undefined') return false
  const active = document.activeElement
  const selection = document.getSelection()
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : []
  const fieldSelection = active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement
    ? { start: active.selectionStart, end: active.selectionEnd, direction: active.selectionDirection }
    : null
  const textarea = document.createElement('textarea')
  textarea.value = message
  textarea.readOnly = true
  textarea.tabIndex = -1
  textarea.setAttribute('aria-hidden', 'true')
  textarea.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;pointer-events:none;font-size:16px;'
  try {
    const container = active?.closest('dialog[open]') ?? document.body
    container.append(textarea)
    textarea.focus({ preventScroll: true })
    textarea.select()
    textarea.setSelectionRange(0, message.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
    try {
      if (active instanceof HTMLElement && active.isConnected) active.focus({ preventScroll: true })
      if (fieldSelection && fieldSelection.start !== null && fieldSelection.end !== null && (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement)) {
        active.setSelectionRange(fieldSelection.start, fieldSelection.end, fieldSelection.direction ?? undefined)
      } else if (selection) {
        selection.removeAllRanges()
        ranges.forEach((range) => selection.addRange(range))
      }
    } catch { /* A removed focus target must not turn a successful copy into an error. */ }
  }
}

export async function copyMessageToClipboard(message: string): Promise<boolean> {
  try {
    // Invoked immediately by the click handler, while user activation is available.
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message)
      return true
    }
  } catch {
    // Permission denial and insecure/unsupported contexts use the same fallback.
  }
  try { return fallbackCopy(message) } catch { return false }
}
