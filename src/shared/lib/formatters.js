export const fN = (n, d = 0) =>
  n.toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });

export const fM = (n, d = 1) => `${fN(n / 1e6, d)} млн`;
export const fG = (n, d = 2) => `${fN(n, d)} грн`;
