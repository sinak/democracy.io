import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  initialDelay?: number;
  skipAnimation?: boolean;
}

export function TypewriterText({
  text,
  speed = 30,
  initialDelay = 500,
  skipAnimation = false,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState(skipAnimation ? text : '');
  const [finished, setFinished] = useState(skipAnimation);

  useEffect(() => {
    if (skipAnimation) {
      setDisplayed(text);
      setFinished(true);
      return;
    }

    setDisplayed('');
    setFinished(false);

    let interval: ReturnType<typeof window.setInterval> | undefined;

    const delayTimer = setTimeout(() => {
      let i = 0;
      interval = window.setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          window.clearInterval(interval);
          setFinished(true);
        }
      }, speed);
    }, initialDelay);

    return () => {
      clearTimeout(delayTimer);
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [text, speed, initialDelay, skipAnimation]);

  return (
    <h1 className={finished ? 'hasFinishedTyping' : ''}>
      <span>{displayed}</span>
    </h1>
  );
}
