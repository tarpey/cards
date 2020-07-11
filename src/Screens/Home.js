import React, { useState, useContext } from "react";
import firebase from "../Config/Firebase";
import { AuthContext } from "../Config/Auth";
import { Link } from "react-router-dom";
import Header from "../Components/Header";

export default () => {
  const [name, setName] = useState("");
  const { currentUser } = useContext(AuthContext);

  const login = (event) => {
    event.preventDefault();
    return firebase
      .auth()
      .signInAnonymously()
      .then(() => {
        firebase.auth().currentUser.updateProfile({
          displayName: name,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return currentUser ? (
    <>
      <Header />
      <section>
        <Link className="button" to="/new">
          New game
        </Link>

        <Link className="button" to="/join">
          Join game
        </Link>
        <Link className="button" to="/settings">
          Settings
        </Link>
        <button
          className="button-secondary"
          onClick={() => firebase.auth().signOut()}
        >
          Logout
        </button>
      </section>
    </>
  ) : (
    <>
      <Header />
      <section>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button disabled={!name} onClick={login}>
          Play
        </button>
      </section>
    </>
  );
};
