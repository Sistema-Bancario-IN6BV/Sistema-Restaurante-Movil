import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * have passed without `value` changing.
 * @param {*} value - The value to debounce.
 * @param {number} delay - Debounce delay in milliseconds.
 * @returns {*} The debounced value.
 */
const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
};

export default useDebouncedValue;
