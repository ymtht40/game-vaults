// Variable Mapping: Z -> formatPriceAmount, e -> amount, O -> EMAIL_REGEX

// NOTE: module id: 769149
export const formatPriceAmount = (amount) =>
  Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

// NOTE: module id: 769149
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;