let chartInstance = null;

function calculateCompoundInterest() {
  const P = parseFloat(document.getElementById("principal").value);
  const M = parseFloat(document.getElementById("monthly").value);
  const r = parseFloat(document.getElementById("rate").value) / 100;
  const n = parseInt(document.getElementById("frequency").value, 10);
  const t = parseInt(document.getElementById("years").value, 10);

  if ([P, M, r, n, t].some(v => isNaN(v)) || P < 0 || M < 0 || r < 0 || t <= 0) {
    alert("Please enter valid numbers (years must be greater than 0).");
    return;
  }

  // Compute yearly balances (including contributions)
  const balances = [];
  const years = [];
  let A = P;

  for (let year = 1; year <= t; year++) {
    // Growth of principal
    A = P * Math.pow(1 + (r / n), n * year);

    // Add each contribution and let it compound to year-end
    for (let i = 1; i <= year * n; i++) {
      A += M * Math.pow(1 + (r / n), n * year - i);
    }

    balances.push(Number(A.toFixed(2)));
    years.push(year);
  }

  document.getElementById("futureValue").innerText = A.toFixed(2);
  document.getElementById("results").style.display = "block";

  updateBreakdownTable(years, balances);
  updateChart(years, balances);
}

function updateBreakdownTable(years, balances) {
  const tableBody = document.querySelector("#breakdownTable tbody");
  tableBody.innerHTML = "";
  for (let i = 0; i < years.length; i++) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${years[i]}</td><td>$${balances[i].toFixed(2)}</td>`;
    tableBody.appendChild(row);
  }
}

function updateChart(years, balances) {
  const ctx = document.getElementById("growthChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [{
        label: "Investment Growth Over Time",
        data: balances,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Years" } },
        y: { title: { display: true, text: "Dollars ($)" }, beginAtZero: true }
      }
    }
  });
}

document.getElementById("calcBtn").addEventListener("click", calculateCompoundInterest);
