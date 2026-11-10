const fs = require("fs");

const lines = fs.readFileSync("payments.jsonl", "utf8").split(/\r?\n/);
const payments = new Map();

// Keep only the latest attempt for each transaction.
for (const line of lines) {
  if (!line.trim()) continue;

  let payment;

  try {
    payment = JSON.parse(line);
  } catch {
    continue;
  }

  if (!payment.txn_id) continue;

  const previous = payments.get(payment.txn_id);

  if (!previous || Date.parse(payment.ts) >= Date.parse(previous.ts)) {
    payments.set(payment.txn_id, payment);
  }
}

// Count successful payments and calculate the total collected.
let count = 0;
let total = 0;

for (const payment of payments.values()) {
  if (payment.status !== "success") continue;

  const amount = Number(String(payment.amount).replace(/,/g, ""));

  count++;
  total += amount;
}

// Compare the result with the expected payment count.
const expected = Number(
  fs.readFileSync("expected.txt", "utf8").trim()
);

if (count === expected) {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
} else {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
}
