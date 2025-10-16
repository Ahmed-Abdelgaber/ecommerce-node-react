import { useEffect, useRef } from "react";

export function useIntersectionObserver(callback, options) {
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        callback(entry);
      }
    }, options);

    observer.observe(target);
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
}
