import { useState, useEffect } from "react";

/**
 * 디바운스 훅 - 값이 변경된 후 지정된 시간이 지나면 디바운스된 값을 반환
 * @param {any} value - 디바운스할 값
 * @param {number} delay - 지연 시간 (ms)
 * @returns {any} - 디바운스된 값
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
