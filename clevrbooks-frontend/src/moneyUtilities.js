export default function useMoneyUtilities() {
  function getMoneyString(val) {
    if (val > -0.01 && val < 0.01) {
      return '0.00'
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 2 })
  }

  function isNegative(val) {
    return val <= -0.01
  }

  function validateStringAmount(str) {
    return str.search(/^\$?\d{0,3}?(,\d{3})*(\.\d{0,2})?$/) >= 0
  }

  return {
    getMoneyString,
    isNegative,
    validateStringAmount,
  }
}
