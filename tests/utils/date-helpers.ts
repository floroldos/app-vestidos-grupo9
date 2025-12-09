/**
 * Formatea una fecha como string YYYY-MM-DD
 */
export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Suma días a una fecha
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Encuentra fechas disponibles sin solapamiento con rentals existentes
 */
export function findAvailableDates(existingRentals: any[], daysNeeded = 2) {
    const existing = existingRentals.map((r: any) => ({
        start: new Date(r.start),
        end: new Date(r.end),
    }));

    const today = new Date();
    for (let offset = 1; offset <= 30; offset++) {
        const start = addDays(today, offset);
        const end = addDays(start, daysNeeded);

        const hasOverlap = existing.some((r: { start: Date; end: Date }) =>
            !(end.getTime() < r.start.getTime() || start.getTime() > r.end.getTime())
        );

        if (!hasOverlap) {
            return { start, end };
        }
    }

    throw new Error('No free date window found for the next 30 days');
}
