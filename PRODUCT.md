# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Küçük ajans ve ürün ekipleri (yaklaşık 3–15 kişi). Proje yöneticisi veya ekip lideri projeyi açar, üyeleri ekler ve görevleri dağıtır; ekip üyeleri gün içinde panoda görev durumunu, önceliğini ve atanan kişiyi günceller, görevlere yorum yazar. Kullanıcılar işlerini masaüstünde yoğun, mobilde kontrol amaçlı kullanır. Arayüz Türkçedir.

## Product Purpose

Nabız, bir ekibin projelerini ve görevlerini tek yerden planlamasını, yürütmesini ve gerçek zamanlı izlemesini sağlar. Başarı: ekip üyesinin "hangi iş bende, hangi aşamada, ne zaman eklendi" sorusunu tek ekranda yanıtlayabilmesi ve panodaki değişikliğin sayfa yenilemeden herkese yansıması.

## Positioning

Küçük ekipler için kurulum ve süreç yükü olmayan, kanban panosu ile canlı (SignalR) güncellemeyi aynı üründe birleştiren Türkçe görev takibi. Fark, görev değişikliklerinin ve yorumların eş zamanlı olarak tüm ekip üyelerine akmasıdır.

## Operating Context

- Proje oluşturma, e-posta ile üye ekleme ve rol verme (Yönetici / Üye).
- Görevler üç durumda akar: Yapılacak → Devam Ediyor → Tamamlandı.
- Görev önceliği: Düşük / Orta / Yüksek. Görev bir proje üyesine atanabilir.
- Her görevde yorum akışı; kullanıcı kendi yorumunu silebilir.
- SignalR üzerinden görev oluşturma/güncelleme/silme ve yeni yorum anlık bildirilir.
- Oturum JWT ile taşınır; token tarayıcıda saklanır. API .NET 10, veritabanı PostgreSQL.
- Arayüz şu an tek sayfa uygulaması: giriş, kayıt, proje listesi (dashboard), proje detayı (görev panosu + üyeler) ve görev detayı modalı.

## Capabilities and Constraints

- Kimlik doğrulama: kayıt, giriş, çıkış. Şifreler BCrypt ile hashlenir.
- Projeler: oluşturma, listeleme, detay, silme; üye ekleme/çıkarma.
- Görevler: oluşturma, listeleme, güncelleme (başlık, açıklama, durum, öncelik, atanan), silme.
- Yorumlar: ekleme, listeleme, kendi yorumunu silme.
- Canlı güncelleme: SignalR hub (`/hubs/tasks`), proje grubu bazlı.
- API tabanı `/api`, frontend Vite dev sunucusunda proxy ile 8080'e gider.
- Kısıt: mevcut backend sözleşmeleri ve API yolları değişmez; tasarım yalnızca frontend katmanında yapılır.
- Bilinmeyen / karara bağlanmamış: fiyatlandırma, müşteri referansları, dağıtım hedefi, bildirim tercihleri.

## Brand Commitments

- Ürün adı: **Nabız**.
- Dil: tamamen Türkçe; mevcut ürün metinleri korunur.
- Ürün sahibinin bağlayıcı görsel talebi: arayüz **canlı** hissettirmeli ve **animasyon açısından zengin** olmalı; hareket süs değil, ürünün gerçek zamanlı doğasını göstermelidir.
- Doğrulanmamış logo, renk veya tipografi taahhüdü yok; mevcut görsel dünya bağlayıcı değil.

## Evidence on Hand

- Çalışan API ve frontend kodu (`TaskTracker.*`, `client/src`), gerçek CRUD akışları ve SignalR entegrasyonu. `TaskTracker.*` adları geriye dönük uyumluluk için korunur; ürün adı Nabız'dır.
- Kullanıcıya ait gerçek müşteri adı, referans, ekran görüntüsü, logo veya marka görseli yok. Bu tür kanıtlar uydurulmamalıdır.
- Örnek proje/görev verisi üretilebilir; üretilen demo içerik "örnek" olarak işaretlenmelidir.

## Product Principles

1. Pano, ürünün kalbidir: görev durumu ve ekip hareketi tek bakışta okunmalı.
2. Canlılık görünür olmalı: gerçek zamanlı değişim sessizce değil, fark edilir bir hareketle gelir.
3. Az tıkla, çok gör: proje → görev → yorum zinciri bağlam değiştirmeden ilerler.
4. Türkçe ve doğrudan konuş: etiketler ekip dilinde, hata mesajları eyleme dönük.
5. Küçük ekip ölçeğine sadık kal: ağır kurumsal tören yerine hızlı, hafif akışlar.

## Accessibility & Inclusion

Ürün sahibi özel bir standart belirtmedi. Web varsayılanı korunur: klavye ile tam kullanılabilirlik, görünür odak durumları, AA kontrast ve `prefers-reduced-motion` desteği.
