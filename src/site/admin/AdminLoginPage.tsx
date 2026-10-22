import { useEffect, useRef, useState, type FormEvent } from 'react'
import RaveraLogo from '../shared/RaveraLogo'
import '../landing3/landing3.css'
import './adminLogin.css'

function emailError(value: string, typeMismatch = false) {
  if (!value.trim()) return 'Informe seu e-mail.'
  if (typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Informe um e-mail válido, como nome@exemplo.com.'
  return ''
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [emailTypeMismatch, setEmailTypeMismatch] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [accessUnavailable, setAccessUnavailable] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const emailMessage = touched.email ? emailError(email, emailTypeMismatch) : ''
  const passwordMessage = touched.password && !password ? 'Informe sua senha.' : ''

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Área da administradora — RAVERA'
    return () => { document.title = previousTitle }
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (accessUnavailable) return
    setTouched({ email: true, password: true })
    const typeMismatch = emailRef.current?.validity.typeMismatch ?? false
    setEmailTypeMismatch(typeMismatch)
    if (emailError(email, typeMismatch)) {
      emailRef.current?.focus()
      return
    }
    if (!password) {
      passwordRef.current?.focus()
      return
    }
    // Esta etapa valida somente a interface; não autentica nem inicia uma sessão.
    setAccessUnavailable(true)
  }

  return (
    <div className="ts ts-admin-login ts-dark">
      <main className="ts-admin-login-main" aria-labelledby="admin-login-title">
        <div className="ts-admin-login-brand" aria-label="Ravera">
          <RaveraLogo />
        </div>

        <div className="ts-admin-login-card">
          <header className="ts-admin-login-heading">
            <h1 id="admin-login-title">Área da administradora</h1>
            <p>Acesse sua área para cuidar do catálogo da Ravera.</p>
          </header>

          <form className="ts-admin-login-form" onSubmit={handleSubmit} noValidate>
            <div className="ts-admin-login-field">
              <label htmlFor="admin-email">E-mail</label>
              <input
                ref={emailRef}
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                placeholder="nome@exemplo.com"
                aria-invalid={Boolean(emailMessage)}
                aria-describedby={emailMessage ? 'admin-email-error' : undefined}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setEmailTypeMismatch(event.target.validity.typeMismatch)
                  setAccessUnavailable(false)
                }}
              />
              {emailMessage && <p className="ts-admin-login-error" id="admin-email-error" aria-live="polite">{emailMessage}</p>}
            </div>

            <div className="ts-admin-login-field">
              <label htmlFor="admin-password">Senha</label>
              <div className="ts-admin-login-password">
                <input
                  ref={passwordRef}
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={password}
                  aria-invalid={Boolean(passwordMessage)}
                  aria-describedby={passwordMessage ? 'admin-password-error' : undefined}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setAccessUnavailable(false)
                  }}
                />
                <button
                  className="ts-admin-login-visibility"
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-controls="admin-password"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {showPassword && <path d="m3 3 18 18" />}
                  </svg>
                </button>
              </div>
              {passwordMessage && <p className="ts-admin-login-error" id="admin-password-error" aria-live="polite">{passwordMessage}</p>}
            </div>

            <div className="ts-admin-login-action">
              <button className="ts-button ts-button--wine ts-admin-login-submit" type="submit" disabled={accessUnavailable} aria-describedby={accessUnavailable ? 'admin-login-status' : undefined}>Entrar</button>
              <div className="ts-admin-login-status" role="status" aria-atomic="true">
                {accessUnavailable && <p id="admin-login-status">O acesso à área administrativa estará disponível em breve.</p>}
              </div>
            </div>
          </form>

          <a className="ts-admin-login-back" href="/">
            <span aria-hidden="true">←</span> Voltar ao site
          </a>
        </div>
      </main>
    </div>
  )
}
