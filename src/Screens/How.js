import React from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header";

export default () => {
  return (
    <>
      <Header />
      <section>
        <p className="rules">
          The aim of the game is to keep your score down and below the target.
        </p>
        <p className="rules">Players take turns to draw cards.</p>
        <p className="rules">
          Use special cards to change the game and defeat your opponents.
        </p>
        <p className="rules">The last player standing wins!</p>
        <Link className="button button-secondary" to="/">
          Back
        </Link>
      </section>
    </>
  );
};
