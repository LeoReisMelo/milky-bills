import { db, type RecurringTransaction } from "../db/database";
import { today } from "./money";

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function nextOccurrence(
  dateString: string,
  frequency: RecurringTransaction["frequency"],
): string {
  const current = parseDate(dateString);
  const originalDay = current.getDate();

  if (frequency === "weekly") {
    current.setDate(current.getDate() + 7);
    return formatDate(current);
  }

  if (frequency === "yearly") {
    const targetMonth = current.getMonth();
    current.setFullYear(current.getFullYear() + 1);

    // Evita que 29 de fevereiro avance incorretamente para março.
    if (current.getMonth() !== targetMonth) {
      current.setDate(0);
    }

    return formatDate(current);
  }

  const targetMonth = current.getMonth() + 1;
  const targetYear = current.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = targetMonth % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();

  return formatDate(
    new Date(targetYear, normalizedMonth, Math.min(originalDay, lastDay)),
  );
}

export function countRemainingOccurrences(
  recurrence: RecurringTransaction,
): number {
  if (
    recurrence.status !== "active" ||
    recurrence.nextOccurrenceDate > recurrence.endDate
  ) {
    return 0;
  }

  let count = 0;
  let occurrenceDate = recurrence.nextOccurrenceDate;

  // Limite defensivo para evitar loops em dados inválidos.
  while (occurrenceDate <= recurrence.endDate && count < 10000) {
    count += 1;

    const next = nextOccurrence(occurrenceDate, recurrence.frequency);

    if (next <= occurrenceDate) {
      break;
    }

    occurrenceDate = next;
  }

  return count;
}

/**
 * Gera todas as ocorrências vencidas e avança a próxima data
 * na mesma transação IndexedDB, evitando duplicidades.
 */
export async function processDueRecurrences(): Promise<number> {
  const referenceDate = today();
  const now = new Date().toISOString();
  let generatedCount = 0;

  await db.transaction(
    "rw",
    db.transactions,
    db.recurringTransactions,
    async () => {
      const activeRecurrences = await db.recurringTransactions
        .where("status")
        .equals("active")
        .toArray();

      for (const recurrence of activeRecurrences) {
        if (recurrence.id === undefined) continue;

        let occurrenceDate = recurrence.nextOccurrenceDate;
        let safetyCounter = 0;

        while (
          occurrenceDate <= referenceDate &&
          occurrenceDate <= recurrence.endDate &&
          safetyCounter < 10000
        ) {
          await db.transactions.add({
            title: recurrence.title,
            description: recurrence.description,
            category: recurrence.category,
            type: recurrence.type,
            amount: recurrence.amount,
            accountId: recurrence.accountId,
            creditCardId: recurrence.creditCardId,
            recurringId: recurrence.id,
            date: occurrenceDate,
            createdAt: now,
          });

          generatedCount += 1;
          safetyCounter += 1;

          const nextDate = nextOccurrence(occurrenceDate, recurrence.frequency);

          if (nextDate <= occurrenceDate) {
            throw new Error("A frequência gerou uma data inválida.");
          }

          occurrenceDate = nextDate;
        }

        const concluded =
          occurrenceDate > recurrence.endDate || safetyCounter >= 10000;

        await db.recurringTransactions.update(recurrence.id, {
          nextOccurrenceDate: occurrenceDate,
          status: concluded ? "concluded" : "active",
          updatedAt: now,
        });
      }
    },
  );

  return generatedCount;
}

/**
 * Soma apenas as parcelas futuras de recorrências ativas
 * vinculadas a cartões de crédito.
 */
export function calculateCardReservations(
  recurrences: RecurringTransaction[],
): Record<number, number> {
  return recurrences.reduce<Record<number, number>>((totals, recurrence) => {
    if (
      recurrence.status !== "active" ||
      recurrence.type !== "expense" ||
      recurrence.creditCardId === undefined
    ) {
      return totals;
    }

    const remaining = recurrence.amount * countRemainingOccurrences(recurrence);

    totals[recurrence.creditCardId] =
      (totals[recurrence.creditCardId] ?? 0) + remaining;

    return totals;
  }, {});
}
