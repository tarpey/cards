import React, { useState, useEffect } from "react";
import firebase from "../Config/Firebase";
import {} from "../Config/Auth";
import { Link } from "react-router-dom";
import Loading from "../Components/Loading";
import Toggle from "../Components/Toggle";
import Header from "../Components/Header";

export default ({ history }) => {
  const db = firebase.firestore();
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState([]);
  const targets = [
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 50, label: 50 },
  ];
  const [chosenTarget, setChosenTarget] = useState();
  const [chosenTheme, setChosenTheme] = useState();

  // Init
  useEffect(() => {
    // Fetch available themes
    let availableThemes = [];
    db.collection("themes")
      .where("active", "==", true)
      .orderBy("name")
      .get()
      .then((results) => {
        results.forEach((theme) => {
          availableThemes.push({ value: theme.ref, label: theme.data().name });
        });
        setThemes(availableThemes);
        setChosenTarget(targets[0].value);
        setChosenTheme(availableThemes[0].value);
        setLoading(false);
      });
  }, []);

  const newRoom = () => {
    // Generate a four digit ID
    let id = Math.floor(1000 + Math.random() * 9000).toString();

    // Create a new room
    db.collection("rooms")
      .doc(id)
      .get()
      .then((room) => {
        // Check room doesn't already exist
        if (!room.exists) {
          db.collection("rooms")
            .doc(id)
            .set({
              active: false,
              activePlayer: 0,
              created: new Date(),
              direction: true,
              host: firebase.auth().currentUser.uid,
              locked: false,
              players: [
                {
                  active: true,
                  cards: [],
                  name: firebase.auth().currentUser.displayName,
                  score: 0,
                  skills: {
                    health: true,
                    damage: true,
                    zero: true,
                    reverse: true,
                  },
                  uid: firebase.auth().currentUser.uid,
                },
              ],
              target: chosenTarget,
              theme: chosenTheme,
              winner: false,
            })
            .then((race) => {
              // Redirect to room
              history.push(`/game/${id}`);
            })
            .catch(function (error) {
              // Room already exists
              console.error("Room not created!", error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return loading || !themes.length ? (
    <Loading />
  ) : (
    <>
      <Header />
      <section>
        <Toggle
          label="Target"
          options={targets}
          onChange={(option) => setChosenTarget(option.value)}
        />
        <Toggle
          label="Theme"
          options={themes}
          onChange={(option) => setChosenTheme(option.value)}
        />
        <button onClick={newRoom}>Start</button>
        <Link className="button button-secondary" to="/">
          Cancel
        </Link>
      </section>
    </>
  );
};
