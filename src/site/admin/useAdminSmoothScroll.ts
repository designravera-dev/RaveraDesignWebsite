import { useEffect } from 'react'

export default function useAdminSmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let container: HTMLElement | null = null
    let destination = 0
    let lastTime = 0

    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
      container = null
    }

    function animate(time: number) {
      if (!container?.isConnected) { stop(); return }
      const elapsed = Math.min(time - lastTime, 40)
      lastTime = time
      const remaining = destination - container.scrollTop
      const done = Math.abs(remaining) < 0.5
      container.scrollTo({ top: done ? destination : container.scrollTop + remaining * (1 - Math.exp(-elapsed / 65)), behavior: 'instant' })
      if (done) stop()
      else frame = requestAnimationFrame(animate)
    }

    function wheel(event: WheelEvent) {
      if (reducedMotion.matches || event.defaultPrevented || event.ctrlKey || event.shiftKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      const target = event.target instanceof Element ? event.target : null
      if (!target?.closest('.ac') || target.closest('input, textarea, select, [contenteditable="true"]')) { stop(); return }
      const scroller = target.closest<HTMLElement>('.ac-dialog') ?? document.scrollingElement as HTMLElement | null
      if (!scroller) return
      const max = scroller.scrollHeight - scroller.clientHeight
      if (max <= 0) return
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientHeight : 1)
      const current = container === scroller && frame ? destination : scroller.scrollTop
      const next = Math.max(0, Math.min(max, current + delta))
      if (next === current) return
      event.preventDefault()
      container = scroller
      destination = next
      if (!frame) {
        lastTime = performance.now()
        frame = requestAnimationFrame(animate)
      }
    }

    // Teclado, toque e arraste retomam imediatamente a rolagem nativa.
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', stop)
    window.addEventListener('pointerdown', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    reducedMotion.addEventListener('change', stop)
    return () => {
      stop()
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', stop)
      window.removeEventListener('pointerdown', stop)
      window.removeEventListener('touchstart', stop)
      reducedMotion.removeEventListener('change', stop)
    }
  }, [])
}
