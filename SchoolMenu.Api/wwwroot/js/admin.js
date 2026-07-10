// ============================================================
//  admin.js - страницата на кухнята (admin.html)
// ============================================================

// --- "Пазач": само кухнята има достъп ---
async function guard() {
    const user = await getCurrentUser();
    if (!user || user.role !== "kitchen") {
        window.location.href = "login.html";
        return null;
    }
    document.getElementById("who").textContent = user.username;
    return user;
}

// --- Зарежда и показва списъка с ястия ---
async function loadItems() {
    const items = await getMenuItems();
    const typeName = {
        soup: translate("type_soup"),
        main: translate("type_main"),
        dessert: translate("type_dessert"),
    };

    document.getElementById("items-list").innerHTML = items
        .map(i => `
      <li>
        <span>
          ${i.name}
          <span class="tag">${typeName[i.type] ?? i.type}</span>
          ${i.allergens ? `<span class="allergen-tag">⚠️ ${i.allergens}</span>` : ""}
        </span>
        <button class="btn-delete-item"
                data-id="${i.id}"
                data-name="${i.name}"
                title="${translate("confirm_delete_item")}">🗑️</button>
      </li>`)
        .join("");

    document.querySelectorAll(".btn-delete-item").forEach(btn => {
        btn.addEventListener("click", () =>
            confirmDeleteItem(Number(btn.dataset.id), btn.dataset.name)
        );
    });
}

// --- Модален диалог за потвърждение при изтриване ---
function confirmDeleteItem(id, name) {
    const modal = document.getElementById("delete-modal");
    const modalMsg = document.getElementById("delete-modal-msg");

    modalMsg.textContent = `„${name}" — ${translate("confirm_delete_item")}`;
    modal.classList.add("modal--visible");

    document.getElementById("btn-confirm-delete").onclick = async () => {
        modal.classList.remove("modal--visible");
        try {
            await deleteMenuItem(id);
            await loadItems();
            await loadMenuItemOptions();
        } catch (err) {
            alert(err.message);
        }
    };

    document.getElementById("btn-cancel-delete").onclick = () => {
        modal.classList.remove("modal--visible");
    };
}

// --- Добавяне на ново ястие ---
document.getElementById("item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        await postMenuItem({
            name: document.getElementById("item-name").value,
            type: document.getElementById("item-type").value,
            allergens: document.getElementById("item-allergens").value || null,
        });
        document.getElementById("item-form").reset();
        await loadItems();
        await loadMenuItemOptions();
    } catch (err) {
        alert(err.message);
    }
});

// --- Напълва трите <select> с ястия от базата ---
async function loadMenuItemOptions() {
    const items = await getMenuItems();
    const fill = (selectId, type) => {
        const filtered = items.filter(i => i.type === type);
        document.getElementById(selectId).innerHTML = filtered
            .map(i => `<option value="${i.id}">${i.name}</option>`)
            .join("");
    };
    fill("select-soup", "soup");
    fill("select-main", "main");
    fill("select-dessert", "dessert");
}

// --- Публикуване / редакция на дневно меню ---
document.getElementById("menu-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const dateStr = document.getElementById("menu-date-input").value;
    const soupVal = document.getElementById("select-soup").value;
    const mainVal = document.getElementById("select-main").value;
    const dessertVal = document.getElementById("select-dessert").value;

    if (!soupVal || !mainVal || !dessertVal) {
        alert(translate("need_dishes_first"));
        return;
    }

    const payload = {
        date: dateStr,
        soupId: Number(soupVal),
        mainCourseId: Number(mainVal),
        dessertId: Number(dessertVal),
        notes: document.getElementById("menu-notes").value || null,
    };

    try {
        const existing = await getMenuForDate(dateStr);
        if (existing) {
            await putMenu(existing.id, payload);
            alert(translate("menu_updated"));
        } else {
            await postMenu(payload);
            alert(translate("menu_published"));
        }
        document.getElementById("menu-form").reset();
    } catch (err) {
        alert(err.message);
    }
});

// --- Изход ---
document.getElementById("btn-logout").addEventListener("click", async () => {
    await logout();
    window.location.href = "index.html";
});

// --- Старт ---
guard().then(user => {
    if (user) {
        loadItems();
        loadMenuItemOptions();
    }
});

// При смяна на език обновяваме типовете ястия в списъка
document.addEventListener("langchange", () => loadItems());
