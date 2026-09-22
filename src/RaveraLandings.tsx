import { useEffect, type ReactNode } from 'react'
import './RaveraLandings.css'

type Direction = 1 | 2 | 3

const logo = {
  pearl: '/ravera/WhatsApp%20Image%202026-09-21%20at%2022.05.59.jpeg',
  wine: '/ravera/WhatsApp%20Image%202026-09-21%20at%2022.05.591.jpeg',
  taupe: '/ravera/WhatsApp%20Image%202026-09-21%20at%2022.05.592.jpeg',
  transparentWine: '/ravera/ravera-logo-wine-transparent.png',
}
const logoSize = { pearl: [1237, 740], wine: [1396, 731], taupe: [1188, 722], transparentWine: [1188, 722] }

const instagram = 'https://www.instagram.com/ravera.designn/'

function BrandMark({ tone, className = '', decorative = true, eager = true }: { tone: keyof typeof logo; className?: string; decorative?: boolean; eager?: boolean }) {
  return (
    <img
      className={`rv-logo ${className}`}
      src={logo[tone]}
      width={logoSize[tone][0]}
      height={logoSize[tone][1]}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      alt={decorative ? '' : 'RAVERA — Peças Autorais de Design'}
    />
  )
}

function InstagramLink({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <a className={className} href={instagram} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span></a>
}

function DirectionOne() {
  return (
    <div className="ravera rv-one" id="topo">
      <a className="rv-skip" href="#conteudo">Pular para o conteúdo</a>
      <header className="rv1-header">
        <nav aria-label="Navegação principal" className="rv1-nav rv1-nav-left"><a href="#universos">Universos</a><a href="#visao">A marca</a></nav>
        <a href="#topo" className="rv1-brand" aria-label="RAVERA, início"><BrandMark tone="transparentWine" decorative={false} eager /></a>
        <nav aria-label="Navegação complementar" className="rv1-nav rv1-nav-right"><a href="#materia">Matéria</a><a href="#contato">Contato</a></nav>
      </header>
      <main id="conteudo">
        <section className="rv1-hero rv-container" aria-labelledby="rv1-title">
          <div className="rv1-hero-copy rv-enter">
            <p className="rv-kicker">RAVERA <span /> Peças Autorais de Design</p>
            <h1 id="rv1-title">Peças para <em>permanecer.</em></h1>
            <p className="rv1-intro">Um encontro entre forma, presença e as histórias que escolhemos guardar.</p>
            <a className="rv-text-link" href="#universos">Descubra os universos <span aria-hidden="true">↗</span></a>
          </div>
          <figure className="rv1-hero-figure rv-enter">
            <div className="rv1-hero-image"><BrandMark tone="taupe" eager /></div>
            <figcaption><span>01 / Identidade</span><span>RAVERA</span></figcaption>
          </figure>
        </section>

        <section id="universos" className="rv1-universos rv-container" aria-labelledby="rv1-universos-title">
          <div className="rv1-section-heading"><p className="rv-kicker">01 / Universos</p><h2 id="rv1-universos-title">Uma curadoria de possibilidades.</h2><p>Quatro caminhos da identidade RAVERA, reunidos em uma linguagem autoral.</p></div>
          <div className="rv1-universe-grid">
            <article className="rv1-universe-card rv1-card-tall"><div className="rv1-card-visual rv1-visual-wine"><BrandMark tone="wine" /></div><div className="rv1-card-caption"><span>01</span><h3>Decoração</h3></div></article>
            <article className="rv1-universe-card"><div className="rv1-card-visual rv1-visual-pearl"><BrandMark tone="pearl" /></div><div className="rv1-card-caption"><span>02</span><h3>Eternização</h3></div></article>
            <article className="rv1-universe-card"><div className="rv1-card-visual rv1-visual-taupe"><BrandMark tone="taupe" /></div><div className="rv1-card-caption"><span>03</span><h3>Xadrez joia</h3></div></article>
          </div>
        </section>

        <section id="visao" className="rv1-vision rv-container" aria-labelledby="rv1-vision-title">
          <p className="rv-kicker">02 / Visão</p><div className="rv1-vision-body"><h2 id="rv1-vision-title">O objeto também pode ser uma forma de lembrar.</h2><p>RAVERA reúne peças autorais de design em universos que atravessam a decoração e a eternização. Uma identidade para olhar de perto, com tempo.</p></div>
        </section>

        <section id="materia" className="rv1-material" aria-labelledby="rv1-material-title">
          <div className="rv1-material-inner rv-container"><div className="rv1-material-art"><BrandMark tone="wine" /><span className="rv1-material-rule" aria-hidden="true" /></div><div className="rv1-material-copy"><p className="rv-kicker">03 / Matéria</p><h2 id="rv1-material-title">Madeira rústica.<br /><em>Outra expressão</em> da marca.</h2><p>Um dos universos apresentados na identidade RAVERA, ao lado de decoração, eternização e xadrez joia.</p></div></div>
        </section>

        <section id="contato" className="rv1-contact rv-container"><p className="rv-kicker">04 / Contato</p><h2>Uma conversa pode ser o início de uma peça.</h2><InstagramLink className="rv-outline-link">Conheça a RAVERA no Instagram</InstagramLink></section>
      </main>
      <footer className="rv1-footer rv-container"><span>RAVERA — Peças Autorais de Design</span><a href="#topo">Voltar ao início ↑</a></footer>
    </div>
  )
}

function DirectionTwo() {
  return (
    <div className="ravera rv-two" id="topo">
      <a className="rv-skip" href="#conteudo">Pular para o conteúdo</a>
      <header className="rv2-header rv-container"><a className="rv2-brand" href="#topo" aria-label="RAVERA, início"><BrandMark tone="taupe" decorative={false} eager /></a><nav aria-label="Navegação principal"><a href="#historia">Nossa essência</a><a href="#eternizacao">Eternização</a><a href="#criacao">Criação</a></nav><a className="rv2-header-contact" href="#contato">Vamos conversar <span aria-hidden="true">↗</span></a></header>
      <main id="conteudo">
        <section className="rv2-hero rv-container" aria-labelledby="rv2-title"><div className="rv2-hero-copy"><p className="rv-kicker">Peças Autorais de Design</p><h1 id="rv2-title">Há histórias que merecem <em>permanecer.</em></h1><p>Entre o que se vê e o que se sente, nasce o desejo de guardar.</p><a className="rv2-pill-link" href="#historia">Conheça a RAVERA <span aria-hidden="true">↓</span></a></div><div className="rv2-hero-art"><div className="rv2-arch"><BrandMark tone="pearl" eager /></div><span className="rv2-hero-note">RAVERA / Memória & forma</span></div></section>

        <section id="historia" className="rv2-story" aria-labelledby="rv2-story-title"><div className="rv2-story-inner rv-container"><div className="rv2-story-emblem"><BrandMark tone="taupe" /></div><div className="rv2-story-copy"><p className="rv-kicker">01 / Nossa essência</p><h2 id="rv2-story-title">O valor de uma peça também vive naquilo que ela evoca.</h2><p>Na RAVERA, design autoral e memória dividem o mesmo espaço. Um convite a reconhecer significado nas formas que permanecem por perto.</p></div></div></section>

        <section id="eternizacao" className="rv2-eternizacao rv-container" aria-labelledby="rv2-eternizacao-title"><div className="rv2-eternizacao-copy"><p className="rv-kicker">02 / Eternização</p><h2 id="rv2-eternizacao-title">O que é precioso encontra um novo lugar.</h2><p>A eternização é um dos universos da RAVERA: uma aproximação entre objeto e lembrança, pensada para histórias pessoais.</p><InstagramLink className="rv-text-link">Conte sua história</InstagramLink></div><div className="rv2-eternizacao-visual"><div className="rv2-round-image"><BrandMark tone="wine" /></div><span className="rv2-small-caption">Identidade RAVERA / Eternização</span></div></section>

        <section className="rv2-creations rv-container" aria-labelledby="rv2-creations-title"><div className="rv2-creations-heading"><p className="rv-kicker">03 / Outros universos</p><h2 id="rv2-creations-title">Diferentes maneiras de habitar o cotidiano.</h2></div><div className="rv2-creation-grid"><article><div className="rv2-creation-image rv2-creation-a"><BrandMark tone="taupe" /></div><h3>Decoração</h3><span>Universo RAVERA</span></article><article><div className="rv2-creation-image rv2-creation-b"><BrandMark tone="pearl" /></div><h3>Madeira rústica</h3><span>Universo RAVERA</span></article></div></section>

        <section id="criacao" className="rv2-process" aria-labelledby="rv2-process-title"><div className="rv-container"><p className="rv-kicker">04 / Criação</p><h2 id="rv2-process-title">Uma ideia toma forma.</h2><div className="rv2-process-grid"><div><span>01</span><h3>História</h3><p>O ponto de partida é aquilo que importa para você.</p></div><div><span>02</span><h3>Criação</h3><p>Um olhar autoral conduz a expressão da ideia.</p></div><div><span>03</span><h3>Peça</h3><p>Forma e significado se encontram.</p></div></div></div></section>

        <section id="contato" className="rv2-contact"><div className="rv-container"><p className="rv-kicker">05 / Conversa</p><h2>Qual história você gostaria de contar?</h2><InstagramLink className="rv2-pill-link">Fale com a RAVERA</InstagramLink></div></section>
      </main>
      <footer className="rv2-footer rv-container"><span>RAVERA — Peças Autorais de Design</span><a href="#topo">Voltar ao início ↑</a></footer>
    </div>
  )
}

function DirectionThree() {
  return (
    <div className="ravera rv-three" id="topo">
      <a className="rv-skip" href="#conteudo">Pular para o conteúdo</a>
      <div className="rv3-dark-opening"><header className="rv3-header rv-container"><a href="#topo" aria-label="RAVERA, início" className="rv3-brand"><BrandMark tone="wine" decorative={false} eager /></a><nav aria-label="Índice da página"><a href="#acervo">Acervo</a><a href="#intencao">Intenção</a><a href="#contato">Contato</a></nav><span className="rv3-edition">Peças Autorais de Design</span></header></div>
      <main id="conteudo">
      <div className="rv3-dark-opening"><section className="rv3-hero rv-container" aria-labelledby="rv3-title"><div className="rv3-hero-top"><p className="rv-kicker">RAVERA / Uma visão autoral</p><span>Índice 01 — 03</span></div><h1 id="rv3-title">Forma,<br /><em>matéria,</em><br />memória.</h1><div className="rv3-hero-bottom"><p>Uma coleção de universos para observar com tempo.</p><a href="#acervo">Percorrer o acervo <span aria-hidden="true">↓</span></a></div><div className="rv3-hero-image"><BrandMark tone="taupe" eager /><span>R / RAVERA</span></div></section></div>

      <section id="acervo" className="rv3-acervo rv-container" aria-labelledby="rv3-acervo-title"><div className="rv3-acervo-intro"><p className="rv-kicker">Acervo / Universos da marca</p><h2 id="rv3-acervo-title">Três leituras de uma identidade.</h2></div><article className="rv3-exhibit rv3-exhibit-one"><div className="rv3-exhibit-image"><BrandMark tone="pearl" /></div><div className="rv3-exhibit-meta"><span>01 / Universo</span><h3>Eternização</h3><p>Design e memória em diálogo.</p></div></article><article className="rv3-exhibit rv3-exhibit-two"><div className="rv3-exhibit-meta"><span>02 / Universo</span><h3>Decoração</h3><p>Presença autoral no espaço.</p></div><div className="rv3-exhibit-image"><BrandMark tone="taupe" /></div></article></section>

      <section id="intencao" className="rv3-pause"><div className="rv-container"><p className="rv-kicker">Interlúdio / Intenção</p><h2>O olhar muda quando damos espaço ao objeto.</h2><p>RAVERA — Peças Autorais de Design.</p></div></section>

      <section className="rv3-final-exhibit rv-container" aria-labelledby="rv3-final-title"><div className="rv3-final-image"><BrandMark tone="wine" /></div><div className="rv3-final-meta"><span>03 / Universo</span><h2 id="rv3-final-title">Xadrez joia</h2><p>Outro território da identidade RAVERA.</p><a className="rv-text-link" href="#contato">Continuar a conversa <span aria-hidden="true">↗</span></a></div></section>

      <section id="contato" className="rv3-contact"><div className="rv-container"><div><p className="rv-kicker">Contato / RAVERA</p><h2>A próxima história pode começar aqui.</h2></div><InstagramLink className="rv3-contact-link">Visite o Instagram da RAVERA</InstagramLink></div></section>
      </main>
      <footer className="rv3-footer rv-container"><span>RAVERA — Peças Autorais de Design</span><a href="#topo">Voltar ao início ↑</a></footer>
    </div>
  )
}

export default function RaveraLanding({ direction }: { direction: Direction }) {
  useEffect(() => {
    const names = { 1: 'Editorial', 2: 'Histórias', 3: 'Galeria' }
    document.title = `RAVERA — Peças Autorais de Design | ${names[direction]}`
    document.documentElement.lang = 'pt-BR'
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (favicon) {
      favicon.href = '/ravera/favicon.png'
      favicon.type = 'image/png'
    }
  }, [direction])

  if (direction === 1) return <DirectionOne />
  if (direction === 2) return <DirectionTwo />
  return <DirectionThree />
}
