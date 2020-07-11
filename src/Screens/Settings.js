import React, { useState } from "react";
import firebase from "../Config/Firebase";
import { Link } from "react-router-dom";
import Header from "../Components/Header";

export default ({ history, user }) => {
  const currentName = firebase.auth().currentUser.displayName;
  const [newName, setNewName] = useState(currentName);

  const updateName = () => {
    if (newName !== null && newName !== "" && currentName !== newName) {
      firebase.auth().currentUser.updateProfile({
        displayName: newName,
      });
    }
    history.push("/");
  };

  return (
    <>
      <Header />
      <section>
        <input
          type="text"
          placeholder="Enter Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button disabled={!newName} onClick={updateName}>
          Save
        </button>
        <Link className="button button-secondary" to="/">
          Cancel
        </Link>
      </section>
    </>
  );
};
