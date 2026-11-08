import { DEMO_MODE } from '../demo/bus'
import { Icon, Modal } from './ui'

const steps = [
  {
    title: 'Projelerden birini aç',
    text: 'Her proje ayrı bir pano. Proje kartına tıklayarak görevleri ve ekibi gör.',
  },
  {
    title: 'Yeni görev ekle',
    text: 'Başlık, öncelik ve atanan kişiyi seç; kart doğrudan panoya düşsün.',
  },
  {
    title: 'Kartı aç, ilerlet',
    text: 'Karta tıkla; durumu Yapılacak → Devam Ediyor → Tamamlandı olarak değiştir, yorum ekle.',
  },
  {
    title: 'Ekibi davet et',
    text: 'Üyeler sekmesinden e-posta ile arkadaşını ekle; yönetici veya üye rolü ver.',
  },
]

export function HowToModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="Nasıl kullanılır?"
      kicker={DEMO_MODE ? 'Demo · 4 adım' : 'Hızlı başlangıç'}
      onClose={onClose}
    >
      <ol className="howto-list">
        {steps.map((step, index) => (
          <li className="howto-step" key={step.title}>
            <span className="howto-num" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <b>{step.title}</b>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="howto-note">
        <Icon name="info" size={15} />
        <p>
          {DEMO_MODE
            ? 'Bu bir demo: veriler tarayıcında saklanır, canlı akış simüle edilir. Baştan başlamak için “Demoyu sıfırla”yı kullan.'
            : 'Değişiklikler SignalR ile ekibine anında yansır; sayfayı yenilemen gerekmez.'}
        </p>
      </div>

      <div className="modal-actions">
        <button className="btn btn-primary" type="button" onClick={onClose}>
          Anladım
        </button>
      </div>
    </Modal>
  )
}
