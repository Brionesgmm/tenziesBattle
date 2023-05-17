import React from "react";
import Die from "./components/Die";

const App = () => {
  function allNewDice() {
    let newDice = [];
    for (let i = 1; i <= 10; i++) {
      newDice.push(Math.ceil(Math.random() * 6));
    }
    return newDice;
  }
  allNewDice();
  return (
    <main>
      <section className="dices">
        <Die value={1} />
        <Die value={1} />
        <Die value={1} />
        <Die value={1} />
        <Die value={1} />
        <Die value={1} />
        <Die value={1} />
        <Die value={1} />
        <Die value={1} />
        <Die value={1} />
      </section>
    </main>
  );
};

export default App;
