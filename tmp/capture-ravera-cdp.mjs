import fs from 'node:fs'
import path from 'node:path'

const pages = await fetch('http://127.0.0.1:9222/json').then((response) => response.json())
const page = pages.find((item) => item.type === 'page' && item.url.includes('127.0.0.1:4173'))
if (!page) throw new Error('RAVERA tab not found')

const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextId = 0
const pending = new Map()
const events = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(message.error)
    else resolve(message.result)
  } else if (message.method && events.has(message.method)) {
    events.get(message.method)(message.params)
    events.delete(message.method)
  }
})
function send(method, params = {}) {
  const id = ++nextId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
function nextEvent(method) {
  return new Promise((resolve) => events.set(method, resolve))
}

await send('Page.enable')
for (const width of [1440, 1024, 768, 390]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 })
  for (const direction of [1, 2, 3]) {
    const loaded = nextEvent('Page.loadEventFired')
    await send('Page.navigate', { url: `http://127.0.0.1:4173/landing${direction}/` })
    await loaded
    await send('Runtime.evaluate', {
      expression: 'Promise.all([...document.images].map((image) => image.decode().catch(() => null)))',
      awaitPromise: true,
    })
    await send('Runtime.evaluate', { expression: 'new Promise(resolve => setTimeout(resolve, 950))', awaitPromise: true })
    const metrics = await send('Runtime.evaluate', {
      expression: '({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: innerHeight, brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).length, title: document.title })',
      returnByValue: true,
    })
    if (metrics.result.value.scrollWidth > width || metrics.result.value.brokenImages) throw new Error(`landing${direction} ${width}: ${JSON.stringify(metrics.result.value)}`)
    if (width === 768 || (width === 390 && direction === 1)) {
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true })
      const file = path.join(process.env.TEMP, `ravera-cdp-landing${direction}-${width}-ready.png`)
      fs.writeFileSync(file, Buffer.from(screenshot.data, 'base64'))
    }
    console.log(`landing${direction} ${width}:`, metrics.result.value)
  }
}
socket.close()
