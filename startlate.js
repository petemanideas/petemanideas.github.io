document.getElementById("calcBtn").addEventListener("click", () => {
  const target = toNumber(document.getElementById("targetAmount").value);
  const current = toNumber(document.getElementById("currentBalance").value);
  const currentAge = toNumber(document.getElementById("currentAge").value);
  const retireAge = toNumber(document.getElementById("retireAge").value);
  const monthly = toNumber(document.getElementById("monthlyContribution").value);
  const annualReturn = toNumber(document.getElementById("annualReturn").value);

  if ([target, current, currentAge, retireAge, monthly, annualReturn].some(v => isNaN(v))) {
    alert("Please enter valid numbers in all fields.");
    return;
  }

  const years = retireAge - currentAge;

  if (years <= 0) {
    alert("Retirement age must be greater than current age.");
    return;
  }
  if (target <= 0) {
    alert("Target amount must be greater than 0.");
    return;
  }
  if (current < 0 || monthly < 0 || annualReturn < 0) {
    alert("Please use positive values for balance, monthly contribution, and return.");
    return;
  }

  const projected = fvMonthly(current, monthly, annualReturn, years);
  const reqMonthly = requiredMonthlyForTarget(current, target, annualReturn, years);
  const extra = reqMonthly - monthly;

  document.getElementById("projected").innerText = fmtMoney(projected);
  document.getElementById("requiredMonthly").innerText = fmtMoney(Math.max(0, reqMonthly));
  document.getElementById("extraMonthly").innerText = fmtMoney(Math.max(0, extra));

  const msgEl = document.getElementById("message");

  if (projected >= target) {
    msgEl.innerText =
      `Good news: based on your inputs, you’re projected to reach $${fmtMoney(target)} by age ${retireAge}. ` +
      `You may be able to invest less or retire earlier (returns are never guaranteed).`;
  } else if (!Number.isFinite(reqMonthly) || reqMonthly < 0) {
    msgEl.innerText =
      `Based on your inputs, the target may not be reachable with monthly contributions alone (check years/return). ` +
      `Try increasing your retirement age or adjusting assumptions.`;
  } else {
    msgEl.innerText =
      `You’re projected to reach $${fmtMoney(projected)} by age ${retireAge}, which is below your target of $${fmtMoney(target)}. ` +
      `To hit your target (with these assumptions), you’d need about $${fmtMoney(reqMonthly)} per month — roughly $${fmtMoney(Math.max(0, extra))} more than you currently invest.`;
  }

  document.getElementById("results").style.display = "block";
});
