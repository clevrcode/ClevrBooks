
export default function useMoneyUtilities() {
    function getMoneyString(val) {
        if (val > -0.01 && val < 0.01) {
            return "0.00"
        }
        return val.toLocaleString(undefined, {minimumFractionDigits: 2})
    }
    function isNegative(val) {
        return val <= -0.01
    }

    return {
        getMoneyString, isNegative
    }
}

