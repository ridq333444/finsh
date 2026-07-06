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

document.addEventListener("DOMContentLoaded", () => {
    // إخفاء الـ Splash Screen الترحيبية
    setTimeout(() => {
        const splash = document.querySelector('.splash-screen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.remove(), 800);
        }
    }, 1500);

    renderProducts();
    updateCartUI();

    // تشغيل ميزة الوضع الليلي / النهاري
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

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// بناء وعرض بطاقات المنتجات في الواجهة الرئيسية للزبون
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

// رندرة لستة المنتجات الإدارية المخصصة للمسؤول (التعديل والحذف)
function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    list.innerHTML = '';
    products.forEach(p => {
        list.innerHTML += `
            <div class="admin-prod-item">
                <div class="admin-prod-info">
                    <img src="${p.img}" alt="">
                    <span>${p.title} (${p.price.toLocaleString()} د.ع)</span>
                </div>
                <div class="admin-prod-actions">
                    <button class="btn-edit-inline" onclick="prepareEditProduct(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete-inline" onclick="deleteProduct(${p.id})"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
}

// دوال التحكم باللوحات
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
    if(cart.length === 0) { alert("سلتك فارغة حالياً!"); return; }
    document.getElementById('checkout-modal').classList.add('open');
}
function closeCheckoutModal() { document.getElementById('checkout-modal').classList.remove('open'); }

function openAdminModal() {
    document.getElementById('admin-modal').classList.add('open');
    resetAdminForm();
    renderAdminProducts(); // تحديث لستة المنتجات في اللوحة الإدارية فوراً عند الفتح
}
function closeAdminModal() { document.getElementById('admin-modal').classList.remove('open'); }

// إضافة المنتجات إلى السلة
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const cartItem = cart.find(item => item.id === id);
    if(cartItem) { cartItem.qty += 1; } else { cart.push({ ...product, qty: 1 }); }
    saveCart();
    updateCartUI();
    const cartIcon = document.querySelector('.cart-icon-wrapper');
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() { localStorage.setItem('naboota_cart', JSON.stringify(cart)); }

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const countSpan = document.getElementById('cart-count');
    const totalSpan = document.getElementById('cart-total-price');
    container.innerHTML = '';
    let totalItems = 0, totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += (item.price * item.qty);
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.img}" alt="">
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

// إرسال الطلب عبر الواتساب
function handleCheckout(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const city = document.getElementById('cust-city').value;
    const address = document.getElementById('cust-address').value;

    let total = 0, itemsText = "";
    cart.forEach((item, index) => {
        itemsText += `${index + 1}- ${item.title} (العدد: ${item.qty}) -> بسعر: ${(item.price * item.qty).toLocaleString()} د.ع\n`;
        total += (item.price * item.qty);
    });

    let message = `🌱 *طلب جديد من متجر نبوتة* 🌱\n\n👤 *تفاصيل العميل:* \n▪️ *الاسم:* ${name}\n▪️ *الهاتف:* ${phone}\n▪️ *المحافظة:* ${city}\n▪️ *العنوان:* ${address}\n\n📦 *المنتجات:* \n${itemsText}\n💰 *الإجمالي:* ${total.toLocaleString()} د.ع`;
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`, '_blank');
    
    cart = []; saveCart(); updateCartUI(); closeCheckoutModal(); closeAllPanels();
    document.getElementById('checkout-form').reset();
}

// الوظيفة السرية بـ 5 ضغطات لفتح لوحة الإدارة
function setupSecretAdminTrigger() {
    let clickCount = 0; let clickTimeout;
    const logoTrigger = document.getElementById('secret-logo-trigger');
    if (logoTrigger) {
        logoTrigger.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => { clickCount = 0; }, 1800);
            if (clickCount === 5) {
                clickCount = 0;
                openAdminModal();
                logoTrigger.style.transform = 'scale(1.2) rotate(10deg)';
                setTimeout(() => logoTrigger.style.transform = 'scale(1) rotate(0deg)', 300);
            }
        });
    }
}

// [جديد] حذف منتج نهائياً
function deleteProduct(id) {
    if(confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من المتجر؟")) {
        products = products.filter(p => p.id !== id);
        // أيضاً نقوم بحذفه من السلة في حال كان الزبون قد أضافه قبل الحذف
        cart = cart.filter(item => item.id !== id);
        saveProductsAndRefresh();
    }
}

// [جديد] سحب بيانات منتج للفورم لتعديله
function prepareEditProduct(id) {
    const p = products.find(prod => prod.id === id);
    if(!p) return;

    document.getElementById('edit-prod-id').value = p.id;
    document.getElementById('prod-title').value = p.title;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-desc1').value = p.desc1;
    document.getElementById('prod-desc2').value = p.desc2;
    
    // تغيير نصوص اللوحة للإشارة إلى وضع التعديل
    document.getElementById('admin-modal-title').innerText = "لوحة التحكم | تعديل منتج قائم";
    document.getElementById('btn-admin-submit').innerHTML = "حفظ التعديلات الحالية <i class='fas fa-save'></i>";
    document.getElementById('btn-cancel-edit').style.display = "inline-block";
    document.getElementById('prod-img').required = false; // عند التعديل الصورة غير إجبارية

    // الصعود للأعلى بداخل المودال لرؤية الفورم
    document.querySelector('.admin-modal-content').scrollTop = 0;
}

// [جديد] تصفير وإعادة وضع الفورم للوضع الافتراضي (إضافة)
function resetAdminForm() {
    document.getElementById('edit-prod-id').value = "";
    document.getElementById('admin-form').reset();
    document.getElementById('admin-modal-title').innerText = "لوحة التحكم الإدارية | إضافة منتج";
    document.getElementById('btn-admin-submit').innerHTML = "نشر المنتج فوراً بالمتجر <i class='fas fa-plus'></i>";
    document.getElementById('btn-cancel-edit').style.display = "none";
    document.getElementById('prod-img').required = true;
}

// [محدث] حفظ البيانات سواء كانت إضافة جديدة أو تعديل لمنتج سابق
function saveProductForm(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-prod-id').value;
    const title = document.getElementById('prod-title').value;
    const price = parseInt(document.getElementById('prod-price').value);
    const desc1 = document.getElementById('prod-desc1').value;
    const desc2 = document.getElementById('prod-desc2').value;
    const imgInput = document.getElementById('prod-img');

    const executeSave = (imgUrl) => {
        if(editId) {
            // وضع التعديل
            const prodIndex = products.findIndex(p => p.id == editId);
            if(prodIndex !== -1) {
                products[prodIndex].title = title;
                products[prodIndex].price = price;
                products[prodIndex].desc1 = desc1;
                products[prodIndex].desc2 = desc2;
                if(imgUrl) products[prodIndex].img = imgUrl; // تحديث الصورة فقط لو ارفع وحدة جديدة
            }
            alert("تم تعديل المنتج بنجاح! 🎉");
        } else {
            // وضع الإضافة الجديدة
            const newProd = { id: Date.now(), title, price, img: imgUrl, desc1, desc2 };
            products.push(newProd);
            alert("تم إضافة المنتج بنجاح! 🎉");
        }
        saveProductsAndRefresh();
        resetAdminForm();
    };

    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) { executeSave(e.target.result); }
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        // إذا كنا نعدل وما رفعنا صورة جديدة، نمرر فارغ للاحتفاظ بالقديمة
        if(editId) { executeSave(null); } else { alert("يرجى اختيار صورة للمنتج أولاً!"); }
    }
}

// دالة الحفظ الموحدة للـ LocalStorage وتحديث الواجهات
function saveProductsAndRefresh() {
    localStorage.setItem('naboota_products', JSON.stringify(products));
    renderProducts();      // تحديث واجهة المتجر للزبائن
    renderAdminProducts(); // تحديث لستة التحكم للإدارة
    saveCart(); updateCartUI();
}
