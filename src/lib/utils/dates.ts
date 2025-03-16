const farsiTimeUnits = {
  second: 'ثانیه',
  seconds: 'ثانیه',
  minute: 'دقیقه',
  minutes: 'دقیقه',
  hour: 'ساعت',
  hours: 'ساعت',
  day: 'روز',
  days: 'روز',
  month: 'ماه',
  months: 'ماه',
  year: 'سال',
  years: 'سال',
};

export const formatDistanceToNow = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const timeUnits = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ];

  for (const { unit, seconds } of timeUnits) {
    const value = Math.floor(diffInSeconds / seconds);
    if (value >= 1) {
      const farsiValue = convertToFarsiNumber(value);
      const farsiUnit = farsiTimeUnits[value === 1 ? unit : `${unit}s`];
      return `${farsiValue} ${farsiUnit} پیش`;
    }
  }

  return 'همین الان';
};