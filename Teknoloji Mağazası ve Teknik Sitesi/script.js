document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM yüklendi, script.js çalışıyor.");

  // --- SABİT KULLANICI LİSTESİ (Bilgilerinizi İlgili Alanlara Kaydederek Sitede Kaydetmiş Olduğunuz Bilgilerinizi Giriniz)---
  const users = [
    { firstname: "İsminizi Giriniz", lastname: "Soyisminizi Giriniz", email: "Mailinizi Giriniz", password: "Şifrenizi Giriniz" }
  ];

  // --- ELEMENT ---
  const loginForm    = document.getElementById('loginForm');     // Giriş formu
  const registerForm = document.getElementById('registerForm');  // Kayıt formu
  const storeLink    = document.getElementById('storeLink');     // "MobiTech Store" linki

  // --- GİRİŞ İŞLEMİ ---
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();  // Sayfayı yeniden yüklemeyi engelle

      // Formdan girilen değerleri okur
      const firstname = document.getElementById('login-firstname').value.trim();
      const lastname  = document.getElementById('login-lastname').value.trim();
      const email     = document.getElementById('login-email').value.trim();
      const password  = document.getElementById('login-password').value.trim();

      // E-posta ve şifre eşleşen kullanıcıyı bulur
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert('Geçersiz e-posta veya şifre. Lütfen tekrar deneyin.');
        return;
      }
      // Ad ve soyadın eşleşme kontrolü
      if (user.firstname !== firstname || user.lastname !== lastname) {
        alert('Ad veya soyad hatalı. Lütfen tekrar deneyin.');
        return;
      }

      // Başarılı giriş
      alert('Başarıyla giriş yaptınız.');
      localStorage.setItem('isLoggedIn', 'true');  // Durumu yerel depoya kaydet

      // Açık modal varsa kapat
      const modalEl = document.getElementById('loginModal');
      let loginModal = bootstrap.Modal.getInstance(modalEl);
      if (!loginModal) loginModal = new bootstrap.Modal(modalEl);
      loginModal.hide();

      // Kullanıcıyı mağaza sayfasına yönlendir
      window.location.href = 'telefon.html';
    });
  }

  // --- KAYIT İŞLEMİ ---
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();  // Yeniden yüklemeyi engelle

      // Formdan girilen değerleri okur
      const firstname = document.getElementById('register-firstname').value.trim();
      const lastname  = document.getElementById('register-lastname').value.trim();
      const email     = document.getElementById('register-email').value.trim();
      const password  = document.getElementById('register-password').value.trim();

      // Boş alan kontrolü
      if (!firstname || !lastname || !email || !password) {
        alert('Lütfen tüm alanları doldurun.');
        return;
      }
      // Aynı e-posta ile kayıtlı mı kontrol eder
      if (users.find(u => u.email === email)) {
        alert('Bu e-posta zaten kayıtlı.');
        return;
      }

      // Yeni kullanıcıyı diziye ekler
      users.push({ firstname, lastname, email, password });
      alert('Başarıyla kayıt oldunuz!');
      registerForm.reset();

      // Açık modal varsa kapat
      const modalEl = document.getElementById('registerModal');
      let registerModal = bootstrap.Modal.getInstance(modalEl);
      if (!registerModal) registerModal = new bootstrap.Modal(modalEl);
      registerModal.hide();
    });
  }

  // --- MOBITECH STORE BUTONU KONTROLÜ ---
  if (storeLink) {
    console.log("storeLink bulundu, eventListener eklenecek.");
    storeLink.addEventListener('click', e => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        e.preventDefault();
        alert('Lütfen önce giriş yapınız!');  // Uyarı ver

        // Giriş modalını aç
        const modalEl = document.getElementById('loginModal');
        let loginModal = bootstrap.Modal.getInstance(modalEl);
        if (!loginModal) loginModal = new bootstrap.Modal(modalEl);
        loginModal.show();
      }
    });
  }
});

// --- SEPET İŞLEMLERİ ---
// Mevcut sepeti yerelden oku, yoksa boş dizi
let sepet = JSON.parse(localStorage.getItem("sepet")) || [];

// Sepet sayısını güncelleyen fonksiyon
function sepetSayisiniGuncelle() {
  const toplamAdet = sepet.reduce((sum, urun) => sum + (urun.adet || 0), 0);
  const sepetSpan = document.getElementById("cart-count");
  if (sepetSpan) sepetSpan.textContent = toplamAdet;
}

// Sepet içeriğini HTML tablosuna yazdıran fonksiyon
function sepetiGoster() {
  const tbody = document.getElementById("sepetItems");
  const toplamSpan = document.getElementById("toplamTutar");
  if (!tbody || !toplamSpan) return;

  tbody.innerHTML = "";
  let genelToplam = 0;

  sepet.forEach((urun, index) => {
    const fiyat = urun.fiyat ?? 0;
    const adet  = urun.adet  ?? 0;
    const toplam = adet * fiyat;
    genelToplam += toplam;

    const satir = document.createElement("tr");
    satir.innerHTML = `
      <td>${urun.ad}</td>
      <td>${adet}</td>
      <td>${fiyat.toLocaleString("tr-TR")}₺</td>
      <td>${toplam.toLocaleString("tr-TR")}₺</td>
      <td>
        <button class="btn btn-danger btn-sm sil-btn" data-index="${index}">
          Sil
        </button>
      </td>
    `;
    tbody.appendChild(satir);
  });

  toplamSpan.textContent = genelToplam.toLocaleString("tr-TR") + "₺";

  // Sil butonlarına tıklanınca ilgili ürünü çıkar
  document.querySelectorAll(".sil-btn").forEach(button => {
    button.addEventListener("click", function () {
      const index = Number(this.getAttribute("data-index"));
      sepet.splice(index, 1);

      // Sepet boşsa yerelden sil, değilse güncelle
      if (sepet.length === 0) {
        localStorage.removeItem("sepet");
      } else {
        localStorage.setItem("sepet", JSON.stringify(sepet));
      }

      sepetiGoster();
      sepetSayisiniGuncelle();
    });
  });
}

// Sepete ürün ekleme fonksiyonu
function sepeteEkle(ad, adet, fiyat) {
  const existingProduct = sepet.find(p => p.ad === ad);
  if (existingProduct) {
    existingProduct.adet += adet;
  } else {
    sepet.push({ ad, adet, fiyat });
  }
  localStorage.setItem("sepet", JSON.stringify(sepet));
  sepetSayisiniGuncelle();
}

// Kart butonuna tıklanma işlevi: sepete ekle + uyarı
function addToCart(productName, productPrice) {
  sepeteEkle(productName, 1, productPrice);
  alert(`${productName} sepete eklendi! Fiyat: ${productPrice.toLocaleString("tr-TR")}₺`);
}

// Sayfa yüklendiğinde sepeti ilk kez göster ve sayıyı güncelle
document.addEventListener("DOMContentLoaded", function () {
  sepetiGoster();
  sepetSayisiniGuncelle();
});

// Sepeti tamamen temizleyen fonksiyon
function sepetiTemizle() {
  sepet = [];
  localStorage.setItem("sepet", JSON.stringify(sepet));
  sepetiGoster();
  sepetSayisiniGuncelle();
}



// localStorage.removeItem('isLoggedIn') Logini Sıfırlar - F12 Konsola Yazılır (allow pasting)

// Kullanıcı Girişi: Kullanıcıların sisteme giriş yapmasını sağlar.

// Kullanıcı Kayıt Olma: Yeni kullanıcıların sisteme kayıt olmasını sağlar.

// Giriş Yapılmadan Erişim Engelleme: "MobiTech Store" butonuna tıklanmadan önce giriş yapılmasını zorunlu kılar.

// LocalStorage Kullanımı: Kullanıcı bilgilerini ve sepet verilerini localStorage'a kaydeder ve okur.

// Sepet Yönetimi: Sepete ürün ekleme, ürün silme ve sepeti görüntüleme.

// Sepet Sayısı Gösterimi: Sepet sayısındaki ürün adedini gösterir.

// Sepet Toplamı: Sepetteki ürünlerin toplam fiyatını hesaplar.

// Sepet Temizleme: Sepetteki tüm ürünleri temizler.

// Sepet Öğesi Silme: Sepet içindeki ürünü silme işlevi.

// Sepete Ürün Ekleme: Ürünün sepete eklenmesi.

// Sepet Detaylarını Gösterme: Sepetteki ürünlerin detaylarını tablo şeklinde gösterir.

// Login Modal Yönetimi: Giriş yapıldığında login modalını kapatır.

// Alert Gösterimi: Giriş yapıldığında veya sepete ürün eklenirken kullanıcıyı bilgilendirir.

// Kullanıcı Bilgileri Doğrulama: Giriş için kullanılan email, şifre ve ad-soyad doğrulaması.