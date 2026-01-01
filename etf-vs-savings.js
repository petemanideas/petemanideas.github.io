let etfChart = null;

function updateChart(labels, etfData, savData){
  const ctx = document.getElementById("compareChart").getContext("2d");
  if (etfChart) etfChart.destroy();

  etfChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "ETF (projected)", data: etfData, fill: true },
        { label: "Savings (projected)", data: savData, fill: true }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Years" } },
        y: { title: { display: true, text: "Balance ($)" }, beginAtZero: true }
      }
    }
  });
}

document.getElementById("etfBtn").addEventListener("click", () => {
  const P = toNumber(document.getElementById("principal").value);
  const M = toNumber(document.getElementById("monthly").value);
  const years = toNumber(document.getElementById("years").value);
  const etfRate = toNumber(document.getElementById("etfRate").value);
  const savRate = toNumber(document.getElementById("savRate").value);

  if ([P, M, years, etfRate, savRate].some(v => isNaN(v)) || P < 0 || M < 0 || years <= 0) {
    alert("Please enter valid numbers (years must be greater than 0).");
    return;
  }

  const etf = simulateYearly(P, M, etfRate, years);
  const sav = simulateYearly(P, M, savRate, years);

  const diff = etf.final - sav.final;

  document.getElementById("etfFinal").innerText = fmtMoney(etf.final);
  document.getElementById("savFinal").innerText = fmtMoney(sav.final);
  document.getElementById("diff").innerText = fmtMoney(Math.abs(diff));

  document.getElementById("verdict").innerText =
    diff >= 0
      ? `Over ${years} years, the ETF scenario ends up about $${fmtMoney(diff)} higher than savings (based on your assumptions).`
      : `Over ${years} years, savings ends up about $${fmtMoney(-diff)} higher than the ETF scenario (based on your assumptions).`;

  document.getElementById("results").style.display = "block";
  updateChart(etf.labels, etf.balances, sav.balances);
});
