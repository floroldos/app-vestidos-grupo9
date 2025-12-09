import { describe, test, expect } from 'vitest';
import { findAvailableDates, formatDate, addDays } from '../utils/date-helpers';

//Tests unitarios para findAvailableDates
// valida la lógica de búsqueda de fechas disponibles para alquileres

describe('findAvailableDates', () => {
    test('encuentra ventana libre sin rentals existentes', () => {
        // debe encontrar fechas disponibles
        const result = findAvailableDates([], 2);
        
        expect(result.start).toBeDefined();
        expect(result.end).toBeDefined();
    });
});
