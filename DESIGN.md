---
name: Nabız — Kesim Atölyesi
description: Küçük ajans ve ürün ekipleri için canlı kanban; kesim atölyesi dünyasında Türkçe görev panosu.
colors:
  paper-kraft: "#d9c7a7"
  paper-tint: "#e7dac3"
  chalk: "#f6f1e7"
  ink: "#14181c"
  ink-soft: "#252b31"
  ink-line: "#3a4148"
  thread: "#a62b20"
  thread-bright: "#c0392b"
  tape: "#e8b54b"
  navy: "#1e3a5f"
  chalk-green: "#2f6b4f"
  muted: "#5d5344"
  muted-ink: "#b3a68f"
  seam: "rgba(20, 24, 28, 0.28)"
  hairline: "rgba(20, 24, 28, 0.18)"
  thread-wash: "rgba(166, 43, 32, 0.1)"
  paper-wash: "rgba(246, 241, 231, 0.3)"
typography:
  display:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.4vw, 44px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Courier Prime, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  xs: "2px"
  base: "3px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "26px"
  xxl: "34px"
components:
  button-primary:
    backgroundColor: "{colors.thread}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.base}"
    padding: "9px 15px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.thread-bright}"
  button-secondary:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "9px 15px"
    typography: "{typography.body}"
  input:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "10px 12px"
    typography: "{typography.body}"
  task-card:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "12px"
  board-column:
    backgroundColor: "{colors.paper-wash}"
    textColor: "{colors.muted}"
    rounded: "{rounded.base}"
    padding: "12px"
  nav-rail:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    padding: "22px 18px"
  badge-priority-high:
    backgroundColor: "{colors.thread-wash}"
    textColor: "{colors.thread}"
    rounded: "{rounded.xs}"
    padding: "3px 8px"
    typography: "{typography.label}"
---

# Design System: Nabız — Kesim Atölyesi

## Overview

**Creative North Star: "Kesim Atölyesi"**

Nabız kâğıt üstünde kurulmuş bir terzi atölyesi gibi davranır: projeler kalıp kâğıdına çizilmiş, görevler kesilmiş parçalar, canlı değişiklikler ise panoya iğnelenmiş kırmızı bir iplik gibi görünür. Arayüz parlak bir SaaS panosu değil; kraft masasının üzerinde duran, mürekkeple işaretlenmiş, kenarları çentikli bir çalışma yüzeyidir.

Palet sıcak ve sınırlıdır. Kırmızı yalnızca hareket, birincil eylem ve silme anlamına gelir; sarı "devam ediyor", lacivert "yapılacak", yeşil "tamamlandı" demektir. Hareket süs değildir: yeni bir parça masaya bırakılır gibi girer, sayılar canlı sayar, dışarıdan gelen değişiklik 12 saniye boyunca kırmızı iplikle işaretli kalır.

**Key Characteristics:**
- Kraft kâğıdı zemin, mürekkep çizgiler, kesme payı hissi veren 1.5px konturlar.
- Kesik köşe çentikleri, dashed dikiş çizgileri, mono ölçü kodları.
- İşlevsel renk: lacivert = yapılacak, sarı = devam ediyor, yeşil = tamamlandı, kırmızı = canlı değişiklik/eylem.
- Kâğıt katmanları arasında tek yumuşak gölge; cam, neon veya sert offset gölge yok.
- Hareket gerçek zamanlı ürünün kanıtı: canlı sayılar, kayan dikiş, iplik nabzı.

## Colors

Sıcak kraft nötrleri ve terzi tebeşiri üzerine kurulu, üç işlevsel renkle konuşan bir palet.

### Primary
- **Kestane İpi** (#a62b20): birincil düğmeler, odak kenarlığı, silme eylemi ve canlı değişiklik işareti. Ekranın en değerli azınlığı.
- **İp Ucu Kırmızısı** (#c0392b): birincil düğme hover'ı, canlı bağlantı noktası ve iplik nabzı.

### Secondary
- **Terzi Tebeşiri Sarısı** (#e8b54b): yalnızca "Devam Ediyor" durumu, orta öncelik ve canlı vurgu tonu.

### Tertiary
- **Deniz Laciverti** (#1e3a5f): "Yapılacak" durumu, düşük öncelik ve sakin avatar tonları.
- **Çam Yeşili** (#2f6b4f): "Tamamlandı" durumu, başarı ve tamamlanmış yaş çubuğu.

### Neutral
- **Kalıp Kraftı** (#d9c7a7): sayfa zemini; noktalı kalıp dokusu bu renk üzerine biner.
- **Kese Kâğıdı** (#e7dac3): ikincil yüzeyler ve sayaç arka planları.
- **Tebeşir Beyazı** (#f6f1e7): kart, input, modal ve rail metni; `--paper-3` ile `--chalk` aynı değeri paylaşır.
- **Mürekkep** (#14181c): metin, 1.5px konturlar, rail zemini.
- **Mürekkep Gölgesi** (#252b31 / #3a4148): ikincil ve üçüncül metin, scrollbar.
- **Kurşun Kalem Grisi** (#5d5344): açıklama ve etiket metni; **Soluk Kurşun** (#b3a68f) koyu zemin üzerindeki ikincil yazı.
- **Dikiş Payı** (`rgba(20,24,28,0.28)`) ve **İnce Çizgi** (`rgba(20,24,28,0.18)`): dashed ayırıcılar ve iç çerçeveler.

**The Red Thread Rule.** Kırmızı dekorasyon değildir. Yalnızca birincil eylem, gerçek zamanlı değişiklik, odak ve yıkıcı eylem için kullanılır; ekranın %10'undan fazlasını kaplamaz.

**The Functional Color Rule.** Durum renkleri sabittir: lacivert yapılacak, sarı devam ediyor, yeşil tamamlandı. Zevke göre renk değiştirilmez; renk körlüğü için her rozet ayrıca metin taşır.

## Typography

**Display Font:** Archivo (Segoe UI, system-ui fallback; değişken genişlik 62–125%)
**Body Font:** Archivo
**Label/Mono Font:** Courier Prime (ui-monospace fallback)

**Character:** Archivo dar omuzlu ve doğrudan; başlıklarda 74–94% genişlikle kesilmiş kâğıt harfler gibi durur. Courier Prime yalnızca ölçü, kod, zaman ve durum etiketi taşır; daktilo kostümü olarak gövde metnine girmez.

### Hierarchy
- **Display** (800, `clamp(30px, 3.4vw, 44px)`, 0.98): sayfa başlıkları; `font-stretch: 80%`, harf aralığı -0.035em.
- **Headline** (800, 22px, 1.1): modal başlığı ve bölüm başlıkları.
- **Title** (750, 14.5px, 1.28): görev kartı başlığı; iki satırda kırpılır.
- **Body** (400, 14px, 1.5): açıklama ve form metni; satır uzunluğu 62–72ch.
- **Label** (700, 9–10px, 0.12em, uppercase): mono etiketler, rozetler, ölçü kodları ve sekme sayıları.

**The Measurement Rule.** Mono yazı yalnızca okunacak veri içindir: görev kodu, sayı, tarih, durum etiketi. Düz metin asla mono olmaz.

**The Stretch Rule.** Başlık genişliği gerçek `font-stretch` ile daraltılır; `scaleX` veya yapay sıkıştırma kullanılmaz.

## Layout

Kabuk, 236px sabit rail ile `minmax(0, 1fr)` içerikten oluşur. İçerik en fazla 1400px genişler, ortalanır ve 30px 34px 56px boşlukla nefes alır. Pano yatayda üç eşit kolondur (18px boşluk); istatistik şeridi üç kolon, proje ızgarası `repeat(auto-fill, minmax(290px, 1fr))` ile 18px boşluk kullanır.

Dikey ritim 4 / 8 / 12 / 18 / 26 / 34px adımlarına dayanır. İlgili öğeler 4–8px, grup içi 12px, gruplar arası 18–26px, bölüm arası 34px boşluk alır. Ayırıcılar solid çizgi değil dashed dikiş payıdır.

Kırılımlar: **1180px** (rail daralır), **980px** (rail üst çubuğa döner, auth tek kolona iner), **760px** (pano ve istatistikler tek kolon, auth hero sıkışır), **560px** (rail etiketleri gizlenir, yalnızca ikon ve durum noktası kalır). Mobilde auth hero dekoratif ama kısa tutulur; giriş formu ilk ekranın içinde başlar.

**The One-Column Rule.** 760px altında pano asla yatay kaydırmaz; kolonlar alt alta akar ve kart genişliği ekranı aşmaz.

## Elevation & Depth

Sistem düz değil, kâğıt katmanlıdır: her yüzey 1.5px mürekkep konturuyla kesilmiş gibi durur ve altında tek, yumuşak bir ortam gölgesi taşır. Gölge yapısal değil, kâğıdın masadan hafifçe kalktığını gösteren fiziksel bir ipucudur. Blur, glassmorphism, neon glow ve sert offset gölge yoktur.

### Shadow Vocabulary
- **Kâğıt dinleniyor** (`0 6px 14px -11px rgba(20,24,28,0.75)`): kartlar, düğmeler ve küçük yüzeyler.
- **Kâğıt kalktı** (`0 16px 32px -22px rgba(20,24,28,0.8)`): hover, sürüklenen hissi veren kartlar.
- **Föy açıldı** (`0 30px 60px -34px rgba(20,24,28,0.85)`): modal ve auth kartı.

**The Cut-Paper Rule.** Her yüzey tek bir kâğıt parçasıdır: bir kontur, bir gölge, bir iç dashed çerçeve. Kart içine kart konmaz; derinlik iç içe yüzeylerle değil, boşluk ve tek gölgeyle kurulur.

## Shapes

Baskın form dili kesilmiş kâğıttır: 3px taban yarıçap, 1.5px solid mürekkep kontur, 5–8px içeride 1px dashed dikiş çerçevesi. Köşelerde V biçimli kesim çentikleri (`clip-path`) ve canlı değişiklikte kartın üstüne tutturulmuş kırmızı kâğıt şerit bulunur. Rozetler 2px, avatarlar daire; bunun dışında pill forma izin verilmez.

Dikiş çizgileri yatay ve dikey akabilir; rail'in sağ kenarında ve pano başlığının altında hareket eden kesikli iplik, ürünün canlı olduğunu sessizce hatırlatır.

## Components

### Buttons
- **Shape:** 3px yarıçap, 1.5px mürekkep kontur, 9px 15px iç boşluk, 13px/700 metin.
- **Primary:** kestane ipi zemin, tebeşir metin; hover'da ip ucu kırmızısı ve 1px yukarı kalkma.
- **Secondary:** tebeşir zemin, mürekkep metin; hover'da `#fbf7ef` ve orta gölge.
- **Ghost / Danger:** ghost kontursuz ve zeminsiz; danger kırmızı kontur, hover'da kırmızı zemin.
- **Focus:** 2px kırmızı outline, 2px offset; klavye odağı her zaman görünür.

### Chips / Badges
- **Style:** Courier Prime 9px/700 uppercase, 1px `currentColor` kontur, 2px yarıçap, önünde 5px renkli nokta.
- **State:** durum ve öncelik rozetleri metin + renk birlikte taşır; yalnızca renge güvenilmez.

### Cards / Containers
- **Corner Style:** 3px; proje ve görev kartlarında kesim çentikleri.
- **Background:** tebeşir beyazı kartlar, `paper-wash` kolonlar, kraft zemin.
- **Shadow Strategy:** Cut-Paper Rule; hover'da bir kademe yukarı.
- **Border:** 1.5px solid mürekkep; içte 5–6px dashed çerçeve.
- **Internal Padding:** 12px görev kartı, 18px proje kartı, 12px board kolonu.

### Inputs / Fields
- **Style:** tebeşir zemin, 1.5px mürekkep kontur, 3px yarıçap, 10px 12px iç boşluk; etiket mono 10px uppercase.
- **Focus:** kırmızı kenarlık + `0 0 0 3px rgba(166,43,32,0.16)` halka.
- **Error:** kırmızı kenarlık ve `role="alert"` banner; disabled %45 opaklık.

### Navigation
- **Style:** 236px koyu mürekkep rail, tebeşir metin, sağ kenarda akan kırmızı dikiş. Aktif bağlantı kırmızı iplik işareti taşır.
- **Mobile:** 980px altında üst yatay çubuk; 560px altında marka metni, canlı etiketi ve kullanıcı adı gizlenir, yalnızca ikonlar ve canlı durum noktası kalır.

### Signature: Live Thread
- Dışarıdan gelen her görev değişikliği kartı doğru kolona taşır, 12 saniye boyunca `.new-thread` şeridi ("YENİ · AZ ÖNCE") ve kırmızı `threadPulse` halkası gösterir.
- Canlı sayaçlar `tabular-nums` ile hedef değere sayar; azalma ve artış aynı ritimde okunur.
- Pano başlığının altındaki dikiş çizgisi sürekli akar; `prefers-reduced-motion` açıksa tüm bu hareketler durur ve işaret statik kalır.

### Modal
- **Shape:** 3px yarıçap, 1.5px mürekkep kontur, 8px iç dashed çerçeve, 24px (geniş föyde 26px) iç boşluk.
- **Depth:** föy gölgesi; arka plan `rgba(20,24,28,0.55)` perde.
- **Behavior:** açılışta odak modala girer, Tab/Shift+Tab odak tuzağında kalır, Esc kapatır; görev föyünde durum/öncelik/atanan seçicileri görünür etiketlidir.

## Do's and Don'ts

### Do:
- **Do** kırmızıyı yalnızca canlı değişim, birincil eylem, odak ve silme için kullan; ekranın %10'unu geçirme.
- **Do** her durumu renk + metin + nokta ile birlikte göster; lacivert/sarı/yeşil eşlemesini koru.
- **Do** kâğıt katmanını tek kontur, tek gölge ve tek iç dashed çerçeveyle kur.
- **Do** canlı değişikliği 12 saniyelik kırmızı iplikle görünür kıl; sayıları hedefe doğru saydır.
- **Do** Türkçe, doğrudan ve eyleme dönük yaz: "Görev eklendi", "Bağlantı kuruluyor", "Bu ayın işleri".
- **Do** 760px altında panoyu tek kolona indir, formu ilk ekranda başlat ve tüm dokunma hedeflerini 36px üstünde tut.
- **Do** `prefers-reduced-motion` açıksa animasyonları durdur, işareti statik bırak.

### Don't:
- **Don't** gradient metin, neon glow, glass blur veya sert offset gölge kullanma.
- **Don't** kart içine kart, 12px üstü yuvarlak köşe veya pill biçimli kart yapma.
- **Don't** Courier Prime'ı gövde metni veya dekorasyon olarak kullanma; yalnızca ölçü/kod/etiket taşısın.
- **Don't** emoji ikon, renkli kalın sol kenarlık veya süs amaçlı sonsuz animasyon ekleme.
- **Don't** olmayan veriyi uydurma: yalnızca gerçek `createdAt`, üye/görev sayısı, durum, öncelik ve yorumlar gösterilir.
- **Don't** durum renklerini zevke göre değiştirme; kırmızıyı "devam ediyor" veya yeşili "yapılacak" için kullanma.
