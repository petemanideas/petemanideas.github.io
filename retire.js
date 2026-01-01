document.getElementById("retireBtn").addEventListener("click", () => {
  const income = toNumber(document.getElementById("income").value);
  const swrPct = toNumber(document.getElementById("swr").value);
  const years = toNumber(document.getElementById("years").value);
  const annualReturn = toNumber(document.getElementById("return").value);
  const current = toNumber(document.getElementById("current").value);
  const monthly = toNumber(document.getElementById("monthly").value);

  if ([income, swrPct, years, annualReturn, current, monthly].some(v => isNaN(v))) {
    alert("Please enter valid numbers in all fields.");
    return;
  }
  if (income <= 0 || years <= 0 || swrPct <= 0) {
    alert("Income, years and withdrawal rate must be greater than 0.");
    return;
  }
  if (current < 0 || monthly < 0 || annualReturn < 0) {
    alert("Please use positive values for investments, contribution and return.");
    return;
  }

  const swr = swrPct / 100;
  const required = income / swr;

  const projected = fvMonthly(current, monthly, annualReturn, years);

  const neededMonthly = requiredMonthlyForTarget(current, required, annualReturn, years);
  const extra = neededMonthly - monthly;

  document.getElementById("required").innerText = fmtMoney(required);
  document.getElementById("projected").innerText = fmtMoney(projected);
  document.getElementById("neededMonthly").innerText = fmtMoney(Math.max(0, neededMonthly));
  document.getElementById("extraMonthly").innerText = fmtMoney(Math.max(0, extra));

  const explain = document.getElementById("explain");

  if (projected >= required) {
    explain.innerText =
      `Based on your inputs, you’re projected to reach your target. You may be able to retire earlier, ` +
      `invest less, or increase your retirement income goal — but returns are never guaranteed.`;
  } else {
    explain.innerText =
      `You’re projected to be below your target nest egg. To reach it with these assumptions, ` +
      `you’d need about $${fmtMoney(Math.max(0, neededMonthly))} per month (roughly $${fmtMoney(Math.max(0, extra))} more than you currently invest).`;
  }

  document.getElementById("results").style.display = "block";
});
