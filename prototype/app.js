// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Housing", "Food", "Transport", "Health", "Entertainment", "Shopping", "Utilities", "Other"];

const CAT_COLORS = {
  Housing:       "#e8a87c",
  Food:          "#85c1e9",
  Transport:     "#82e0aa",
  Health:        "#f1948a",
  Entertainment: "#c39bd3",
  Shopping:      "#f7dc6f",
  Utilities:     "#aab7b8",
  Other:         "#d2b4de",
};

const DEFAULT_BUDGETS = {
  Housing:       8000,
  Food:          3000,
  Transport:     1500,
  Health:        1000,
  Entertainment: 1000,
  Shopping:      2000,
  Utilities:     1200,
  Other:         500,
};

// ─── State ────────────────────────────────────────────────────────────────────

let expenses      = JSON.parse(localStorage.getItem("expenses")     || "[]");
let budgets       = JSON.parse(localStorage.getItem("budgets")      || JSON.stringify(DEFAULT_BUDGETS));
let cycleStartDay = parseInt(localStorage.getItem("cycleStartDay")  || "25", 10);
let currentTab    = "dashboard";
let pieChart      = null;
let barChart      = null;

// ─── Persistence ──────────────────────────────────────────────────────────────

function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("budgets",  JSON.stringify(budgets));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  return "R\u00a0" + Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(str) {
  return new Date(str + "T00:00:00").toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Cycle logic ──────────────────────────────────────────────────────────────

// Returns the cycle-start date string "YYYY-MM-DD" for any given date string.
// A cycle starts on cycleStartDay of some month and runs until cycleStartDay-1 of the next.
function getCycleStartForDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (d >= cycleStartDay) {
    // Cycle started this calendar month
    return `${y}-${String(m).padStart(2, "0")}-${String(cycleStartDay).padStart(2, "0")}`;
  } else {
    // Cycle started last calendar month
    const prev = new Date(y, m - 2, cycleStartDay); // m-1 = current (0-indexed), m-2 = previous
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(cycleStartDay).padStart(2, "0")}`;
  }
}

// Returns the start date of the *next* cycle after the given cycle start.
function getNextCycleStart(cycleStartStr) {
  const [y, m, d] = cycleStartStr.split("-").map(Number);
  const next = new Date(y, m, d); // JS months are 0-indexed, so m = next month
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
}

// Returns true if a date string falls within a given cycle.
function isInCycle(dateStr, cycleStartStr) {
  return dateStr >= cycleStartStr && dateStr < getNextCycleStart(cycleStartStr);
}

// Returns the current cycle's start date string.
function getCurrentCycle() {
  return getCycleStartForDate(todayStr());
}

// Human-readable label, e.g. "25 Jan – 24 Feb 2026".
function cycleLabel(startStr) {
  const [y, m, d] = startStr.split("-").map(Number);
  const startDate = new Date(y, m - 1, d);
  const endDate   = new Date(y, m, d - 1); // one month forward, one day back
  const startFmt  = startDate.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
  const endFmt    = endDate.toLocaleDateString("en-ZA",   { day: "numeric", month: "short", year: "numeric" });
  return `${startFmt} – ${endFmt}`;
}

function selectedCycle() {
  return document.getElementById("cycleSelect").value;
}

// ─── Cycle selector ───────────────────────────────────────────────────────────

function buildCycleSelect() {
  const sel  = document.getElementById("cycleSelect");
  const cur  = getCurrentCycle();

  // Derive all unique cycle starts from stored expenses
  const cycles = [...new Set(expenses.map(e => getCycleStartForDate(e.date)))].sort().reverse();
  if (!cycles.includes(cur)) cycles.unshift(cur);

  const prev = sel.value;
  sel.innerHTML = cycles.map(c => `<option value="${c}">${cycleLabel(c)}</option>`).join("");
  sel.value = (prev && cycles.includes(prev)) ? prev : cycles[0];
  document.getElementById("subhead").textContent = cycleLabel(sel.value);
}

// ─── Tab switching ────────────────────────────────────────────────────────────

function switchTab(tab) {
  currentTab = tab;
  ["dashboard", "budgets", "settings"].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle("active", t === tab);
    document.getElementById(`view-${t}`).style.display = t === tab ? "" : "none";
  });
  render();
}

// ─── Render dispatcher ────────────────────────────────────────────────────────

function render() {
  document.getElementById("subhead").textContent = cycleLabel(selectedCycle());
  if (currentTab === "dashboard") renderDashboard();
  else if (currentTab === "budgets") renderBudgets();
  else renderSettings();
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function renderDashboard() {
  const cs          = selectedCycle();
  const me          = expenses.filter(e => isInCycle(e.date, cs));
  const totalSpent  = me.reduce((s, e) => s + e.amount, 0);
  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
  const remaining   = totalBudget - totalSpent;
  const over        = totalSpent > totalBudget;

  const bycat = CATEGORIES.map(cat => ({
    cat,
    items:  me.filter(e => e.category === cat),
    total:  me.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    budget: budgets[cat],
  }));
  const withItems = bycat.filter(g => g.items.length > 0);

  document.getElementById("view-dashboard").innerHTML = `
    <div class="grid3">
      <div class="card">
        <div class="summary-label">Total Spent</div>
        <div class="summary-value" style="color:var(--accent)">${fmt(totalSpent)}</div>
        <div class="summary-sub">of ${fmt(totalBudget)} budget</div>
      </div>
      <div class="card">
        <div class="summary-label">Remaining</div>
        <div class="summary-value ${over ? "text-danger" : "text-success"}">${fmt(Math.abs(remaining))}</div>
        <div class="summary-sub">${over ? "⚠ over budget" : "available"}</div>
      </div>
      <div class="card">
        <div class="summary-label">Transactions</div>
        <div class="summary-value" style="color:var(--info)">${me.length}</div>
        <div class="summary-sub">this cycle</div>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="chart-title">Spending Breakdown</div>
        <div class="chart-wrap"><canvas id="pieCanvas"></canvas></div>
        <div class="legend" id="pieLegend"></div>
      </div>
      <div class="card">
        <div class="chart-title">Budget vs Spent</div>
        <div class="chart-wrap"><canvas id="barCanvas"></canvas></div>
      </div>
    </div>

    <div id="catGroups"></div>
  `;

  buildPie(withItems);
  buildBar(bycat.filter(g => g.total > 0));
  buildGroups(withItems);
}

function buildPie(withItems) {
  if (pieChart) { pieChart.destroy(); pieChart = null; }
  const legend = document.getElementById("pieLegend");
  if (!withItems.length) {
    legend.innerHTML = `<div style="color:var(--muted2);font-size:13px;padding:64px 0;text-align:center;width:100%">No expenses yet</div>`;
    return;
  }
  pieChart = new Chart(document.getElementById("pieCanvas"), {
    type: "doughnut",
    data: {
      labels:   withItems.map(g => g.cat),
      datasets: [{
        data:            withItems.map(g => g.total),
        backgroundColor: withItems.map(g => CAT_COLORS[g.cat]),
        borderWidth:     2,
        borderColor:     "#161924",
      }],
    },
    options: {
      cutout:  "60%",
      plugins: {
        legend:  { display: false },
        tooltip: {
          callbacks:       { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)}` },
          backgroundColor: "#161924", borderColor: "#2e3347", borderWidth: 1,
          titleColor:      "#ccc", bodyColor: "#e8e8e8",
        },
      },
    },
  });
  legend.innerHTML = withItems.map(g =>
    `<div class="legend-item"><div class="legend-dot" style="background:${CAT_COLORS[g.cat]}"></div>${g.cat}</div>`
  ).join("");
}

function buildBar(items) {
  if (barChart) { barChart.destroy(); barChart = null; }
  if (!items.length) return;
  barChart = new Chart(document.getElementById("barCanvas"), {
    type: "bar",
    data: {
      labels:   items.map(g => g.cat.slice(0, 4)),
      datasets: [
        { label: "Budget", data: items.map(g => g.budget), backgroundColor: "#1e2235", borderRadius: 4 },
        { label: "Spent",  data: items.map(g => g.total),  borderRadius: 4,
          backgroundColor: items.map(g => g.total > g.budget ? "#f1948a" : CAT_COLORS[g.cat]) },
      ],
    },
    options: {
      plugins: {
        legend:  { display: false },
        tooltip: {
          callbacks:       { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` },
          backgroundColor: "#161924", borderColor: "#2e3347", borderWidth: 1,
          titleColor:      "#ccc", bodyColor: "#e8e8e8",
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#555", font: { size: 11 } }, border: { display: false } },
        y: {
          grid:   { color: "#1e2235" },
          ticks:  { color: "#555", font: { size: 11 }, callback: v => `R${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}` },
          border: { display: false },
        },
      },
    },
  });
}

function buildGroups(withItems) {
  const container = document.getElementById("catGroups");
  if (!withItems.length) {
    container.innerHTML = `
      <div class="card empty">
        <div class="empty-icon">📂</div>
        <div class="empty-title">No expenses for this cycle</div>
        <div class="empty-sub">Click "+ Add Expense" to get started</div>
      </div>`;
    return;
  }
  container.innerHTML = withItems.map(g => {
    const pct  = Math.min(100, (g.total / g.budget) * 100);
    const over = g.total > g.budget;
    const fill = over ? "var(--danger)" : CAT_COLORS[g.cat];
    return `
      <div class="card cat-group">
        <div class="cat-header">
          <div class="cat-left">
            <div class="cat-dot" style="background:${CAT_COLORS[g.cat]}"></div>
            <div class="cat-name">${g.cat}</div>
            <span class="cat-tag" style="background:${CAT_COLORS[g.cat]}22;color:${CAT_COLORS[g.cat]}">
              ${g.items.length} item${g.items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div>
            <div class="cat-total ${over ? "text-danger" : ""}">${fmt(g.total)}</div>
            <div class="cat-budget-txt">of ${fmt(g.budget)}</div>
          </div>
        </div>
        <div class="prog-wrap" style="margin-bottom:12px">
          <div class="prog-fill" style="width:${pct}%;background:${fill}"></div>
        </div>
        ${g.items.map(item => `
          <div class="expense-item animate-in">
            <div>
              <div class="exp-desc">${esc(item.description)}</div>
              <div class="exp-date">${formatDate(item.date)}</div>
            </div>
            <div class="exp-right">
              <div class="exp-amount">${fmt(item.amount)}</div>
              <button class="del-btn" data-id="${item.id}" title="Delete expense">×</button>
            </div>
          </div>`).join("")}
      </div>`;
  }).join("");
}

// ─── Budgets view ─────────────────────────────────────────────────────────────

function renderBudgets() {
  const cs = selectedCycle();
  const me = expenses.filter(e => isInCycle(e.date, cs));

  document.getElementById("view-budgets").innerHTML = `
    <div class="grid2-budget">
      ${CATEGORIES.map(cat => {
        const spent  = me.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
        const budget = budgets[cat];
        const pct    = Math.min(100, (spent / budget) * 100);
        const over   = spent > budget;
        return `
          <div class="card">
            <div class="budget-row">
              <div class="budget-name">
                <div class="cat-dot" style="background:${CAT_COLORS[cat]}"></div>
                ${cat}
                ${spent > 0 ? `<button class="cat-clear-btn" onclick="clearCategory('${cat}')" title="Delete all ${cat} expenses">🗑</button>` : ""}
              </div>
              <div id="bdisplay-wrap-${cat}">
                <button class="budget-display-btn" onclick="startEditBudget('${cat}')">${fmt(budget)} ✎</button>
              </div>
            </div>
            <div class="prog-wrap" style="margin-bottom:8px">
              <div class="prog-fill" style="width:${pct}%;background:${over ? "var(--danger)" : CAT_COLORS[cat]}"></div>
            </div>
            <div class="budget-stats">
              <span class="${over ? "text-danger" : ""}">${fmt(spent)} spent</span>
              <span class="${over ? "text-danger" : "text-success"}">
                ${over ? fmt(spent - budget) + " over" : fmt(budget - spent) + " left"}
              </span>
            </div>
          </div>`;
      }).join("")}
    </div>`;
}

function startEditBudget(cat) {
  const wrap = document.getElementById(`bdisplay-wrap-${cat}`);
  wrap.innerHTML = `
    <input type="number" class="budget-input-field" value="${budgets[cat]}" min="0" step="100"
      onblur="saveBudget('${cat}', this.value)"
      onkeydown="if(event.key==='Enter')this.blur(); if(event.key==='Escape')renderBudgets();" />`;
  wrap.querySelector("input").focus();
}

function saveBudget(cat, val) {
  const n = parseFloat(val);
  if (!isNaN(n) && n >= 0) { budgets[cat] = n; save(); }
  renderBudgets();
}

function clearCategory(cat) {
  const cs    = selectedCycle();
  const count = expenses.filter(e => e.category === cat && isInCycle(e.date, cs)).length;
  const confirmed = confirm(`Delete all ${count} expense${count !== 1 ? "s" : ""} in "${cat}" for ${cycleLabel(cs)}? This cannot be undone.`);
  if (!confirmed) return;
  expenses = expenses.filter(e => !(e.category === cat && isInCycle(e.date, cs)));
  save();
  buildCycleSelect();
  renderBudgets();
}

// ─── Settings view ────────────────────────────────────────────────────────────

function renderSettings() {
  document.getElementById("view-settings").innerHTML = `
    <div class="settings-card card">
      <div class="settings-title">Pay Cycle</div>
      <div class="settings-desc">
        Your tracking cycle starts on this day each month. Changing it applies going forward — past expenses stay in the cycles they were recorded in.
      </div>
      <div class="settings-row">
        <label class="settings-label" for="payday-input">Pay day</label>
        <div class="settings-controls">
          <input type="number" id="payday-input" min="1" max="28" value="${cycleStartDay}" />
          <button class="btn btn-primary" onclick="savePayDay()">Save</button>
        </div>
      </div>
      <div class="settings-hint">Enter a day between 1 and 28. Capped at 28 to work consistently in February.</div>
      <div id="payday-feedback" class="settings-feedback"></div>
    </div>
  `;
}

function savePayDay() {
  const val = parseInt(document.getElementById("payday-input").value, 10);
  const fb  = document.getElementById("payday-feedback");
  if (isNaN(val) || val < 1 || val > 28) {
    fb.textContent  = "Please enter a day between 1 and 28.";
    fb.className    = "settings-feedback feedback-error";
    return;
  }
  cycleStartDay = val;
  localStorage.setItem("cycleStartDay", val);
  buildCycleSelect();
  render();
  fb.textContent = `✓ Saved. Cycles now start on the ${val}${ordinal(val)} of each month.`;
  fb.className   = "settings-feedback feedback-success";
}

function ordinal(n) {
  const s = ["th","st","nd","rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

function addExpense() {
  const desc   = document.getElementById("f-desc").value.trim();
  const amount = parseFloat(document.getElementById("f-amount").value);
  const date   = document.getElementById("f-date").value;
  const cat    = document.getElementById("f-cat").value;
  if (!desc || isNaN(amount) || amount <= 0 || !date) return;
  expenses.unshift({ id: Date.now(), description: desc, amount, date, category: cat });
  save();
  buildCycleSelect();
  closeModal();
  render();
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  buildCycleSelect();
  render();
}

// ─── Export / Import ──────────────────────────────────────────────────────────

function exportData() {
  const payload = { exportedAt: new Date().toISOString(), expenses, budgets, cycleStartDay };
  const blob    = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href        = url;
  a.download    = `expenses-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.expenses) || typeof data.budgets !== "object") {
        alert("Invalid backup file — make sure you're importing an Expense Tracker export.");
        return;
      }
      const exportDate = data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : "unknown date";
      const confirmed  = confirm(
        `This will replace your current data with the backup from ${exportDate}.\n\n` +
        `Backup contains ${data.expenses.length} expense(s).\n\nContinue?`
      );
      if (!confirmed) return;
      expenses      = data.expenses;
      budgets       = { ...DEFAULT_BUDGETS, ...data.budgets };
      cycleStartDay = data.cycleStartDay || 25;
      localStorage.setItem("cycleStartDay", cycleStartDay);
      save();
      buildCycleSelect();
      render();
    } catch {
      alert("Could not read the file. Make sure it's a valid JSON backup.");
    }
    event.target.value = "";
  };
  reader.readAsText(file);
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function openModal() {
  document.getElementById("f-desc").value   = "";
  document.getElementById("f-amount").value = "";
  document.getElementById("f-date").value   = todayStr();
  document.getElementById("modal").classList.add("open");
  setTimeout(() => document.getElementById("f-desc").focus(), 50);
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ─── Init ─────────────────────────────────────────────────────────────────────

(function init() {
  const catSel = document.getElementById("f-cat");
  CATEGORIES.forEach(c => {
    const o = document.createElement("option");
    o.value = o.textContent = c;
    catSel.appendChild(o);
  });
  catSel.value = "Food";

  document.getElementById("view-dashboard").addEventListener("click", e => {
    const btn = e.target.closest(".del-btn");
    if (btn) deleteExpense(Number(btn.dataset.id));
  });

  buildCycleSelect();
  document.getElementById("cycleSelect").addEventListener("change", render);
  renderDashboard();
})();
