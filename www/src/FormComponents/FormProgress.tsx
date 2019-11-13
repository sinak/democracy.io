import React from "react";
import { useLocation } from "react-router-dom";
import Typewriter from "./Typewriter";
import ProgressBar from "./ProgressBar";

export default function FormProgress() {
  const messages: { [key: string]: string } = {
    "/": "Write to your representatives",
    "/pick-legislators": " Who do you want to write to?",
    "/message": "Write your message"
  };

  let loc = useLocation();

  const message = messages[loc.pathname] ? messages[loc.pathname] : "";
  return (
    <div>
      <Typewriter message={message} />
      <ProgressBar />
    </div>
  );
}
