let chartInstance = null;


function computeFutureValue(P, contribAmount, contribPerYear, r, n, t){
  // contribAmount is per contribution (weekly or monthly). We approximate contributions evenly across compounding periods.
  const contribPerPeriod = contribAmount * (contribPerYear / n);

  const balances = [];
  const years = [];
  let A = P;

  for (let year = 1; year <= t; year++) {
    A = P * Math.pow(1 + (r / n), n * year);

    for (let i = 1; i <= year * n; i++) {
      A += contribPerPeriod * Math.pow(1 + (r / n), n * year - i);
    }

    years.push(year);
    balances.push(A);
  }

  return { futureValue: A, years, balances };
}


function computeFutureValueDaily(P, contribAmount, contribPerYear, r, n, t){
  // Derive an effective daily rate consistent with the selected compounding frequency.
  // effectiveAnnual = (1 + r/n)^n - 1, then dailyRate = (1 + effectiveAnnual)^(1/365) - 1
  const effectiveAnnual = Math.pow(1 + (r / n), n) - 1;
  const dailyRate = Math.pow(1 + effectiveAnnual, 1/365) - 1;

  const totalDays = t * 365;
  let A = P;

  const balances = [];
  const years = [];

  // Distribute contributions across days as integers using flooring.
  // countToday = floor(day * contribPerYear / 365) - floor((day-1) * contribPerYear / 365)
  for (let day = 1; day <= totalDays; day++){
    const countToday = Math.floor(day * contribPerYear / 365) - Math.floor((day - 1) * contribPerYear / 365);
    if (countToday > 0){
      A += contribAmount * countToday;
    }
    A *= (1 + dailyRate);

    if (day % 365 === 0){
      years.push(day / 365);
      balances.push(A);
    }
  }

  return { futureValue: A, years, balances };
}


function formatCurrencyUSD(x){
  try{
    return x.toLocaleString(undefined, {style:'currency', currency:'USD', maximumFractionDigits:0});
  }catch(e){
    return '$' + Math.round(x).toString();
  }
}


function calculateCompoundInterest() {
  const P = parseFloat(document.getElementById("principal").value);
  const contribAmount = parseFloat(document.getElementById("contribution").value);
  const contribFreq = (document.getElementById("contribFreq")?.value || "monthly");
  const r = parseFloat(document.getElementById("rate").value) / 100;
  const n = parseInt(document.getElementById("frequency").value, 10);
  const t = parseInt(document.getElementById("years").value, 10);
if ([P, contribAmount, r, n, t].some(v => isNaN(v)) || P < 0 || contribAmount < 0 || r < 0 || t <= 0) {
    alert("Please enter valid numbers (years must be greater than 0).");
    return;
  }

  
  const resultsEl = document.getElementById("results");
  if (resultsEl) resultsEl.style.display = "block";
const contribPerYear = (contribFreq === "weekly") ? 52 : 12;
  const { futureValue, years, balances } = computeFutureValue(P, contribAmount, contribPerYear, r, n, t);

  // Display results
  document.getElementById("futureValue").textContent = futureValue.toFixed(2);
  // Fill table
  const tableBody = document.querySelector("#breakdownTable tbody");
  tableBody.innerHTML = "";
  for (let i = 0; i < years.length; i++) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${years[i]}</td><td>$${balances[i].toFixed(2)}</td>`;
    tableBody.appendChild(row);
  }

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

function updateChart(years, primaryBalances, secondaryBalances = null) {
  const ctx = document.getElementById("growthChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  const datasets = [];

  if (secondaryBalances !== null && Array.isArray(secondaryBalances)) {
    // Draw weekly first, then monthly on top so it stays visible even if lines are close.
    datasets.push({
      label: "Weekly (same annual total)",
      data: primaryBalances,
      fill: false,
      tension: 0.2,
      borderColor: "rgb(54, 162, 235)",
      borderWidth: 2,
      pointRadius: 0,
      order: 1
    });
    datasets.push({
      label: "Monthly (same annual total)",
      data: secondaryBalances,
      fill: false,
      tension: 0.2,
      borderColor: "rgb(255, 99, 132)",
      borderWidth: 4,
      borderDash: [8, 5],
      pointRadius: 2,
      pointHoverRadius: 3,
      order: 2
    });
  } else {
    datasets.push({
      label: "Investment Growth Over Time",
      data: primaryBalances,
      fill: true,
      tension: 0.2
    });
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: datasets.length > 1 }
      },
      scales: {
        x: { title: { display: true, text: "Years" } },
        y: { title: { display: true, text: "Dollars ($)" }, beginAtZero: true }
      }
    }
  });
}








function compareWeeklyMonthly(){
  const P = parseFloat(document.getElementById("principal").value);
  const contribAmount = parseFloat(document.getElementById("contribution").value);
  const selectedFreq = (document.getElementById("contribFreq")?.value || "monthly");
  const compareMode = (document.getElementById("compareMode")?.value || "equal_annual");
  const r = parseFloat(document.getElementById("rate").value) / 100;
  const n = parseInt(document.getElementById("frequency").value, 10);
  const t = parseInt(document.getElementById("years").value, 10);

  if ([P, contribAmount, r, n, t].some(v => isNaN(v)) || P < 0 || contribAmount < 0 || r < 0 || t <= 0) {
    alert("Please enter valid numbers (years must be greater than 0).");
    return;
  }

  let weeklyAmt, monthlyAmt, noteHtml;

  if (compareMode === "same_amount") {
    // Same amount per contribution (e.g., $100/week vs $100/month)
    weeklyAmt = contribAmount;
    monthlyAmt = contribAmount;

    const annualWeekly = weeklyAmt * 52;
    const annualMonthly = monthlyAmt * 12;

    noteHtml = `
      <div class="muted" style="margin-top:10px;">
        Compare mode: <strong>Same contribution amount</strong>. This compares <strong>${formatCurrencyUSD(weeklyAmt)}/week</strong>
        vs <strong>${formatCurrencyUSD(monthlyAmt)}/month</strong> (different yearly totals: ${formatCurrencyUSD(annualWeekly)}/yr vs ${formatCurrencyUSD(annualMonthly)}/yr).
      </div>
    `;
  } else {
    // Fair comparison: keep the annual total constant based on what the user entered.
    const annualTotal = (selectedFreq === "weekly") ? contribAmount * 52 : contribAmount * 12;
    weeklyAmt = annualTotal / 52;
    monthlyAmt = annualTotal / 12;

    noteHtml = `
      <div class="muted" style="margin-top:10px;">
        Compare mode: <strong>Equal annual total</strong> (${formatCurrencyUSD(annualTotal)}/yr). Weekly can be slightly higher because contributions get invested sooner.
      </div>
    `;
  }

  // Use a daily timing simulation for the compare view so weekly deposits happen earlier than monthly deposits.
  const weekly = computeFutureValueDaily(P, weeklyAmt, 52, r, n, t);
  const monthly = computeFutureValueDaily(P, monthlyAmt, 12, r, n, t);

  const diff = weekly.futureValue - monthly.futureValue;
  const pct = (monthly.futureValue > 0) ? (diff / monthly.futureValue) * 100 : 0;

  const compareEl = document.getElementById("compareResults");
  if (compareEl){
    compareEl.style.display = "block";
    compareEl.innerHTML = `
      <div class="row"><span class="label">Weekly</span><span class="value">${formatCurrencyUSD(weekly.futureValue)}</span></div>
      <div class="row"><span class="label">Monthly</span><span class="value">${formatCurrencyUSD(monthly.futureValue)}</span></div>
      <div class="row"><span class="label">Difference</span><span class="value">${formatCurrencyUSD(diff)} (${pct.toFixed(2)}%)</span></div>
      ${noteHtml}
    `;
  }

  // Show results area
  const resultsEl = document.getElementById("results");
  if (resultsEl) resultsEl.style.display = "block";

  // Keep the main table + single-value result in sync with the user's current frequency.
  calculateCompoundInterest();

  // Re-draw the chart in compare mode (two lines).
  updateChart(weekly.years, weekly.balances, monthly.balances);
}




function applyParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const contrib = params.get("contrib");
    const comp = params.get("comp");

    if (contrib && document.getElementById("contribFreq")) {
      const v = (contrib === "weekly" || contrib === "monthly") ? contrib : null;
      if (v) document.getElementById("contribFreq").value = v;
    }
    if (comp && document.getElementById("frequency")) {
      const allowed = new Set(["1","4","12","365"]);
      if (allowed.has(comp)) document.getElementById("frequency").value = comp;
    }
  } catch (e) {}
}

function onCalcClick(){
  const compareEl = document.getElementById("compareResults");
  if (compareEl){ compareEl.style.display = "none"; compareEl.innerHTML = ""; }
  calculateCompoundInterest();
}

document.getElementById("calcBtn").addEventListener("click", onCalcClick);
document.addEventListener("DOMContentLoaded", applyParams);


document.getElementById("compareBtn").addEventListener("click", compareWeeklyMonthly);

