// ============================================================
//  api.js - ВСИЧКИ заявки към сървъра са събрани ТУК.
//  Така не повтаряме код и е лесно за дебъгване.
//
//  Всяка функция ползва fetch() - вградената функция на браузъра
//  за HTTP заявки - и връща данните като JavaScript обект.
//
//  Правило: щом функцията има "await" вътре, отпред пише "async".
// ============================================================

const API_BASE = "/api";

// ---------------- ВХОД / ИЗХОД (готови) ----------------

// Опит за вход. Връща { username, role, displayName } или хвърля грешка.
async function login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // казваме: пращаме JSON
        body: JSON.stringify({ username, password }),    // JS обект -> JSON текст
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Грешка при вход");
    }
    return await res.json();
}

// Изход - сървърът изтрива бисквитката
async function logout() {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
}

// Кой е влязъл в момента? Връща { username, role } или null.
async function getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) return null;   // 401 = никой не е влязъл
    return await res.json();
}

// ---------------- МЕНЮ (готови примери) ----------------

// ЧЕТЕНЕ: менюто за дата (dateStr = "2026-07-07").
// Връща обект меню или null, ако още не е въведено (404).
async function getMenuForDate(dateStr) {
    const res = await fetch(`${API_BASE}/menu?date=${dateStr}`);
    if (res.status === 404) return null;   // няма меню за тази дата - това НЕ е грешка
    if (!res.ok) throw new Error("Грешка при зареждане на менюто");
    return await res.json();
}

// ЗАПИС: ново дневно меню (само кухнята).
// menuData = { date: "2026-07-08", soupId: 1, mainCourseId: 4, dessertId: 7, notes: "" }
async function postMenu(menuData) {
    const res = await fetch(`${API_BASE}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuData),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Неуспешно запазване");
    }
    return await res.json();
}

// ЧЕТЕНЕ: всички ястия (за падащите менюта в админ панела)
async function getMenuItems() {
    const res = await fetch(`${API_BASE}/menuitems`);
    if (!res.ok) throw new Error("Грешка при зареждане на ястията");
    return await res.json();
}

// ЗАПИС: ново ястие (само кухнята)
async function postMenuItem(item) {
    const res = await fetch(`${API_BASE}/menuitems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Неуспешно добавяне на ястие");
    }
    return await res.json();
}

// ЗАДАЧА 3: РЕДАКЦИЯ на меню (само кухнята)
async function putMenu(id, menuData) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuData),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Неуспешно редактиране");
    }
    return await res.json();
}

// ЗАДАЧА 4: ИЗТРИВАНЕ на меню (само кухнята)
async function deleteMenu(id) {
    const res = await fetch(`${API_BASE}/menu/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Неуспешно изтриване");
    }
    return await res.json();
}

// ИЗТРИВАНЕ на ястие (само кухнята)
async function deleteMenuItem(id) {
    const res = await fetch(`${API_BASE}/menuitems/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Неуспешно изтриване на ястие");
    }
    return await res.json();
}

// ЗАДАЧА 5: СЕДМИЧНО МЕНЮ (fromStr = "2026-07-06")
async function getWeek(fromStr) {
    const res = await fetch(`${API_BASE}/menu/week?from=${fromStr}`);
    if (!res.ok) throw new Error("Грешка при зареждане на седмичното меню");
    return await res.json();
}

// ============================================================
//  ЕЗИК (БГ / EN) + ТЪМЕН РЕЖИМ
//  Всичко е тук, за да не се плодят допълнителни файлове -
//  api.js се зарежда на всяка страница, така че е удобно място.
// ============================================================

const DICT = {
    bg: {
        app_title: "🍽️ Дневно меню",
        kitchen_login: "Вход за кухнята",
        loading: "Зареждане...",
        nav_prev: "← Вчера",
        nav_today: "Днес",
        nav_next: "Утре →",
        no_menu: "Менюто за този ден все още не е публикувано. Провери по-късно!",
        label_soup: "Супа",
        label_main: "Основно",
        label_dessert: "Десерт",
        allergens: "алергени",
        none: "Няма",

        kitchen_title: "👩‍🍳 Кухня — админ панел",
        logout: "Изход",
        dishes_title: "Ястия",
        add_dish_title: "Добави ново ястие",
        ph_dish_name: "Име, напр. Леща чорба",
        ph_allergens: "Алергени, напр. глутен, мляко (по желание)",
        type_soup: "🍲 Супа",
        type_main: "🍛 Основно",
        type_dessert: "🍰 Десерт",
        btn_add_dish: "Добави ястие",
        daily_menu_title: "Дневно меню",
        ph_notes: "Бележки (по желание)",
        btn_publish: "Публикувай",
        menu_published: "Менюто е публикувано успешно!",
        menu_updated: "Менюто беше обновено (вече имаше меню за тази дата)!",
        need_dishes_first: "Първо добави поне по едно ястие от всеки вид (супа, основно, десерт) - падащите менюта са празни.",

        // Алергенен филтър
        allergen_filter_title: "Филтър по алергени",
        allergen_filter_hint: "Отметни алергените, към които си чувствителен — ястията с тях ще изчезнат от менюто.",
        allergen_milk: "Мляко",
        allergen_eggs: "Яйца",
        allergen_gluten: "Глутен",
        allergen_celery: "Целина",
        allergen_nuts: "Ядки",
        allergen_soy: "Соя",
        allergen_fish: "Риба",
        allergen_all_hidden: "Всички ястия за деня съдържат избраните алергени.",

        // Изтриване на ястие
        confirm_delete_item: "Сигурни ли сте, че искате да премахнете това ястие?",
        confirm_delete_btn: "Да, премахни",
        cancel_btn: "Откажи",
        item_deleted: "Ястието беше премахнато успешно.",

        login_title: "🔐 Вход",
        login_hint: "Тестови акаунти: kitchen / kitchen123 · student / student123",
        ph_username: "Потребителско име",
        ph_password: "Парола",
        btn_login: "Влез",
        back_to_menu: "← Обратно към менюто",
    },
    en: {
        app_title: "🍽️ Daily Menu",
        kitchen_login: "Kitchen login",
        loading: "Loading...",
        nav_prev: "← Yesterday",
        nav_today: "Today",
        nav_next: "Tomorrow →",
        no_menu: "The menu for this day hasn't been published yet. Check back later!",
        label_soup: "Soup",
        label_main: "Main",
        label_dessert: "Dessert",
        allergens: "allergens",
        none: "None",

        kitchen_title: "👩‍🍳 Kitchen — admin panel",
        logout: "Log out",
        dishes_title: "Dishes",
        add_dish_title: "Add a new dish",
        ph_dish_name: "Name, e.g. Lentil soup",
        ph_allergens: "Allergens, e.g. gluten, dairy (optional)",
        type_soup: "🍲 Soup",
        type_main: "🍛 Main",
        type_dessert: "🍰 Dessert",
        btn_add_dish: "Add dish",
        daily_menu_title: "Daily menu",
        ph_notes: "Notes (optional)",
        btn_publish: "Publish",
        menu_published: "Menu published successfully!",
        menu_updated: "Menu updated (there was already one for this date)!",
        need_dishes_first: "Add at least one dish of each kind first (soup, main, dessert) - the dropdowns are empty.",

        // Allergen filter
        allergen_filter_title: "Allergen filter",
        allergen_filter_hint: "Check the allergens you are sensitive to — dishes containing them will be hidden.",
        allergen_milk: "Milk",
        allergen_eggs: "Eggs",
        allergen_gluten: "Gluten",
        allergen_celery: "Celery",
        allergen_nuts: "Nuts",
        allergen_soy: "Soy",
        allergen_fish: "Fish",
        allergen_all_hidden: "All dishes for today contain the selected allergens.",

        // Delete dish
        confirm_delete_item: "Are you sure you want to remove this dish?",
        confirm_delete_btn: "Yes, remove",
        cancel_btn: "Cancel",
        item_deleted: "The dish was removed successfully.",

        login_title: "🔐 Log in",
        login_hint: "Test accounts: kitchen / kitchen123 · student / student123",
        ph_username: "Username",
        ph_password: "Password",
        btn_login: "Log in",
        back_to_menu: "← Back to menu",
    },
};

// --- Език ---
function getLang() {
    return localStorage.getItem("lang") || "bg";
}

// Ползва се за динамичен текст в student.js / admin.js, напр. translate("no_menu")
function translate(key) {
    const lang = getLang();
    return (DICT[lang] && DICT[lang][key]) || DICT.bg[key] || key;
}

function applyTranslations() {
    const lang = getLang();
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        el.textContent = translate(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        el.placeholder = translate(el.getAttribute("data-i18n-placeholder"));
    });

    const btn = document.getElementById("btn-lang");
    if (btn) btn.textContent = lang === "bg" ? "EN" : "БГ";

    // казва на страницата, че езикът се е сменил (за динамичните части -
    // датата и картата с менюто в student.js, списъка с ястия в admin.js)
    document.dispatchEvent(new CustomEvent("langchange"));
}

function toggleLang() {
    localStorage.setItem("lang", getLang() === "bg" ? "en" : "bg");
    applyTranslations();
}

// --- Тъмен / светъл режим ---
function getTheme() {
    return localStorage.getItem("theme") || "dark";
}

function applyTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("btn-theme");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
    localStorage.setItem("theme", getTheme() === "dark" ? "light" : "dark");
    applyTheme();
}

// Прилагаме темата веднага (преди DOMContentLoaded), за да няма
// проблясване на грешната тема при първо зареждане.
applyTheme();

document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
    const langBtn = document.getElementById("btn-lang");
    if (langBtn) langBtn.addEventListener("click", toggleLang);
    const themeBtn = document.getElementById("btn-theme");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
});
