export function closeReservedTab(tab: Window | null) {
  try { tab?.close() } catch { /* The browser may have already closed the tab. */ }
}

export function reserveInstagramTab(): Window | null {
  let tab: Window | null = null
  try {
    // noopener in window.open can return null even when a tab opens. Keep the
    // handle for blocked-popup detection, then sever the blank tab's opener
    // synchronously, before external navigation or asynchronous work.
    tab = window.open('about:blank', '_blank')
    if (!tab) return null
    tab.opener = null
    const referrer = tab.document.createElement('meta')
    referrer.name = 'referrer'
    referrer.content = 'no-referrer'
    tab.document.head.append(referrer)
    tab.document.title = 'Abrindo o Instagram…'
    return tab
  } catch {
    closeReservedTab(tab)
    return null
  }
}

export function openInstagramDirect(tab: Window | null, destination: string): boolean {
  if (!tab || !destination) return false
  try {
    if (tab.closed) return false
    // Only our own blank tab is modified. Instagram is never manipulated and
    // no message is included in the destination.
    const link = tab.document.createElement('a')
    link.href = destination
    link.target = '_self'
    link.rel = 'noopener noreferrer'
    tab.document.body.append(link)
    link.click()
    return true
  } catch {
    closeReservedTab(tab)
    return false
  }
}
