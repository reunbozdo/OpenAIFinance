document.addEventListener("DOMContentLoaded", () => {
  renderHighlights();
  renderTimeline();
  renderFinancials();
  renderObligations();
  renderRevenueStructure();
  renderPartners();
  renderForecast();
});

function renderHighlights() {
  const grid = document.getElementById("highlights-grid");
  grid.innerHTML = highlights
    .map(
      (item) => `
        <article class="highlight-card">
          <strong>${item.value}</strong>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `
    )
    .join("");
}

function renderTimeline() {
  const track = document.getElementById("timeline-track");
  const details = document.getElementById("timeline-details");

  track.innerHTML = fundingTimeline
    .map(
      (event, index) => `
        <button class="timeline__item${index === 0 ? " active" : ""}" data-index="${index}">
          <span class="timeline__year">${event.year}</span>
          <span class="timeline__amount">${event.amount}</span>
        </button>
      `
    )
    .join("");

  const updateDetails = (index) => {
    const current = fundingTimeline[index];
    details.innerHTML = `
      <div class="tag">${current.stage}</div>
      <h3>${current.year}: ${current.amount}</h3>
      <p><strong>Оценка:</strong> ${current.valuation}</p>
      <p>${current.summary}</p>
      <p>${current.context}</p>
    `;
  };

  updateDetails(0);

  track.addEventListener("click", (event) => {
    const target = event.target.closest(".timeline__item");
    if (!target) return;

    const index = Number(target.dataset.index);
    updateDetails(index);

    track.querySelectorAll(".timeline__item").forEach((item) =>
      item.classList.toggle("active", item === target)
    );
  });
}

function renderFinancials() {
  const ctx = document.getElementById("financial-chart");
  const toggles = document.querySelectorAll("[data-chart-toggle]");

  const datasets = {
    revenue: {
      label: "Выручка",
      data: financialSeries.revenue,
      borderColor: "#60a5fa",
      backgroundColor: createGradient(ctx, "#60a5fa"),
      tension: 0.35,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 6,
    },
    expenses: {
      label: "Расходы",
      data: financialSeries.expenses,
      borderColor: "#f97316",
      backgroundColor: createGradient(ctx, "#f97316"),
      tension: 0.35,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 6,
    },
    losses: {
      label: "Операционный убыток",
      data: financialSeries.losses,
      borderColor: "#f43f5e",
      backgroundColor: createGradient(ctx, "#f43f5e"),
      tension: 0.35,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 6,
    },
  };

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: financialSeries.labels,
      datasets: Object.values(datasets),
    },
    options: {
      responsive: true,
      scales: {
        y: {
          ticks: {
            callback: (value) => `$${value} млрд`,
            color: "rgba(226, 232, 240, 0.7)",
          },
          grid: {
            color: "rgba(148, 163, 184, 0.12)",
          },
        },
        x: {
          ticks: {
            color: "rgba(226, 232, 240, 0.7)",
          },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "rgba(226, 232, 240, 0.9)",
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              return `${context.dataset.label}: $${value.toFixed(2)} млрд`;
            },
          },
        },
      },
    },
  });

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const key = toggle.dataset.chartToggle;
      const datasetIndex = Object.keys(datasets).indexOf(key);
      const isVisible = chart.isDatasetVisible(datasetIndex);
      const nextState = !isVisible;
      toggle.setAttribute("aria-pressed", String(nextState));
      if (nextState) {
        chart.show(datasetIndex);
      } else {
        chart.hide(datasetIndex);
      }
    });
  });

  const metricsContainer = document.getElementById("financial-metrics");
  metricsContainer.innerHTML = financialMetrics
    .map(
      (metric) => `
        <article class="metric-card">
          <h4>${metric.title}</h4>
          <strong>${metric.value}</strong>
          <p>${metric.description}</p>
        </article>
      `
    )
    .join("");
}

function renderObligations() {
  const grid = document.getElementById("obligations-grid");
  const select = document.getElementById("obligation-sort");

  const render = (items) => {
    grid.innerHTML = items
      .map(
        (item) => `
          <article class="obligation-card">
            <h3>${item.partner}</h3>
            <strong>$${item.amount} млрд</strong>
            <p>${item.description}</p>
          </article>
        `
      )
      .join("");
  };

  const sortItems = () => {
    const value = select.value;
    let sorted = [...obligations];

    if (value === "desc") {
      sorted.sort((a, b) => b.amount - a.amount);
    } else if (value === "asc") {
      sorted.sort((a, b) => a.amount - b.amount);
    } else {
      sorted.sort((a, b) => a.partner.localeCompare(b.partner));
    }

    render(sorted);
  };

  select.addEventListener("change", sortItems);
  sortItems();
}

function renderRevenueStructure() {
  const ctx = document.getElementById("revenue-chart");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: revenueStructure.labels,
      datasets: [
        {
          data: revenueStructure.values,
          backgroundColor: ["#6366f1", "#38bdf8", "#f97316", "#f43f5e"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "rgba(226, 232, 240, 0.8)",
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed}%`,
          },
        },
      },
    },
  });

  const list = document.getElementById("products-list");
  list.innerHTML = products
    .map(
      (product) => `
        <article class="product-item">
          <h4>${product.name}</h4>
          <span>${product.share}</span>
          <p>${product.description}</p>
        </article>
      `
    )
    .join("");
}

function renderPartners() {
  const grid = document.getElementById("partners-grid");
  grid.innerHTML = partners
    .map(
      (partner) => `
        <article class="partner-card">
          <div class="tag">${partner.type}</div>
          <h3>${partner.name}</h3>
          <p>${partner.description}</p>
          <p><strong>${partner.note}</strong></p>
        </article>
      `
    )
    .join("");
}

function renderForecast() {
  const ctx = document.getElementById("forecast-chart");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: forecast.map((item) => item.year),
      datasets: [
        {
          type: "bar",
          label: "Инфраструктурные затраты",
          data: forecast.map((item) => item.infrastructure),
          backgroundColor: "rgba(99, 102, 241, 0.65)",
          borderRadius: 12,
          maxBarThickness: 48,
        },
        {
          type: "line",
          label: "Необходимая выручка",
          data: forecast.map((item) => item.revenueNeeded),
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34, 211, 238, 0.2)",
          tension: 0.35,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          position: "left",
          title: {
            display: true,
            text: "Затраты ($ млрд)",
            color: "rgba(226, 232, 240, 0.7)",
          },
          ticks: {
            color: "rgba(226, 232, 240, 0.7)",
          },
          grid: {
            color: "rgba(148, 163, 184, 0.12)",
          },
        },
        y1: {
          position: "right",
          grid: {
            display: false,
          },
          ticks: {
            color: "rgba(226, 232, 240, 0.7)",
            callback: (value) => `$${value} млрд`,
          },
        },
        x: {
          ticks: {
            color: "rgba(226, 232, 240, 0.7)",
          },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "rgba(226, 232, 240, 0.9)",
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: $${context.parsed.y} млрд`,
          },
        },
      },
    },
  });

  const table = document.getElementById("forecast-table");
  const rows = forecast
    .map(
      (row) => `
        <tr>
          <td>${row.year}</td>
          <td>$${row.infrastructure} млрд</td>
          <td>$${row.revenueNeeded} млрд</td>
        </tr>
      `
    )
    .join("");

  table.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Год</th>
          <th>Инфраструктурные затраты</th>
          <th>Целевая выручка для 50–70% маржи</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function createGradient(ctx, color) {
  const canvas = ctx instanceof HTMLCanvasElement ? ctx : ctx.canvas;
  const gradient = canvas.getContext("2d").createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, hexToRgba(color, 0.55));
  gradient.addColorStop(1, hexToRgba(color, 0.05));
  return gradient;
}

function hexToRgba(hex, alpha) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
