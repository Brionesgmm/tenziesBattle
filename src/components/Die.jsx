import React from "react";

const Die = ({ value }) => {
  return (
    <section className="dieGroup">
      <h1 className="die">{value}</h1>
    </section>
  );
};

export default Die;
