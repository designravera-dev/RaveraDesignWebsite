import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import RaveraLogo from '../shared/RaveraLogo'
import useAdminSmoothScroll from './useAdminSmoothScroll'
import '../landing3/landing3.css'
import './adminCatalog.css'

const categories = ['Decoração', 'Porta-joias', 'Lembranças', 'Acessórios']
type Product = { id: string; name: string; description: string; price: number; category: string; active: boolean; images: string[] }
type Draft = Omit<Product, 'id' | 'price'> & { price: string }
const initialProducts: Product[] = [
  { id: '1', name: 'Porta-joias Emanuelly', description: 'Uma peça delicada em resina, com flores preservadas e acabamento artesanal.', price: 89.9, category: 'Porta-joias', active: true, images: ['/ravera/landing3/porta-joias-emanuelly.webp'] },
  { id: '2', name: 'Relógio Mármore Negro', description: 'Relógio de parede autoral em resina com detalhes dourados.', price: 189, category: 'Decoração', active: true, images: ['/ravera/landing3/relogio-marmore-negro.webp'] },
  { id: '3', name: 'Lembrança Bárbara', description: 'Uma lembrança personalizada para guardar momentos especiais.', price: 35, category: 'Lembranças', active: false, images: ['/ravera/landing3/lembranca-noiva-barbara.webp'] },
  { id: '4', name: 'Difusor com bandeja Rosé', description: 'Conjunto artesanal para perfumar e decorar com delicadeza.', price: 129.9, category: 'Decoração', active: true, images: ['/ravera/landing3/difusor-bandeja-rose.webp'] },
]
const emptyDraft = (): Draft => ({ name: '', description: '', price: '', category: '', active: true, images: [] })
const money = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function Modal({ children, title, onClose, wide = false }: { children: ReactNode; title: string; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return <dialog ref={ref} className={`ac-dialog ${wide ? 'ac-dialog-wide' : ''}`} aria-labelledby="ac-dialog-title" onCancel={event => { event.preventDefault(); onClose() }}>
    <header className="ac-dialog-header"><h2 id="ac-dialog-title">{title}</h2><button type="button" className="ac-icon" aria-label="Fechar diálogo" onClick={onClose}>×</button></header>
    {children}
  </dialog>
}

export default function AdminCatalogPage() {
  useAdminSmoothScroll()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [editor, setEditor] = useState<{ id?: string } | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageError, setImageError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [notice, setNotice] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => { const title = document.title; document.title = 'Gerenciar catálogo — RAVERA'; return () => { document.title = title } }, [])
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const filtered = products.filter(p => normalize(p.name).includes(normalize(search.trim())) && (!category || p.category === category) && (!status || p.active === (status === 'active')))
  const activeCount = products.filter(p => p.active).length
  function openEditor(product?: Product) {
    setDraft(product ? { ...product, images: [...product.images], price: product.price.toFixed(2).replace('.', ',') } : emptyDraft())
    setErrors({}); setImageError(''); setEditor(product ? { id: product.id } : {})
  }
  function save(event: FormEvent) {
    event.preventDefault()
    const price = Number(draft.price.replace(',', '.'))
    const nextErrors: Record<string, string> = {}
    if (!draft.name.trim()) nextErrors.name = 'Informe o nome do produto.'
    if (!draft.description.trim()) nextErrors.description = 'Conte um pouco sobre esta peça.'
    if (!draft.price.trim() || !Number.isFinite(price) || price <= 0 || price > 999999.99 || !/^\d+(?:[.,]\d{1,2})?$/.test(draft.price.trim())) nextErrors.price = 'Informe um preço entre R$ 0,01 e R$ 999.999,99, com até duas casas decimais.'
    if (!draft.category) nextErrors.category = 'Selecione uma categoria.'
    if (!draft.images.length) nextErrors.images = 'Adicione pelo menos uma imagem.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    const product: Product = { ...draft, name: draft.name.trim(), description: draft.description.trim(), id: editor?.id ?? crypto.randomUUID(), price }
    setProducts(current => editor?.id ? current.map(p => p.id === editor.id ? product : p) : [product, ...current])
    setNotice(editor?.id ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.')
    setEditor(null)
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return
    const selected = Array.from(files)
    if (draft.images.length + selected.length > 5) { setImageError('Você pode adicionar até 5 imagens.'); return }
    if (selected.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) { setImageError('Escolha imagens JPG, PNG ou WebP de até 5 MB cada.'); return }
    setUploading(true); setImageError('')
    try {
      const images = await Promise.all(selected.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const image = new Image()
          image.onload = () => resolve(String(reader.result))
          image.onerror = reject
          image.src = String(reader.result)
        }
        reader.onerror = reject; reader.readAsDataURL(file)
      })))
      setDraft(current => ({ ...current, images: [...current.images, ...images] }))
      setErrors(current => ({ ...current, images: '' }))
    } catch { setImageError('Não foi possível ler as imagens. Escolha outros arquivos e tente novamente.') }
    finally { setUploading(false) }
  }
  function fieldError(key: string) { return errors[key] ? <span className="ac-error" id={`error-${key}`}>{errors[key]}</span> : null }
  const fieldProps = (key: string) => ({ 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `error-${key}` : undefined })
  return <div className="ts ac">
    <aside className="ac-sidebar"><a href="/" aria-label="Ravera — início"><RaveraLogo /></a><p className="ac-eyebrow">ÁREA ADMINISTRATIVA</p><nav aria-label="Administração"><a href="/admin/catalogo" aria-current="page"><span aria-hidden="true">▦</span> Catálogo de produtos</a></nav><a className="ac-back" href="/">← Voltar ao site</a><small>Feito à mão. Cuidado em cada detalhe.</small></aside>
    <main className="ac-main">
      <div className="ac-topline"><span>Administração <span aria-hidden="true">/</span> Catálogo</span><span className="ac-demo">Modo demonstração</span></div>
      <header className="ac-heading"><div><p className="ac-eyebrow">SUAS PEÇAS, SUAS HISTÓRIAS</p><h1>Catálogo de produtos</h1><p>Um espaço para cuidar de cada criação da Ravera.</p></div><button className="ts-button ts-button--wine" onClick={() => openEditor()}><span aria-hidden="true">＋</span> Novo produto</button></header>
      <p className="ac-demo-note">Explore com dados fictícios. As alterações desta demonstração são reiniciadas ao recarregar a página.</p>
      <div className="ac-stats"><div><span>Total de produtos</span><strong>{products.length.toString().padStart(2, '0')}</strong></div><div><span><i className="ac-dot" /> Ativos</span><strong>{activeCount.toString().padStart(2, '0')}</strong></div><div><span><i className="ac-dot ac-dot-off" /> Inativos</span><strong>{(products.length - activeCount).toString().padStart(2, '0')}</strong></div></div>
      {notice && <div className="ac-notice" role="status"><span>✓ {notice}</span><button className="ac-icon" aria-label="Dispensar mensagem" onClick={() => setNotice('')}>×</button></div>}
      <section className="ac-panel" aria-label="Produtos cadastrados">
        <div className="ac-filters"><label>Buscar produto<input type="search" placeholder="Buscar pelo nome…" value={search} onChange={e => setSearch(e.target.value)} /></label><label>Categoria<select value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas as categorias</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos os status</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></label>{(search || category || status) && <button className="ac-text-button" onClick={() => { setSearch(''); setCategory(''); setStatus('') }}>Limpar filtros</button>}</div>
        <div className="ac-list-heading"><h2>Suas criações</h2><span aria-live="polite">{filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}</span></div>
        {filtered.length ? <div className="ac-products">{filtered.map(product => <article className="ac-product" key={product.id}>
          <img src={product.images[0]} alt={product.name} /><div className="ac-product-info"><span className="ac-category">{product.category}</span><h3>{product.name}</h3><span className="ac-price">{money(product.price)}</span></div>
          <span className={`ac-badge ${product.active ? '' : 'ac-badge-off'}`}><i className={`ac-dot ${product.active ? '' : 'ac-dot-off'}`} />{product.active ? 'Ativo' : 'Inativo'}</span>
          <div className="ac-actions"><button onClick={() => openEditor(product)} aria-label={`Editar ${product.name}`}>Editar</button><button onClick={() => { setProducts(current => current.map(p => p.id === product.id ? { ...p, active: !p.active } : p)); setNotice(`${product.name}: produto ${product.active ? 'desativado' : 'ativado'} com sucesso.`) }} aria-label={`${product.active ? 'Desativar' : 'Ativar'} ${product.name}`}>{product.active ? 'Desativar' : 'Ativar'}</button><button className="ac-delete" aria-label={`Excluir ${product.name}`} onClick={() => setDeleting(product)}>Excluir</button></div>
        </article>)}</div> : <div className="ac-empty"><span aria-hidden="true">◇</span><h3>{products.length ? 'Nenhum produto encontrado' : 'Sua primeira criação começa aqui'}</h3><p>{products.length ? 'Experimente outro nome ou ajuste os filtros para encontrar suas peças.' : 'Cadastre uma peça com nome, fotos e preço para começar a montar seu catálogo.'}</p><button className="ts-button ts-button--wine" onClick={() => products.length ? (setSearch(''), setCategory(''), setStatus('')) : openEditor()}>{products.length ? 'Limpar filtros' : 'Cadastrar primeiro produto'}</button></div>}
      </section><footer className="ac-footer">RAVERA <span>·</span> Cada detalhe conta uma história.</footer>
    </main>
    {editor && <Modal wide title={editor.id ? 'Editar produto' : 'Novo produto'} onClose={() => { if (!uploading) setEditor(null) }}><p className="ac-dialog-intro">Apresente sua criação com o cuidado que ela merece. Todos os campos são obrigatórios.</p><form ref={formRef} noValidate onSubmit={save}>
      <div className="ac-form-grid"><label className="ac-full">Nome do produto<input autoFocus maxLength={100} required value={draft.name} {...fieldProps('name')} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Ex.: Porta-joias floral" />{fieldError('name')}</label>
      <label className="ac-full">Descrição<textarea rows={3} maxLength={2000} required value={draft.description} {...fieldProps('description')} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Materiais, acabamento e o que torna esta peça especial…" />{fieldError('description')}</label>
      <label>Preço (R$)<input inputMode="decimal" required value={draft.price} {...fieldProps('price')} onChange={e => setDraft({ ...draft, price: e.target.value })} placeholder="0,00" />{fieldError('price')}</label>
      <label>Categoria<select required value={draft.category} {...fieldProps('category')} onChange={e => setDraft({ ...draft, category: e.target.value })}><option value="">Selecione uma categoria</option>{categories.map(c => <option key={c}>{c}</option>)}</select>{fieldError('category')}</label>
      <div className="ac-full"><label htmlFor="product-images">Imagens do produto</label><p className="ac-help" id="images-help">Até 5 imagens · JPG, PNG ou WebP · até 5 MB cada. A primeira será a capa.</p><div className="ac-previews">{draft.images.map((src, index) => <div key={src}><img src={src} alt={`Prévia ${index + 1}${index === 0 ? ' — capa' : ''}`} /><button type="button" aria-label={`Remover imagem ${index + 1}`} disabled={uploading} onClick={() => setDraft(current => ({ ...current, images: current.images.filter((_, i) => i !== index) }))}>×</button>{index === 0 && <small>Capa</small>}</div>)}</div><input id="product-images" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} {...fieldProps('images')} aria-describedby={[ 'images-help', errors.images ? 'error-images' : '', imageError ? 'image-error' : '' ].filter(Boolean).join(' ')} onChange={e => { void upload(e.target.files); e.target.value = '' }} />{fieldError('images')}{imageError && <p id="image-error" className="ac-error" role="alert">{imageError}</p>}{uploading && <p role="status">Preparando imagens…</p>}</div>
      <label className="ac-full ac-toggle"><input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /><span>Produto ativo<small>Desmarque para identificar esta peça como inativa na gestão do catálogo.</small></span></label></div>
      {Object.values(errors).some(Boolean) && <p className="ac-error" role="alert">Revise os campos indicados antes de salvar.</p>}
      <div className="ac-dialog-actions"><button type="button" className="ac-secondary" disabled={uploading} onClick={() => setEditor(null)}>Cancelar</button><button type="submit" className="ts-button ts-button--wine" disabled={uploading}>{editor.id ? 'Salvar alterações' : 'Cadastrar produto'}</button></div>
    </form></Modal>}
    {deleting && <Modal title="Excluir produto?" onClose={() => setDeleting(null)}><p className="ac-delete-copy">A peça <strong>{deleting.name}</strong> será removida desta demonstração. Esta ação não pode ser desfeita.</p><div className="ac-dialog-actions"><button autoFocus className="ac-secondary" onClick={() => setDeleting(null)}>Cancelar</button><button className="ac-danger" onClick={() => { setProducts(current => current.filter(p => p.id !== deleting.id)); setNotice('Produto excluído com sucesso.'); setDeleting(null) }}>Excluir produto</button></div></Modal>}
  </div>
}
