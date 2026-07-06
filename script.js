// رقم الهاتف الخاص بالواتساب لإرسال تفاصيل الطلب
const WHATSAPP_NUMBER = "9647746495720"; // تهيئة دولية مباشرة للعراق

// المنتجات الافتراضية الأولية للموقع
let initialProducts = [
    {
        id: 1,
        title: "سماد نبوتة الفائق السائل NPK",
        price: 12000,
        img: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=400",
        desc1: "مغذي ومسرع نمو فائق التركيز لجميع النباتات المنزلية.",
        desc2: "تركيبة غنية بالنيتروجين والفوسفور والبوتاسيوم تضمن أوراقاً خضراء زاهية وجذوراً قوية وثابتة. يُخفف 5 مل لكل لتر ماء ويسقى به مرة كل أسبوعين."
    },
    {
        id: 2,
        title: "منشط الجذور الذكي وإحياء التربة",
        price: 15000,
        img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400",
        desc1: "مخصص لإحياء النباتات الذابلة والمتعبة فوراً.",
        desc2: "يعمل على تحفيز وتوسيع الخلايا الجذرية لامتصاص العناصر بشكل مضاعف من التربة ومقاومة الأمراض الفطرية. نتيجته تظهر خلال 5 أيام فقط."
    }
];

// جلب المنتجات والسلة من التخزين المحلي للمتصفح
let products = JSON.parse(localStorage.getItem('naboota_products')) || initialProducts;
let cart = JSON.parse(localStorage.getItem('naboota_cart')) || [];

// تشغيل الأحداث فور تحميل المستند
document.addEventListener("DOMContentLoaded", () => {
    // إخفاء الـ Splash Screen الترحيبية بانسيابية ناعمة
    setTimeout(() => {
        const splash = document.querySelector('.splash-screen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.remove(), 800);
        }
    }, 1500);

    renderProducts();
    updateCartUI();

    // إعداد وتشغيل ميزة الوضع الليلي / النهاري وحفظ الخيار
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        let currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // تفعيل التريجر السري للوحة التحكم (5 ضغطات سريعة على شعار نبوتة)
    setupSecretAdminTrigger();
});

// تحديث أيقونة الوضع الليلي والنهاري
function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if(theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// بناء وعرض بطاقات المنتجات ديناميكياً
function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    products.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <div class="product-img-holder">
                    <img src="${p.img}" alt="${p.title}">
                </div>
                <div class="product-details">
                    <h4>${p.title}</h4>
                    <p class="desc-primary">${p.desc1}</p>
                    <p class="desc-secondary">${p.desc2}</p>
                    <div class="product-footer">
                        <span class="product-price">${p.price.toLocaleString()} د.ع</span>
                        <button class="btn-add-to-cart" onclick="addToCart(${p.id})">إضافة للسلة <i class="fas fa-cart-plus"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
}

// دوال التحكم باللوحات المنبثقة والجانبية
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
}
function toggleCart() {
    document.getElementById('cart-panel').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
}
function closeAllPanels() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('cart-panel').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

function openCheckoutModal() {
    if(cart.length === 0) {
        alert("سلتك فارغة حالياً، أضف بعض المنتجات الرائعة أولاً!");
        return;
    }
    document.getElementById('checkout-modal').classList.add('open');
}
function closeCheckoutModal() { document.getElementById('checkout-modal').classList.remove('open'); }
function closeAdminModal() { document.getElementById('admin-modal').classList.remove('open'); }

// إضافة المنتجات إلى السلة والتأثيرات التفاعلية
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const cartItem = cart.find(item => item.id === id);
    if(cartItem) {
        cartItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveCart();
    updateCartUI();
    
    // أنيميشن تكبير وتصغير خفيف لأيقونة السلة للتفاعل الجمالي
    const cartIcon = document.querySelector('.cart-icon-wrapper');
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
}

// حذف عنصر من سلة المشتريات
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() { localStorage.setItem('naboota_cart', JSON.stringify(cart)); }

// تحديث واجهات السلة وحساب الأسعار التراكمية بالدينار العراقي
function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const countSpan = document.getElementById('cart-count');
    const totalSpan = document.getElementById('cart-total-price');
    
    container.innerHTML = '';
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += (item.price * item.qty);
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.title}">
                <div class="cart-item-details">
                    <h5>${item.title}</h5>
                    <p>${item.qty} × ${item.price.toLocaleString()} د.ع</p>
                </div>
                <button class="btn-remove-item" onclick="removeFromCart(${item.id})"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    });

    countSpan.innerText = totalItems;
    totalSpan.innerText = totalPrice.toLocaleString();
}

// معالجة إتمام الطلب وتوليد الرسالة الكاملة المشفرة للواتساب
function handleCheckout(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const city = document.getElementById('cust-city').value;
    const address = document.getElementById('cust-address').value;

    let total = 0;
    let itemsText = "";
    cart.forEach((item, index) => {
        itemsText += `${index + 1}- ${item.title} (العدد: ${item.qty}) -> بسعر: ${(item.price * item.qty).toLocaleString()} د.ع\n`;
        total += (item.price * item.qty);
    });

    // تجهيز وتنسيق محتوى الرسالة المتكامل ليوصلك على الواتساب فوراً وجاهز
    let message = `🌱 *طلب جديد من متجر نبوتة* 🌱\n\n`;
    message += `👤 *تفاصيل العميل واللوجستيك:* \n`;
    message += `▪️ *الاسم الكامل:* ${name}\n`;
    message += `▪️ *رقم الاتصال:* ${phone}\n`;
    message += `▪️ *المحافظة:* ${city}\n`;
    message += `▪️ *العنوان التفصيلي:* ${address}\n\n`;
    message += `📦 *المنتجات في السلة:* \n${itemsText}\n`;
    message += `💰 *الحساب الإجمالي للطلب:* ${total.toLocaleString()} دينار عراقي\n\n`;
    message += `⚡ _تمت العملية بنجاح عبر بوابة متجر نبوتة الذكية_`;

    let encodedMessage = encodeURIComponent(message);
    let whatsappURL = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;

    // فتح شات الواتساب بالرسالة المجهزة مسبقاً وتصفير السلة محلياً
    window.open(whatsappURL, '_blank');
    cart = [];
    saveCart();
    updateCartUI();
    closeCheckoutModal();
    closeAllPanels();
    document.getElementById('checkout-form').reset();
}

// الوظيفة السرية الذكية لفتح لوحة التحكم (5 نقرات على اللوجو)
function setupSecretAdminTrigger() {
    let clickCount = 0;
    let clickTimeout;
    const logoTrigger = document.getElementById('secret-logo-trigger');

    if (logoTrigger) {
        logoTrigger.addEventListener('click', () => {
            clickCount++;
            
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => {
                clickCount = 0;
            }, 1800); // تصفير العداد التلقائي في حال عدم الإكمال خلال 1.8 ثانية

            if (clickCount === 5) {
                clickCount = 0;
                // فتح مودال الإدارة السري
                document.getElementById('admin-modal').classList.add('open');
                
                // تأثير حركي خفيف على اللوجو عند نجاح تفعيل الشفرة
                logoTrigger.style.transform = 'scale(1.2) rotate(10deg)';
                setTimeout(() => logoTrigger.style.transform = 'scale(1) rotate(0deg)', 300);
            }
        });
    }
}

// إضافة منتج جديد بواسطة المسؤول (تحويل فوري للصورة وقراءة ذكية)
function addNewProduct(e) {
    e.preventDefault();
    const title = document.getElementById('prod-title').value;
    const price = parseInt(document.getElementById('prod-price').value);
    const desc1 = document.getElementById('prod-desc1').value;
    const desc2 = document.getElementById('prod-desc2').value;
    const imgInput = document.getElementById('prod-img');

    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newProd = {
                id: Date.now(),
                title,
                price,
                img: e.target.result, // تحويل ملف الصورة لـ Base64 ليعمل محلياً بدون سيرفر
                desc1,
                desc2
            };
            products.push(newProd);
            localStorage.setItem('naboota_products', JSON.stringify(products));
            renderProducts();
            closeAdminModal();
            document.getElementById('admin-form').reset();
            alert("تم بنجاح إضافة منتجك الجديد ونشره فوراً في واجهة نبوتة! 🎉");
        }
        reader.readAsDataURL(imgInput.files[0]);
    }
}