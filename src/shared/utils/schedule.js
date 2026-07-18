/**
 * Best-effort parser for free-text restaurant schedules (e.g. "Lun-Dom 8:00 - 22:00").
 * @param {string} schedule - Free-text schedule string containing an "HH:MM - HH:MM" range.
 * @returns {boolean|null} Whether the restaurant is open right now, or `null` if the
 *   schedule string couldn't be confidently parsed.
 */
export const isRestaurantOpenNow = (schedule) => {
  if (!schedule || typeof schedule !== 'string') return null;

  const match = schedule.match(/(\d{1,2}):(\d{2})\s*(?:-|a|to)\s*(\d{1,2}):(\d{2})/i);
  if (!match) return null;

  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  if (start === end) return null;

  if (start < end) {
    return current >= start && current < end;
  }

  // overnight schedule (e.g. 18:00 - 02:00)
  return current >= start || current < end;
};
