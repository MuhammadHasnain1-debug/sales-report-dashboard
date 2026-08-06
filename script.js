const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let orders = [];
let sortKey = "date";
let sortDir = 1;

async function init() {
  const [summary, csv] = await Promise.all([
    fetch("summary.json").then(r => r.json()),
    fetch("clean_sales.csv").then(r => r.text()),
  ]);

  orders = parseCsv(csv);
  renderCards(summary);
  renderChart(summary.revenue_by_month);
  renderTable();
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const cells = line.split(",");
    const row = {};
    headers.forEach((h, i) => row[h] = cells[i]);
    row.quantity = Number(row.quantity);
    row.unit_price = Number(row.unit_price);
    row.revenue = Number(row.revenue);
    return row;
  });
}

function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderCards(summary) {
  const avg = summary.total_revenue / summary.order_count;
  const topProduct = summary.top_5_products[0].product;

  const cards = [
    { label: "Total revenue", value: money(summary.total_revenue), accent: true },
    { label: "Orders", value: summary.order_count },
    { label: "Avg order value", value: money(avg) },
    { label: "Top product", value: topProduct, text: true },
  ];

  document.getElementById("cards").innerHTML = cards.map(c => `
    <div class="stat ${c.accent ? "accent" : ""}">
      <span class="label">${c.label}</span>
      <span class="value ${c.text ? "text" : ""}">${c.value}</span>
    </div>
  `).join("");
}

function renderChart(byMonth) {
  const labels = Object.keys(byMonth).map(m => {
    const [y, mo] = m.split("-");
    return `${MONTHS[Number(mo) - 1]} ${y}`;
  });
  const data = Object.values(byMonth);

  const styles = getComputedStyle(document.body);
  const accent = styles.getPropertyValue("--accent").trim();
  const ink = styles.getPropertyValue("--muted").trim();
  const line = styles.getPropertyValue("--line").trim();

  new Chart(document.getElementById("revChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: accent,
        borderRadius: 6,
        maxBarThickness: 64,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => money(ctx.parsed.y) } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: ink } },
        y: {
          beginAtZero: true,
          grid: { color: line },
          ticks: { color: ink, callback: v => "$" + v },
        },
      },
    },
  });
}

function renderTable() {
  const term = document.getElementById("search").value.toLowerCase();
  const filtered = orders.filter(o =>
    [o.order_id, o.date, o.product, o.customer].join(" ").toLowerCase().includes(term)
  );

  filtered.sort((a, b) => {
    let x = a[sortKey], y = b[sortKey];
    if (typeof x === "string") { x = x.toLowerCase(); y = y.toLowerCase(); }
    return x < y ? -sortDir : x > y ? sortDir : 0;
  });

  const tbody = document.getElementById("tbody");
  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td>${o.order_id}</td>
      <td>${o.date}</td>
      <td class="product">${o.product}</td>
      <td>${o.customer}</td>
      <td class="num">${o.quantity}</td>
      <td class="num">${money(o.unit_price)}</td>
      <td class="num">${money(o.revenue)}</td>
    </tr>
  `).join("");

  document.getElementById("empty").hidden = filtered.length > 0;
  document.getElementById("rowcount").textContent =
    `Showing ${filtered.length} of ${orders.length} orders`;

  document.querySelectorAll("thead th").forEach(th => {
    th.classList.toggle("sort-asc", th.dataset.key === sortKey && sortDir === 1);
    th.classList.toggle("sort-desc", th.dataset.key === sortKey && sortDir === -1);
  });
}

document.querySelectorAll("thead th").forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.key;
    if (key === sortKey) { sortDir *= -1; } else { sortKey = key; sortDir = 1; }
    renderTable();
  });
});

document.getElementById("search").addEventListener("input", renderTable);

init();
