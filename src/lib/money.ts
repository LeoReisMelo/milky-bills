export function toCents(value: string): number {
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/^R\$\s?/, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);

  if (amount <= 0) {
  throw new Error("A transação precisa ter um valor maior que zero.");
}

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Informe um valor válido.");
  }

  return Math.round(amount * 100);
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function today(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 10);
}

export function currentMonth(): string {
  return today().slice(0, 7);
}