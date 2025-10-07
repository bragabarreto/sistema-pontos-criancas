/**
 * Timezone utility for Fortaleza, Ceará (America/Fortaleza - UTC-3)
 * 
 * This utility ensures all date/time operations use Fortaleza timezone
 */

/**
 * Get current date and time in Fortaleza timezone
 * @returns Date object that when displayed with America/Fortaleza timezone shows the correct time
 */
export function getFortalezaNow(): Date {
  // Simply return the current time - the database will store it as UTC
  // and when we display it with timeZone: 'America/Fortaleza', it will show correctly
  return new Date();
}

/**
 * Convert a date string (YYYY-MM-DD) to a timestamp in Fortaleza timezone
 * Sets the time to current time in Fortaleza
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object with Fortaleza timezone
 */
export function dateStringToFortalezaTimestamp(dateString: string): Date {
  // Parse the date string
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Get current time in Fortaleza
  const now = getFortalezaNow();
  
  // Create date with specified date and current time in Fortaleza timezone
  const date = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
  
  return date;
}

/**
 * Format a date to Brazilian format with time
 * @param date - Date to format
 * @returns Formatted string in pt-BR format
 */
export function formatDateTimeBR(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

/**
 * Format a date to Brazilian date format only
 * @param date - Date to format
 * @returns Formatted string in pt-BR format (DD/MM/YYYY)
 */
export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Format a date to time format only
 * @param date - Date to format
 * @returns Formatted string in pt-BR format (HH:MM:SS)
 */
export function formatTimeBR(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

/**
 * Get weekday name in Portuguese
 * @param date - Date to get weekday from
 * @returns Weekday name in Portuguese
 */
export function getWeekdayBR(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    weekday: 'long',
  }).format(date);
}
