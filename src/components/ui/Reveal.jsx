import { useEffect, useRef, useState } from 'react'

export default function Reveal({
  children,
  delay = 0,
  y = 24,
  as = 'div',
  className = '',
  ...props
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

useEffect(() => {
  const el = ref.current
  if (!el) return

  if (typeof IntersectionObserver === 'undefined') {
    setVisible(true)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0, rootMargin: '200px 0px 200px 0px' }
  )

  observer.observe(el)
  return () => observer.disconnect()
}, [])
  const Comp = as
  return (
    <Comp
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, '--reveal-y': `${y}px` }}
      {...props}
    >
      {children}
    </Comp>
  )
}