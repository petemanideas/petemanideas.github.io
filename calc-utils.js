// Shared calculator utilities for calccompoundinterest.com

function toNumber(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : NaN;
}

function fmtMoney(x) {
  return x.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// Future Value with monthly compounding:
// FV = P*(1+r)^n + M * [((1+r)^n - 1)/r]
function fvMonthly(P, M, annualRatePct, years) {
  const n = Math.round(years * 12);
  const r = (annualRatePct / 100) / 12;

  if (n <= 0) return P;

  if (r === 0) return P + (M * n);

  const growth = Math.pow(1 + r, n);
  return (P * growth) + (M * ((growth - 1) / r));
}

// Solve required monthly contribution M to hit a target:
// target = P*(1+r)^n + M * [((1+r)^n - 1)/r]
function requiredMonthlyForTarget(P, target, annualRatePct, years) {
  const n = Math.round(years * 12);
  const r = (annualRatePct / 100) / 12;

  if (n <= 0) return Infinity;

  if (r === 0) return (target - P) / n;

  const growth = Math.pow(1 + r, n);
  const annuityFactor = (growth - 1) / r;
  return (target - (P * growth)) / annuityFactor;
}

// Simulate balances and return end-of-year points (monthly compounding)
function simulateYearly(P, monthlyContribution, annualRatePct, years) {
  const months = Math.round(years * 12);
  const r = (annualRatePct / 100) / 12;

  let balance = P;
  const labels = [];
  const balances = [];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) + monthlyContribution;
    if (m % 12 === 0) {
      labels.push(m / 12);
      balances.push(balance);
    }
  }
  return { labels, balances, final: balance };
}
