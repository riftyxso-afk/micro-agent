import { useEffect, useState } from "react";

/**
 * Progressively reveals `text` like a typewriter.
 * Returns { displayed, done }.
 */
export const useTypewriter = (text, speed = 38, startDelay = 600) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let interval = null;
    setDisplayed("");
    setDone(false);

    const timeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          interval = null;
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
};
