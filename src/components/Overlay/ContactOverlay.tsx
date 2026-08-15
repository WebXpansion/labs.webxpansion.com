import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ContactOverlayProps {
  open: boolean
  onClose: () => void
}

const PROFILE_IMAGE = '/images/julien.webp'

// Free form-submission backend (no server needed) — https://web3forms.com
// 1. Go to web3forms.com, enter the email that should receive submissions
//    (e.g. contact@webxpansion.com) and grab the free access key it emails
//    you — no account/payment required.
// 2. Paste that key below in place of the placeholder.
// Until a real key is set, submissions will fail and show the error state.
const WEB3FORMS_ACCESS_KEY = '877716bf-de5d-40b4-b956-375e5b299d92'

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '17px 20px',
  borderRadius: 14,
  border: '1px solid rgba(0,0,0,0.15)',
  background: 'transparent',
  color: '#111',
  fontSize: 13,
  letterSpacing: '0.03em',
  textTransform: 'uppercase' as const,
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  outline: 'none',
}

const SOCIAL_LINKS = [
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@julienlallouche',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#contact-tiktok-clip)">
          <path
            d="M19.321 5.56219C19.1691 5.48369 19.0213 5.39765 18.8781 5.30437C18.4614 5.02897 18.0795 4.70444 17.7404 4.33781C16.8919 3.36703 16.5751 2.38219 16.4584 1.69265H16.4631C16.3656 1.12031 16.4059 0.75 16.4119 0.75H12.5476V15.6928C12.5476 15.8935 12.5476 16.0917 12.5391 16.2877C12.5391 16.312 12.5368 16.3345 12.5354 16.3608C12.5354 16.3715 12.5354 16.3828 12.5331 16.394C12.5331 16.3969 12.5331 16.3997 12.5331 16.4025C12.4923 16.9387 12.3204 17.4566 12.0325 17.9107C11.7447 18.3649 11.3496 18.7412 10.8821 19.0069C10.3948 19.2841 9.84381 19.4295 9.28323 19.4287C7.48275 19.4287 6.02349 17.9606 6.02349 16.1475C6.02349 14.3344 7.48275 12.8662 9.28323 12.8662C9.62403 12.8659 9.96273 12.9196 10.2868 13.0252L10.2915 9.09048C9.30777 8.9634 8.30835 9.04158 7.35633 9.3201C6.40437 9.59856 5.52038 10.0714 4.76023 10.7086C4.09417 11.2873 3.53421 11.9778 3.10555 12.749C2.94242 13.0303 2.32695 14.1605 2.25242 15.9947C2.20555 17.0358 2.5182 18.1144 2.66727 18.5602V18.5695C2.76102 18.832 3.1243 19.7278 3.71633 20.483C4.19372 21.0887 4.75774 21.6208 5.39023 22.0622V22.0528L5.39961 22.0622C7.27041 23.3335 9.34461 23.25 9.34461 23.25C9.70365 23.2355 10.9065 23.25 12.2724 22.6027C13.7874 21.885 14.6499 20.8158 14.6499 20.8158C15.2009 20.1769 15.6391 19.4488 15.9456 18.6628C16.2952 17.7436 16.4119 16.6411 16.4119 16.2005V8.27298C16.4588 8.30112 17.0832 8.71404 17.0832 8.71404C17.0832 8.71404 17.9827 9.29064 19.3861 9.66612C20.3931 9.9333 21.7496 9.98952 21.7496 9.98952V6.1533C21.2743 6.20484 20.3091 6.05484 19.321 5.56219Z"
            fill="black"
          />
        </g>
        <defs>
          <clipPath id="contact-tiktok-clip">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/julien_webxpansion/',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#contact-insta-clip)">
          <path
            d="M18.3766 4.41846C17.5732 4.41846 16.9707 5.02097 16.9707 5.82432C16.9707 6.62766 17.5732 7.23017 18.3766 7.23017C19.1799 7.23017 19.7824 6.62766 19.7824 5.82432C19.7824 5.02097 19.1799 4.41846 18.3766 4.41846Z"
            fill="black"
          />
          <path
            d="M12.0502 6.22656C8.73637 6.22656 6.12549 8.93786 6.12549 12.1512C6.12549 15.3646 8.83678 18.0759 12.0502 18.0759C15.2636 18.0759 17.9749 15.3646 17.9749 12.1512C17.9749 8.93786 15.364 6.22656 12.0502 6.22656ZM12.0502 15.9671C9.94139 15.9671 8.23427 14.26 8.23427 12.1512C8.23427 10.0425 9.94139 8.33535 12.0502 8.33535C14.159 8.33535 15.8661 10.0425 15.8661 12.1512C15.8661 14.26 14.159 15.9671 12.0502 15.9671Z"
            fill="black"
          />
          <path
            d="M16.8703 0H7.33054C3.21339 0 0 3.21339 0 7.23013V16.7699C0 20.7866 3.21339 24 7.23012 24H16.7699C20.7866 24 24 20.7866 24 16.7699V7.23013C24.1004 3.21339 20.887 0 16.8703 0ZM21.7908 16.8703C21.7908 19.5816 19.5816 21.8912 16.7699 21.8912H7.23012C4.51883 21.8912 2.2092 19.682 2.2092 16.8703V7.33054C2.2092 4.61925 4.41841 2.30962 7.23012 2.30962H16.7699C19.4812 2.30962 21.7908 4.51883 21.7908 7.33054V16.8703Z"
            fill="black"
          />
        </g>
        <defs>
          <clipPath id="contact-insta-clip">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    label: 'Mail',
    href: 'mailto:contact@webxpansion.com',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20.5714 4H3.42857C1.53644 4.00213 0.00219429 5.52364 0 7.4V17.6C0.00214299 19.4774 1.53644 20.9978 3.42857 21H20.5714C22.4646 20.9979 23.9978 19.4774 24 17.6V7.4C23.9979 5.52364 22.4646 4.00218 20.5714 4ZM21.7147 17.6C21.7136 18.2258 21.2025 18.7326 20.5714 18.7337H3.42857C2.79856 18.7326 2.28642 18.2258 2.28642 17.6V11.6437L10.2728 15.0957C11.0099 15.4134 11.8478 15.4134 12.5849 15.0957L21.7145 11.1495L21.7147 17.6ZM21.7147 8.67813L11.6722 13.0173C11.5169 13.0832 11.3412 13.0832 11.1858 13.0173L2.28661 9.17208V7.39984C2.28661 6.77508 2.79876 6.2672 3.42876 6.2672H20.5716C21.2027 6.2672 21.7138 6.77508 21.7148 7.39984L21.7147 8.67813Z"
          fill="black"
        />
      </svg>
    ),
  },
]

export function ContactOverlay({ open, onClose }: ContactOverlayProps) {
  const [step, setStep] = useState<'profile' | 'form' | 'sent'>('profile')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  // Reset back to the profile view every time the overlay is reopened, so
  // the form doesn't stay stuck on "sent" (or mid-typing) from a previous visit.
  useEffect(() => {
    if (open) {
      setStep('profile')
      setStatus('idle')
    }
  }, [open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formRef.current) return
    setStatus('sending')
    const formData = new FormData(formRef.current)
    formData.append('access_key', WEB3FORMS_ACCESS_KEY)
    formData.append('subject', 'Nouveau message depuis le portfolio')
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        setStep('sent')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="contact-backdrop"
          onClick={onClose}
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.35)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="contact-overlay-card"
            style={{
              position: 'relative',
              width: 'min(92vw, 600px)',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#fff',
              color: '#111',
              borderRadius: 26,
              padding: 36,
              boxShadow: '0 40px 120px rgba(0,0,0,0.5)',
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 8,
              }}
            >
              <motion.span
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)' }}
              >
                {step === 'profile' ? 'Bonjour' : step === 'form' ? 'Envoyer un message' : 'Message envoyé'}
              </motion.span>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="contact-close-btn"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid rgba(0,0,0,0.15)',
                  background: 'transparent',
                  color: '#111',
                  cursor: 'pointer',
                  fontSize: 15,
                  lineHeight: 1,
                  flexShrink: 0,
                  transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
                }}
              >
                ×
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{ margin: 0, fontSize: 20, fontWeight: 500, lineHeight: 1.3 }}
                  >
                    Je suis Julien Lallouche
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    style={{ margin: '2px 0 20px', fontSize: 20, fontWeight: 400, lineHeight: 1.3 }}
                  >
                    UI/UX Designer &amp; Développeur depuis 8 ans
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: '100%',
                      aspectRatio: '4 / 3',
                      borderRadius: 14,
                      overflow: 'hidden',
                      marginBottom: 20,
                      background: '#111',
                    }}
                  >
                    <img
                      src={PROFILE_IMAGE}
                      alt="Julien Lallouche"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      margin: '0 0 24px',
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      color: 'rgba(0,0,0,0.45)',
                    }}
                  >
                    Je crée des expériences interactives qui vont au-delà des attentes, en écartant les
                    sentiers conventionnels du marketing et de la communication digitale.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
                    className="contact-social-row"
                    style={{ display: 'flex', gap: 10, marginBottom: 12 }}
                  >
                    {SOCIAL_LINKS.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className="contact-social-btn"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '13px 16px',
                          borderRadius: 10,
                          border: '1px solid rgba(0,0,0,0.15)',
                          color: '#111',
                          textDecoration: 'none',
                          fontSize: 12,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          transition: 'background-color 0.25s ease, border-color 0.25s ease',
                        }}
                      >
                        <span className="contact-social-label">{social.label}</span>
                        {social.icon}
                      </a>
                    ))}
                  </motion.div>

                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setStep('form')}
                    className="contact-send-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      background: '#111',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: 10,
                      padding: '17px 20px',
                      fontSize: 13,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      boxSizing: 'border-box',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background-color 0.25s ease, color 0.25s ease',
                    }}
                  >
                    Envoyer un message
                    <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#contact-send-clip)">
                        <path
                          d="M32.2791 4.78012L14.1558 4.78012C12.9079 4.78012 11.8978 5.79027 11.9275 7.00839C11.9275 8.25623 12.9376 9.26638 14.1558 9.23667L26.9312 9.23667L5.6586 30.5093C4.797 31.3709 4.79699 32.797 5.6586 33.6586C6.5202 34.5202 7.94629 34.5202 8.80789 33.6586L30.0508 12.4157L30.0805 25.1614C30.0805 26.4093 31.0907 27.4194 32.3088 27.3897C32.903 27.3897 33.4972 27.152 33.9132 26.7361C34.3291 26.3201 34.5668 25.7853 34.5668 25.1317L34.5668 6.94897C34.5668 6.35477 34.3291 5.76056 33.9132 5.34462C33.4675 5.0178 32.8733 4.78012 32.2791 4.78012Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <clipPath id="contact-send-clip">
                          <rect width="40" height="40" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </motion.button>
                </motion.div>
              )}

              {step === 'form' && (
                <motion.form
                  key="form"
                  ref={formRef}
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {[
                    { name: 'name', placeholder: 'Nom*', required: true },
                    { name: 'company', placeholder: 'Entreprise', required: false },
                    { name: 'phone', placeholder: 'Téléphone', required: false },
                    { name: 'email', placeholder: 'E-mail', type: 'email', required: false },
                  ].map((field, index) => (
                    <motion.input
                      key={field.name}
                      name={field.name}
                      type={field.type ?? 'text'}
                      required={field.required}
                      placeholder={field.placeholder}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.05 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      style={inputStyle}
                    />
                  ))}
                  <motion.textarea
                    name="message"
                    placeholder="Description de votre projet"
                    rows={5}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.29, ease: [0.16, 1, 0.3, 1] }}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 120, lineHeight: 1.5 }}
                  />

                  {status === 'error' && (
                    <p style={{ margin: 0, fontSize: 12.5, color: '#c0392b' }}>
                      Une erreur est survenue, réessayez ou écrivez directement à{' '}
                      <a href="mailto:contact@webxpansion.com">contact@webxpansion.com</a>.
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={status === 'sending'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
                    className="contact-send-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      background: '#111',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: 10,
                      padding: '17px 20px',
                      fontSize: 13,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      boxSizing: 'border-box',
                      border: 'none',
                      cursor: status === 'sending' ? 'default' : 'pointer',
                      opacity: status === 'sending' ? 0.6 : 1,
                      fontFamily: 'inherit',
                      transition: 'background-color 0.25s ease, color 0.25s ease',
                    }}
                  >
                    {status === 'sending' ? 'Envoi en cours…' : 'Envoyer un message'}
                    <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#contact-send-clip)">
                        <path
                          d="M32.2791 4.78012L14.1558 4.78012C12.9079 4.78012 11.8978 5.79027 11.9275 7.00839C11.9275 8.25623 12.9376 9.26638 14.1558 9.23667L26.9312 9.23667L5.6586 30.5093C4.797 31.3709 4.79699 32.797 5.6586 33.6586C6.5202 34.5202 7.94629 34.5202 8.80789 33.6586L30.0508 12.4157L30.0805 25.1614C30.0805 26.4093 31.0907 27.4194 32.3088 27.3897C32.903 27.3897 33.4972 27.152 33.9132 26.7361C34.3291 26.3201 34.5668 25.7853 34.5668 25.1317L34.5668 6.94897C34.5668 6.35477 34.3291 5.76056 33.9132 5.34462C33.4675 5.0178 32.8733 4.78012 32.2791 4.78012Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <clipPath id="contact-send-clip">
                          <rect width="40" height="40" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </motion.button>
                </motion.form>
              )}

              {step === 'sent' && (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 500, lineHeight: 1.3 }}>
                    Merci !
                  </h2>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(0,0,0,0.6)' }}>
                    Votre message a bien été envoyé. Je vous recontacte rapidement.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <style>{`
            .contact-close-btn:hover {
              background: #111 !important;
              color: #fff !important;
              border-color: #111 !important;
            }
            .contact-social-btn:hover {
              background: rgba(0,0,0,0.05) !important;
              border-color: rgba(0,0,0,0.3) !important;
            }
            .contact-send-btn:hover {
              background: #333 !important;
            }
            @media (max-width: 640px) {
              .contact-social-label {
                display: none;
              }
              .contact-social-btn {
                justify-content: center !important;
              }
              .contact-overlay-card {
                padding: 20px !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
