import dayjs from 'dayjs';

export function formatDate(date: Date | string, dateOnly = false) {
  return dayjs(date).format(dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
}

export function newDateWithOffset() {
  const dat = new Date();
  dat.setHours(dat.getTimezoneOffset() / 60, 0, 0, 0);
  return dat;
}

export function applyTimeZoneOffset(date: Date) {
  const offset = date.getTimezoneOffset();
  const absoluteOffset = Math.abs(offset);

  date.setHours(date.getHours() + Math.floor(absoluteOffset / 60));

  return date;
}
