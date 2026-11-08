import { TaskItemStatus, TaskPriority } from '../types'
import type { CommentDto, ProjectRole, TaskItemDto } from '../types'

export const SEED_VERSION = 1

export interface DemoUser {
  id: string
  username: string
  email: string
  password: string
}

export interface DemoProjectMember {
  userId: string
  role: ProjectRole
}

export interface DemoProject {
  id: string
  name: string
  description: string | null
  createdAt: string
  ownerId: string
  members: DemoProjectMember[]
}

export interface DemoState {
  version: number
  users: DemoUser[]
  projects: DemoProject[]
  tasks: TaskItemDto[]
  comments: Record<string, CommentDto[]>
}

export function createSeedState(): DemoState {
  const now = Date.now()
  const ago = (days: number, hours = 0) =>
    new Date(now - days * 86_400_000 - hours * 3_600_000).toISOString()

  const users: DemoUser[] = [
    { id: 'u001', username: 'Eren', email: 'eren@demo.nabiz.app', password: 'demo1234' },
    { id: 'u002', username: 'Seda', email: 'seda@demo.nabiz.app', password: 'demo1234' },
    { id: 'u003', username: 'Mert', email: 'mert@demo.nabiz.app', password: 'demo1234' },
    { id: 'u004', username: 'Ayşe', email: 'ayse@demo.nabiz.app', password: 'demo1234' },
  ]

  const projects: DemoProject[] = [
    {
      id: 'p001',
      name: 'Yeni Sezon Lansmanı',
      description: 'Sonbahar koleksiyonu için kampanya, sosyal medya ve e-ticaret lansmanı.',
      createdAt: ago(12, 3),
      ownerId: 'u001',
      members: [
        { userId: 'u001', role: 'Admin' },
        { userId: 'u002', role: 'Admin' },
        { userId: 'u003', role: 'Member' },
        { userId: 'u004', role: 'Member' },
      ],
    },
    {
      id: 'p002',
      name: 'Mobil Uygulama 2.0',
      description: 'iOS ve Android için yeni sürüm: onboarding, bildirimler ve performans.',
      createdAt: ago(26, 5),
      ownerId: 'u002',
      members: [
        { userId: 'u002', role: 'Admin' },
        { userId: 'u001', role: 'Member' },
        { userId: 'u003', role: 'Member' },
      ],
    },
    {
      id: 'p003',
      name: 'Marka Yenileme',
      description: 'Yeni kimlik, marka tonu ve web sitesi geçiş planı.',
      createdAt: ago(40, 2),
      ownerId: 'u001',
      members: [
        { userId: 'u001', role: 'Admin' },
        { userId: 'u004', role: 'Admin' },
        { userId: 'u003', role: 'Member' },
      ],
    },
  ]

  const task = (
    id: string,
    projectId: string,
    title: string,
    status: TaskItemStatus,
    priority: TaskPriority,
    assigneeId: string | null,
    createdById: string,
    createdAt: string,
    description: string | null = null,
    updatedAt = createdAt,
  ): TaskItemDto => {
    const assignee = users.find((user) => user.id === assigneeId)
    const creator = users.find((user) => user.id === createdById) ?? users[0]
    return {
      id,
      title,
      description,
      status,
      priority,
      createdAt,
      updatedAt,
      projectId,
      assigneeId,
      assigneeName: assignee?.username ?? null,
      createdById: creator.id,
      createdByName: creator.username,
      commentCount: 0,
    }
  }

  const tasks: TaskItemDto[] = [
    task('t101', 'p001', 'Lansman takvimini kilitle', TaskItemStatus.Done, TaskPriority.High, 'u001', 'u002', ago(11, 3), 'Hafta hafta içerik, yayın ve onay takvimi.'),
    task('t102', 'p001', 'Ana sayfa kahraman görseli', TaskItemStatus.InProgress, TaskPriority.High, 'u002', 'u001', ago(10, 5), 'Yeni sezon kapak kompozisyonu; üç varyasyon.'),
    task('t103', 'p001', 'Sosyal medya seti · 9 kare', TaskItemStatus.InProgress, TaskPriority.Medium, 'u004', 'u002', ago(9, 2), 'Instagram grid için 9 karelik lansman seti.'),
    task('t104', 'p001', 'E-posta bülteni metni', TaskItemStatus.ToDo, TaskPriority.Medium, 'u003', 'u001', ago(8, 4), 'Lansman sabahı gönderilecek bültenin metni.'),
    task('t105', 'p001', 'Ürün detay sayfası şablonu', TaskItemStatus.InProgress, TaskPriority.High, 'u001', 'u002', ago(8, 1), 'Yeni ürün detay sayfasının mobil ve masaüstü şablonu.'),
    task('t106', 'p001', 'Video altyazıları', TaskItemStatus.ToDo, TaskPriority.Low, 'u004', 'u003', ago(7, 6), 'Tanıtım videosunun Türkçe ve İngilizce altyazıları.'),
    task('t107', 'p001', 'Influencer listesi', TaskItemStatus.Done, TaskPriority.Medium, 'u003', 'u002', ago(7, 2), 'İlk dalga için 20 isim ve iletişim durumu.'),
    task('t108', 'p001', 'Sepet akışı QA', TaskItemStatus.ToDo, TaskPriority.High, 'u002', 'u001', ago(6, 5), 'Mobil sepet ve ödeme adımlarının son kontrolü.'),
    task('t109', 'p001', 'Lansman gecesi runbook', TaskItemStatus.InProgress, TaskPriority.Medium, 'u001', 'u001', ago(5, 3), 'Lansman gecesi saat saat yapılacaklar ve sorumlular.'),
    task('t110', 'p001', 'Basın bülteni', TaskItemStatus.Done, TaskPriority.Low, 'u003', 'u002', ago(4, 6), 'Basın için kısa ürün ve marka hikâyesi.'),
    task('t111', 'p001', 'Kampanya görsel dili', TaskItemStatus.Done, TaskPriority.High, 'u004', 'u001', ago(3, 4), 'Renk, tipografi ve fotoğraf dili kararları.'),
    task('t112', 'p001', 'Ölçüm planı', TaskItemStatus.ToDo, TaskPriority.Medium, 'u002', 'u001', ago(2, 2), 'Lansman sonrası ilk iki hafta için ölçüm planı.'),

    task('t201', 'p002', 'Onboarding akışı', TaskItemStatus.InProgress, TaskPriority.High, 'u002', 'u002', ago(20, 4), 'İlk açılışta üç adımlı tanıtım akışı.'),
    task('t202', 'p002', 'Bildirim izinleri', TaskItemStatus.ToDo, TaskPriority.Medium, 'u003', 'u002', ago(18, 2), 'Push ve e-posta izinlerinin yeni akışı.'),
    task('t203', 'p002', 'Ana ekran performansı', TaskItemStatus.InProgress, TaskPriority.High, 'u001', 'u002', ago(16, 5), 'İlk yükleme ve liste kaydırma ölçümleri.'),
    task('t204', 'p002', 'Karanlık mod', TaskItemStatus.ToDo, TaskPriority.Low, 'u003', 'u001', ago(14, 3), 'Sistem temasına uyan renk tokenları.'),
    task('t205', 'p002', 'Sürüm notları', TaskItemStatus.Done, TaskPriority.Low, 'u002', 'u002', ago(12, 6), '2.0 sürümünün kısa ve net özeti.'),
    task('t206', 'p002', 'Beta davet metni', TaskItemStatus.Done, TaskPriority.Medium, 'u001', 'u003', ago(10, 2), 'Beta kullanıcıları için davet e-postası.'),
    task('t207', 'p002', 'Crashlytics panosu', TaskItemStatus.ToDo, TaskPriority.Medium, 'u003', 'u001', ago(8, 4), 'Hata oranı ve etkilenen sürümlerin takibi.'),
    task('t208', 'p002', 'App Store ekran görüntüleri', TaskItemStatus.InProgress, TaskPriority.Medium, 'u002', 'u002', ago(6, 1), 'Altı ekran için yeni mağaza görselleri.'),

    task('t301', 'p003', 'Yeni logo kilidi', TaskItemStatus.Done, TaskPriority.High, 'u001', 'u001', ago(35, 2), 'Yatay ve dikey kullanım için son kilit.'),
    task('t302', 'p003', 'Renk ve tipografi tokenları', TaskItemStatus.InProgress, TaskPriority.High, 'u004', 'u001', ago(30, 4), 'Web ve sunum için ortak token seti.'),
    task('t303', 'p003', 'Web sitesi geçiş planı', TaskItemStatus.ToDo, TaskPriority.Medium, 'u001', 'u004', ago(25, 3), 'Eski sayfalardan yeni yapıya geçiş sırası.'),
    task('t304', 'p003', 'Marka tonu rehberi', TaskItemStatus.InProgress, TaskPriority.Medium, 'u003', 'u004', ago(20, 5), 'Örnek cümleler, yasaklı kelimeler ve ton.'),
    task('t305', 'p003', 'Sunum şablonu', TaskItemStatus.Done, TaskPriority.Low, 'u004', 'u003', ago(15, 2), 'Satış ve yatırımcı sunumu için 12 slayt.'),
    task('t306', 'p003', 'Müşteri geri bildirimi', TaskItemStatus.ToDo, TaskPriority.Low, 'u001', 'u004', ago(10, 1), 'İlk tur geri bildirimlerin tek listede toplanması.'),
  ]

  const comments: Record<string, CommentDto[]> = {
    t103: [
      {
        id: 'c001',
        content: 'İkinci karede ürün adı çok küçük kaldı, büyütelim.',
        createdAt: ago(0, 3),
        userId: 'u002',
        username: 'Seda',
      },
      {
        id: 'c002',
        content: 'Yeni versiyonu birazdan yüklüyorum.',
        createdAt: ago(0, 1),
        userId: 'u004',
        username: 'Ayşe',
      },
    ],
    t102: [
      {
        id: 'c003',
        content: 'B varyasyonu daha güçlü, onunla devam edelim.',
        createdAt: ago(0, 4),
        userId: 'u001',
        username: 'Eren',
      },
    ],
    t201: [
      {
        id: 'c004',
        content: 'Üçüncü adımdaki metin çok uzun, kısaltıyorum.',
        createdAt: ago(1, 2),
        userId: 'u003',
        username: 'Mert',
      },
    ],
    t304: [
      {
        id: 'c005',
        content: 'Örnek cümleleri ve yasaklı kelimeleri ekledim.',
        createdAt: ago(0, 5),
        userId: 'u004',
        username: 'Ayşe',
      },
    ],
    t108: [
      {
        id: 'c006',
        content: 'Ödeme adımında tekrar eden bir hata var, bakabilir misin?',
        createdAt: ago(0, 2),
        userId: 'u002',
        username: 'Seda',
      },
    ],
  }

  for (const item of tasks) {
    item.commentCount = comments[item.id]?.length ?? 0
  }

  return {
    version: SEED_VERSION,
    users,
    projects,
    tasks,
    comments,
  }
}
