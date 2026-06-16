import React from "react";
import Typewriter from "typewriter-effect";

function Type() {
  return (
    <Typewriter
      options={{
        strings: [
          // "Software Developer",
          // "Freelancer",
          // "MERN Stack Developer",
          // "Open Source Contributor",
          "Empathy",
          "Transparency",
          "Support",
          "Inclusion",
        ],
        autoStart: true,
        loop: true,
        deleteSpeed: 100,
      }}
    />
  );
}

export default Type;
