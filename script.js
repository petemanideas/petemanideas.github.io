function calculateCompoundInterest() {
    let P = parseFloat(document.getElementById("initialInvestment").value);
    let M = parseFloat(document.getElementById("monthlyContribution").value) || 0;
    let r = parseFloat(document.getElementById("interestRate").value) / 100;
    let n = parseInt(document.getElementById("compoundingFrequency").value);
    let t = parseInt(document.getElementById("years").value);

    if (isNaN(P) || isNaN(r) || isNaN(n) || isNaN(t)) {
        document.getElementById("output").innerHTML = "Please enter valid numbers.";
        return;
    }

    let A = P * Math.pow(1 + r / n, n * t) + (M * ((Math.pow(1 + r / n, n * t) - 1) / (r / n)));
    let totalInterest = A - (P + M * t * 12);

    document.getElementById("output").innerHTML = `
        <strong>Final Balance:</strong> $${A.toFixed(2)}<br>
        <strong>Total Interest Earned:</strong> $${totalInterest.toFixed(2)}
    `;
}
