// ============================================================
//  student.js - логиката на ученическата страница (index.html)
// ============================================================

function dateToStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Връща датата, преместена с N работни дни (пропуска събота и неделя)
function addWorkdays(date, days) {
    const result = new Date(date);
    const step = days > 0 ? 1 : -1;
    let remaining = Math.abs(days);
    while (remaining > 0) {
        result.setDate(result.getDate() + step);
        const dow = result.getDay(); // 0=неделя, 6=събота
        if (dow !== 0 && dow !== 6) remaining--;
    }
    return result;
}

// Ако днес е събота или неделя, отиди на най-близкия работен ден
function nearestWorkday(date) {
    const d = new Date(date);
    const dow = d.getDay();
    if (dow === 6) d.setDate(d.getDate() + 2); // събота -> понеделник
    if (dow === 0) d.setDate(d.getDate() + 1); // неделя -> понеделник
    return d;
}

let currentDate = nearestWorkday(new Date());

// Връща масив от активните алергени (lowercase, trimmed)
function getActiveAllergens() {
    const checkboxes = document.querySelectorAll(".allergen-checkbox:checked");
    return Array.from(checkboxes).map(cb => cb.value.toLowerCase().trim());
}

// Проверява дали низ от алергени ("мляко, яйца") съдържа някой от избраните
function hasBlockedAllergen(allergensStr, blocked) {
    if (!allergensStr || blocked.length === 0) return false;
    const itemAllergens = allergensStr.toLowerCase().split(",").map(a => a.trim());
    return blocked.some(b => itemAllergens.some(a => a.includes(b) || b.includes(a)));
}

async function loadMenu(date) {
    const container = document.getElementById("menu-container");

    const dateLocale = getLang() === "en" ? "en-GB" : "bg-BG";
    document.getElementById("menu-date").textContent =
        date.toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });

    const menu = await getMenuForDate(dateToStr(date));

    if (!menu) {
        container.innerHTML = `<div class="alert">${translate("no_menu")}</div>`;
        return;
    }

    renderMenu(menu);
}

function renderMenu(menu) {
    const container = document.getElementById("menu-container");
    const blocked = getActiveAllergens();

    const soupHidden = hasBlockedAllergen(menu.soup?.allergens, blocked);
    const mainHidden = hasBlockedAllergen(menu.mainCourse?.allergens, blocked);
    const dessertHidden = hasBlockedAllergen(menu.dessert?.allergens, blocked);

    // Съхраняваме менюто за повторно рендиране при смяна на филтъра
    container.dataset.menuJson = JSON.stringify(menu);

    const allHidden = soupHidden && mainHidden && dessertHidden;

    const makeItem = (emoji, labelKey, item, hidden) => {
        if (hidden) return `
      <div class="menu-item menu-item--hidden">
        <span class="emoji">🚫</span>
        <div>
          <small>${translate(labelKey)}</small>
          <strong class="allergen-warning">${item?.name ?? translate("none")} — ${translate("allergens")}: ${item?.allergens}</strong>
        </div>
      </div>`;

        return `
      <div class="menu-item">
        <span class="emoji">${emoji}</span>
        <div>
          <small>${translate(labelKey)}</small>
          <strong>${item?.name ?? translate("none")}</strong>
          ${item?.allergens ? `<em>${translate("allergens")}: ${item.allergens}</em>` : ""}
        </div>
      </div>`;
    };

    container.innerHTML = `
    <div class="menu-card">
      ${makeItem("🍲", "label_soup", menu.soup, soupHidden)}
      ${makeItem("🍛", "label_main", menu.mainCourse, mainHidden)}
      ${makeItem("🍰", "label_dessert", menu.dessert, dessertHidden)}
      ${allHidden ? `<p class="allergen-all-warning">⚠️ ${translate("allergen_all_hidden")}</p>` : ""}
      ${menu.notes ? `<p class="notes">ℹ️ ${menu.notes}</p>` : ""}
    </div>`;
}

// При смяна на чекбокс -> просто рендираме пак от кешираното меню
function onAllergenChange() {
    const container = document.getElementById("menu-container");
    const json = container.dataset.menuJson;
    if (json) {
        renderMenu(JSON.parse(json));
    }
}

document.addEventListener("langchange", () => loadMenu(currentDate));
loadMenu(currentDate);

// --- Навигация ---
function changeDay(days) {
    currentDate = addWorkdays(currentDate, days);
    loadMenu(currentDate);
}

document.getElementById("btn-prev").onclick = () => changeDay(-1);
document.getElementById("btn-next").onclick = () => changeDay(+1);
document.getElementById("btn-today").onclick = () => {
    currentDate = nearestWorkday(new Date());
    loadMenu(currentDate);
};

// --- Алергенен филтър ---
document.querySelectorAll(".allergen-checkbox").forEach(cb => {
    cb.addEventListener("change", onAllergenChange);
});
