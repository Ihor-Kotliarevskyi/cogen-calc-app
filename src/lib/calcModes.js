// Реєстр типів калькуляторів EnergyROI
// Додайте новий запис сюди коли з'явиться новий модуль

export const CALC_MODES = [
  {
    key:       'cogen',
    label:     'КГУ',
    icon:      '🔥',
    title:     'Когенерація',
    available: true,
  },
  {
    key:       'solar',
    label:     'СЕС',
    icon:      '☀️',
    title:     'Сонячна електростанція',
    available: false, // coming soon
  },
];
