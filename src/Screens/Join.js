import React, { useState } from "react";
import firebase from "../Config/Firebase";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import { useParams } from "react-router-dom";

export default ({ history, user }) => {
  const db = firebase.firestore();
  const { id } = useParams();
  const [joinID, setJoinID] = useState(id);

  const joinRoom = () => {
    if (joinID !== null && joinID !== "") {
      db.collection("rooms")
        .doc(joinID)
        .get()
        .then((room) => {
          // Check if room exists
          if (room.exists) {
            // Check room isn't locked
            if (room.data().locked) {
              console.log("Room locked!");
            } else {
              // Check room isn't active
              if (room.data().active) {
                console.log("Room active!");
              } else {
                // Check if current user already joined
                if (
                  room
                    .data()
                    .players.some(
                      (player) => player.uid === firebase.auth().currentUser.uid
                    )
                ) {
                  history.push(`/game/${joinID}`);
                } else {
                  // Check room has space
                  if (room.data().players.length >= 100) {
                    console.log("Room is full!");
                  } else {
                    // Update players

                    let players = room.data().players;
                    players.push({
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
                    });
                    // Join room
                    db.collection("rooms")
                      .doc(joinID)
                      .update({
                        players: players,
                      })
                      .then((race) => {
                        // Redirect to room
                        history.push(`/game/${joinID}`);
                      })
                      .catch(function (error) {
                        console.error(error);
                      });
                  }
                }
              }
            }
          } else {
            console.log("Invalid ID");
          }
        });
    }
  };

  return (
    <>
      <Header />
      <section>
        <input
          type="text"
          placeholder="Room Code"
          value={joinID}
          onChange={(e) => setJoinID(e.target.value)}
        />
        <button disabled={!joinID} onClick={joinRoom}>
          Join Game
        </button>
        <Link className="button button-secondary" to="/">
          Cancel
        </Link>
      </section>
    </>
  );
};
