import React from "react";

const Die = ({ value, isHeld, holdDice, id }) => {
  return (
    <section className="dieGroup" onClick={holdDice}>
      <h1 className={isHeld ? "hold die" : "die"}>{value}</h1>
    </section>
  );
};

export default Die;
