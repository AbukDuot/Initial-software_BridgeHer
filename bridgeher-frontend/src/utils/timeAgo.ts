export const timeAgo = (date: string | Date, isArabic: boolean = false): string => {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  const translations = {
    en: {
      year: 'year', years: 'years',
      month: 'month', months: 'months',
      week: 'week', weeks: 'weeks',
      day: 'day', days: 'days',
      hour: 'hour', hours: 'hours',
      minute: 'minute', minutes: 'minutes',
      second: 'second', seconds: 'seconds',
      ago: 'ago',
      justNow: 'just now'
    },
    ar: {
      year: 'سنة', years: 'سنوات',
      month: 'شهر', months: 'أشهر',
      week: 'أسبوع', weeks: 'أسابيع',
      day: 'يوم', days: 'أيام',
      hour: 'ساعة', hours: 'ساعات',
      minute: 'دقيقة', minutes: 'دقائق',
      second: 'ثانية', seconds: 'ثواني',
      ago: 'منذ',
      justNow: 'الآن'
    }
  };

  const t = isArabic ? translations.ar : translations.en;

  if (seconds < 10) {
    return t.justNow;
  }

  for (const [key, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      const unit = interval === 1 ? t[key as keyof typeof t] : t[`${key}s` as keyof typeof t];
      return isArabic ? `${t.ago} ${interval} ${unit}` : `${interval} ${unit} ${t.ago}`;
    }
  }

  return t.justNow;
};
