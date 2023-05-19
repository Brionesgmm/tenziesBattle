import React, { useEffect, useState } from "react";
import Die from "./components/Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import useSocket from "./useSocket";

const App = () => {
  console.log("App component is rendering");
  const [dice, setDice] = useState(allNewDice);
  const [tenzies, setTenzies] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [opponentId, setOpponentId] = useState(null);
  const [isReady, setIsReady] = useState(false);

  console.log("opponentId:", opponentId);
  console.log("tenzies:", tenzies);

  const socket = useSocket("http://localhost:3001");

  useEffect(() => {
    if (socket == null) return;

    socket.on("gameStart", ({ opponentId }) => {
      setIsSearching(false);
      setOpponentId(opponentId);
      setIsReady(false); // Reset ready state.
      console.log(`A game has started between you and ${opponentId}`);
    });

    socket.on("dice", ({ dice }) => {
      console.log("New dice:", dice);
      setDice(dice.map((value) => ({ value, isHeld: false, id: nanoid() })));
    });

    socket.on("opponentDisconnected", () => {
      setOpponentId(null);
      setIsReady(false); // Reset your own ready state.
      console.log("Your opponent has disconnected");
    });

    socket.on("toggleReady", ({ isReady }) => {
      setIsReady(isReady);
    });

    return () => {
      socket.off("gameStart");
      socket.off("dice");
      socket.off("opponentDisconnected");
      socket.off("toggleReady");
    };
  }, [socket, opponentId, isSearching, isReady]);

  const handleReady = () => {
    setIsReady(true);
    socket.emit("playerReady");
  };

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    };
  }

  function allNewDice() {
    let newDice = [];

    for (let i = 1; i <= 10; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }

  // Inside the roll function in App.js
  function roll() {
    if (isReady && opponentId != null) {
      socket.emit("roll");
      setIsReady(false);
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
      <h1 className="title">Tenzies</h1>
      <p className="instructions">
        Roll until all dice are the same. Click each die to freeze it at its
        current value between rolls.
      </p>
      <section className="dices">{diceElements}</section>
      <button className="roll" onClick={roll} disabled={!opponentId}>
        {tenzies ? "New Game" : "Roll"}
      </button>
      <button
        onClick={() => {
          if (isSearching) {
            setIsSearching(false);
            socket.emit("stopSearch");
          } else {
            setIsSearching(true);
            socket.emit("searchGame");
          }
        }}
      >
        {isSearching ? "Stop Searching" : "Search for Game"}
      </button>
      {opponentId && <p>You are playing against: {opponentId}</p>}
      <button onClick={handleReady} disabled={!opponentId || tenzies}>
        {isReady ? "Waiting for other player..." : "Ready"}
      </button>
    </main>
  );
};

export default App;
