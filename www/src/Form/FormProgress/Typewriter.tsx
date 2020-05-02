import React, { useState, useEffect } from "react";
import classNames from "classnames";
import "./Typewriter.css";

interface TypewriterProps {
  message: string;
}

const DISPLAY_SPEED = 30;
const INITIAL_DELAY = 500;

export default function (props: TypewriterProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function animate() {
      // delay on first character
      if (currentIndex === 0) await sleep(INITIAL_DELAY);

      await sleep(DISPLAY_SPEED);

      if (currentIndex < props.message.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setFinished(true);
      }
    }

    animate();
  }, [currentIndex, props.message.length]);

  return (
    <h1
      className={classNames("typewriter serif text-center display-4", {
        hasFinishedTyping: finished,
      })}
    >
      <span>{props.message.slice(0, currentIndex)}</span>
    </h1>
  );
}
async function sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
