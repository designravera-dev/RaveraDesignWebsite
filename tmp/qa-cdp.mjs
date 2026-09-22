const pages = await fetch('http://127.0.0.1:9222/json').then((response) => response.json())
const page = pages.find((item) => item.type === 'page' && item.url.includes('/landing3/'))
if (!page) throw new Error('RAVERA tab not found')
const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
const expression = `({
  viewport: [window.innerWidth, window.innerHeight, document.documentElement.scrollWidth],
  images: [...document.querySelectorAll('.rv3-hero-image img, .rv3-exhibit-image img')].map((el) => {
    const r = el.getBoundingClientRect();
    const p = el.parentElement.getBoundingClientRect();
    const style = getComputedStyle(el);
    return { src: el.getAttribute('src'), complete: el.complete, natural: [el.naturalWidth, el.naturalHeight],
      rect: [r.x, r.y, r.width, r.height], parent: [p.x, p.y, p.width, p.height],
      display: style.display, visibility: style.visibility, opacity: style.opacity };
  })
})`
const result = await new Promise((resolve, reject) => {
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id === 1) {
      if (message.error) reject(message.error)
      else resolve(message.result.result.value)
    }
  })
  socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }))
})
console.log(JSON.stringify(result, null, 2))
socket.close()
