import React, { useEffect, useState } from "react";
import Die from "./components/Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const App = () => {
  const [dice, setDice] = useState(allNewDice);
  const [tenzies, setTenzies] = useState(false);
  const [turns, setTurns] = useState(0);

  useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every((die) => die.value === firstValue);
    if (allHeld && allSameValue) {
      setTenzies(true);
      console.log("You won!");
    }
  }, [dice]);

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    };
  }

  function allNewDice() {
    let newDice = [];

    for (let i = 1; i <= 12; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }

  function roll() {
    if (!tenzies) {
      setDice((oldDice) =>
        oldDice.map((die) => {
          return die.isHeld ? die : generateNewDie();
        })
      );
      setTurns((prevCount) => prevCount + 1);
    } else {
      setTenzies(false);
      setDice(allNewDice());
      setTurns(0);
    }
  }

  function holdDice(id) {
    setDice((oldDice) => {
      return oldDice.map((die) => {
        if (die.id === id) {
          return { ...die, isHeld: !die.isHeld };
        } else {
          return die;
        }
      });
    });
  }

  const diceElements = dice.map((die) => {
    return (
      <Die
        holdDice={() => holdDice(die.id)}
        value={die.value}
        key={die.id}
        isHeld={die.isHeld}
      />
    );
  });

  const { width, height } = useWindowSize();

  return (
    <main>
      {tenzies && <Confetti width={width} height={height} />}
      <h1 className="title">Twelvezies</h1>
      <p className="instructions">
        Roll until all dice are the same. Click each die to freeze it at its
        current value between rolls.
      </p>
      <h2 className="turns">Number of turns: {turns}</h2>
      <section className="dices">{diceElements}</section>
      <button className="roll" onClick={roll}>
        {tenzies ? "New Game" : "Roll"}
      </button>
    </main>
  );
};

export default App;
