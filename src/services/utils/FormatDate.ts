export function formatDateToString(date: Date): string {
  return new Intl.DateTimeFormat('fr-CA').format(date)
}