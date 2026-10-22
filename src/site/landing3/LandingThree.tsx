import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { categories, pieces } from './content'
import { INSTAGRAM_URL } from '../shared/contact'
import { CATALOG_PATH } from '../catalog/catalogRoutes'
import SiteHeader from '../shared/SiteHeader'
import SiteFooter from '../shared/SiteFooter'
import useSectionReveal from '../shared/useSectionReveal'
import CatalogSection from '../catalog/CatalogSection'
import './landing3.css'

// Contorno irregular inspirado na borda das peças dela (porta-joias e bandejas
// com beirada "mordida" e filete dourado). Soma de senoides sobre um círculo:
// frequências baixas deformam o todo, as altas fazem o recorte fino da borda.
// O seed fixo garante o mesmo desenho em todo carregamento.
function geodePoints(seed: number, count = 140) {
  let state = seed
  const random = () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }
  const waves = [2, 3, 7, 11, 23, 31].map((frequency) => ({
    frequency,
    amplitude: (frequency < 5 ? 0.9 : frequency < 15 ? 0.6 : 0.25) * (0.6 + random() * 0.8),
    phase: random() * Math.PI * 2,
  }))

  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2
    const radius = 45 + waves.reduce((sum, wave) => sum + wave.amplitude * Math.sin(wave.frequency * angle + wave.phase), 0)
    return [50 + radius * Math.cos(angle), 50 + radius * Math.sin(angle)]
  })
}

type GeodeProps = {
  src: string
  alt: string
  seed: number
  className?: string
  eager?: boolean
  // Ponto da foto que deve ficar no centro do recorte e quanto aproximar.
  focus?: string
  zoom?: number
}

function Geode({ src, alt, seed, className = '', eager = false, focus = '50% 50%', zoom = 1 }: GeodeProps) {
  const points = useMemo(() => geodePoints(seed), [seed])
  const clipPath = `polygon(${points.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(', ')})`

  return (
    <figure className={`ts-geode ${className}`}>
      <div className="ts-geode-clip" style={{ clipPath }}>
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: focus, transformOrigin: focus, scale: zoom }} />
      </div>
      <svg className="ts-geode-rim" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polygon points={points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')} />
      </svg>
    </figure>
  )
}

// Mostrador de relógio (as peças dela usam algarismos romanos). O ponto dourado
// dá uma volta por minuto em torno da peça — o tempo passa, a memória fica.
function Dial() {
  const numerals: [string, number, number][] = [['XII', 200, 38], ['III', 364, 205], ['VI', 200, 372], ['IX', 36, 205]]
  return (
    <svg className="ts-dial" viewBox="0 0 400 400" aria-hidden="true">
      <circle className="ts-dial-ring" cx="200" cy="200" r="198" />
      {Array.from({ length: 60 }, (_, index) => (
        <line
          key={index}
          className={index % 5 === 0 ? 'is-major' : undefined}
          x1="200"
          y1="4"
          x2="200"
          y2={index % 5 === 0 ? 18 : 11}
          transform={`rotate(${index * 6} 200 200)`}
          style={{ '--tick': index } as CSSProperties}
        />
      ))}
      {numerals.map(([label, x, y]) => (
        <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle">{label}</text>
      ))}
      <g className="ts-dial-orbit">
        <circle cx="200" cy="2" r="3.2" />
      </g>
    </svg>
  )
}

function CategoryIndex() {
  const [activeId, setActiveId] = useState(categories[0].id)
  const active = categories.find((category) => category.id === activeId) ?? categories[0]

  return (
    <div className="ts-index">
      <ol className="ts-index-list">
        {categories.map((category) => {
          const isActive = category.id === activeId
          return (
            <li key={category.id} className={isActive ? 'is-active' : undefined}>
              <button
                type="button"
                aria-expanded={isActive}
                aria-controls={`ts-cat-${category.id}`}
                onMouseEnter={() => setActiveId(category.id)}
                onFocus={() => setActiveId(category.id)}
                onClick={() => setActiveId(category.id)}
              >
                <span className="ts-index-numeral">{category.numeral}</span>
                <span className="ts-index-name">{category.name}</span>
                <span className="ts-index-items">{category.items}</span>
              </button>
              <div id={`ts-cat-${category.id}`} className="ts-index-detail">
                <div>
                  <p>{category.description}</p>
                  {category.image && <img src={category.image.src} alt={category.image.alt} loading="lazy" decoding="async" />}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="ts-index-preview">
        <div className="ts-index-frame">
          {categories.map((category) => (
            category.image
              ? <img key={category.id} className={category.id === activeId ? 'is-active' : undefined} src={category.image.src} alt={category.id === activeId ? category.image.alt : ''} loading="lazy" decoding="async" />
              : (
                <div key={category.id} className={`ts-index-placeholder${category.id === activeId ? ' is-active' : ''}`} aria-hidden={category.id !== activeId}>
                  <span>{category.numeral}</span>
                  <p>Fotos em breve</p>
                </div>
              )
          ))}
        </div>
        <p className="ts-index-caption"><strong>{active.name}</strong> — {active.description}</p>
      </div>
    </div>
  )
}

export default function LandingThree() {
  const rootRef = useRef<HTMLDivElement>(null)

  useSectionReveal(rootRef)

  return (
    <div className="ts" id="topo" ref={rootRef}>
      <a className="ts-skip" href="#conteudo">Pular para o conteúdo</a>
      <SiteHeader home />

      <main id="conteudo">
        <section className="ts-hero ts-dark" aria-labelledby="ts-hero-title">
          <div className="ts-container ts-hero-grid">
            <div className="ts-hero-copy">
              <p className="ts-kicker">Peças autorais em resina e madeira</p>
              <h1 id="ts-hero-title">Fragmentos de história, <em>suspensos</em> no tempo.</h1>
              <p className="ts-hero-lead">
                Peças únicas de decoração e a eternização de buquês de noiva, lembranças de bebê e tudo o que merece durar.
              </p>
              <div className="ts-hero-actions">
                <a className="ts-button ts-button--gold" href={`${CATALOG_PATH}/`}>Eternizar uma memória</a>
                <a className="ts-link" href="#colecao">Ver a coleção <span aria-hidden="true">↓</span></a>
              </div>
            </div>

            <div className="ts-hero-art">
              <Dial />
              <Geode
                className="ts-hero-geode"
                seed={7}
                focus="64% 34%"
                zoom={1.3}
                eager
                src="/ravera/landing3/porta-joias-emanuelly.webp"
                alt="Porta-joias em resina com uma flor eternizada, o nome Emanuelly e a data 06/09/2026"
              />
              <Geode
                className="ts-hero-geode-small"
                seed={31}
                focus="42% 70%"
                zoom={1.45}
                eager
                src="/ravera/landing3/lembranca-noiva-barbara.webp"
                alt="Noiva segurando uma peça em resina com o nome Bárbara em dourado"
              />
            </div>
          </div>

        </section>

        <section id="origem" className="ts-origin" aria-labelledby="ts-origin-title">
          <div className="ts-container ts-origin-grid">
            <blockquote className="ts-origin-quote" data-reveal>
              <p>A Ravera não transforma apenas objetos em resina. Transforma <em>fragmentos de história</em> em peças autorais de design.</p>
            </blockquote>
            <div className="ts-origin-copy" data-reveal>
              <p className="ts-kicker">A origem</p>
              <h2 id="ts-origin-title">Nasceu perto das noivas.</h2>
              <p>
                A Ravera surgiu do desejo de criar peças exclusivas e de eternizar buquês de noiva. Quem está por trás dela é
                cabeleireira e trabalha lado a lado com noivas — conhece de perto o valor de cada detalhe do grande dia.
              </p>
              <ul className="ts-values">
                <li><strong>Elegância</strong><span>Formas limpas e acabamento de joia.</span></li>
                <li><strong>Refinamento</strong><span>Cada peça é única, feita à mão.</span></li>
                <li><strong>Memória</strong><span>O que importa, preservado.</span></li>
              </ul>
            </div>
          </div>
        </section>

        <CatalogSection />

        <section id="colecao" className="ts-collection" aria-labelledby="ts-collection-title">
          <div className="ts-container">
            <div className="ts-section-head" data-reveal>
              <p className="ts-kicker">Coleção</p>
              <h2 id="ts-collection-title">Sete universos, <em>uma assinatura.</em></h2>
            </div>
            <div data-reveal>
              <CategoryIndex />
            </div>
          </div>
        </section>

        <section id="pecas" className="ts-pieces" aria-labelledby="ts-pieces-title">
          <div className="ts-container">
            <div className="ts-section-head ts-section-head--split" data-reveal>
              <div>
                <p className="ts-kicker">Peças recentes</p>
                <h2 id="ts-pieces-title">Direto do ateliê.</h2>
              </div>
              <a className="ts-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Ver mais no Instagram <span aria-hidden="true">↗</span></a>
            </div>
            <ul className="ts-pieces-grid">
              {pieces.map((piece) => (
                <li key={piece.name} className="ts-piece" data-reveal>
                  <div className="ts-piece-image">
                    <img src={piece.image.src} alt={piece.image.alt} width={piece.image.width} height={piece.image.height} loading="lazy" decoding="async" />
                  </div>
                  <p className="ts-piece-category">{piece.category}</p>
                  <h3>{piece.name}</h3>
                  <p className="ts-piece-description">{piece.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </main>

      <SiteFooter home />
    </div>
  )
}
