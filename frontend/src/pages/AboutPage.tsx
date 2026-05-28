import BottomNav from '../components/BottomNav'
import { useBackButton } from '../hooks/useBackButton'
import './AboutPage.css'

export default function AboutPage() {
  useBackButton()

  return (
    <div className="about-page">

      {/* Шапка */}
      <div className="about-header">
        <h1 className="about-title">VS MOTORS</h1>
        <p className="about-subtitle">Официальный автосалон</p>
      </div>

      {/* Контакты */}
      <div className="about-contacts">
        <button
          className="about-contact-row"
          onClick={() => window.open(`tg://resolve?domain=${import.meta.env.VITE_OWNER_TG_USERNAME}`)}
        >
          <span className="about-contact-label">Telegram</span>
          <span className="about-contact-value">@{import.meta.env.VITE_OWNER_TG_USERNAME}</span>
        </button>
        <button
          className="about-contact-row"
          onClick={() => window.open(`tel:${import.meta.env.VITE_OWNER_PHONE}`)}
        >
          <span className="about-contact-label">Телефон</span>
          <span className="about-contact-value">{import.meta.env.VITE_OWNER_PHONE}</span>
        </button>
        {import.meta.env.VITE_OWNER_WHATSAPP && (
          <button
            className="about-contact-row"
            onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_OWNER_WHATSAPP}`)}
          >
            <span className="about-contact-label">WhatsApp</span>
            <span className="about-contact-value">{import.meta.env.VITE_OWNER_PHONE}</span>
          </button>
        )}
      </div>

      {/* Преимущества */}
      <p className="about-section-title">Почему мы</p>
      <div className="about-features">
        {[
          { title: 'Проверенные автомобили', desc: 'Каждый автомобиль проходит техническую проверку перед продажей' },
          { title: 'Честная история', desc: 'Предоставляем полную информацию о каждом автомобиле' },
          { title: 'Помощь с документами', desc: 'Помогаем оформить все необходимые документы' },
          { title: 'Трейд-ин', desc: 'Принимаем ваш автомобиль в счёт стоимости нового' },
        ].map((f, i) => (
          <div key={i} className="about-feature">
            <p className="about-feature-title">{f.title}</p>
            <p className="about-feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
