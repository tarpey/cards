import React, { useState, useEffect } from "react";
import firebase from "../Config/Firebase";
import { useParams } from "react-router-dom";
import Card from "../Components/Card";
import Loading from "../Components/Loading";
import Toggle from "../Components/Toggle";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

export default ({ history }) => {
  const db = firebase.firestore();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState([]);
  const [locked, setLocked] = useState(false);
  const [theme, setTheme] = useState(false);
  const [themeID, setThemeID] = useState(false);
  const [themeIndex, setThemeIndex] = useState(false);
  const [newTheme, setNewTheme] = useState(false);
  const [host, setHost] = useState();
  const [players, setPlayers] = useState([]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [gameTarget, setGameTarget] = useState();
  const [winner, setWinner] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [damage, setDamage] = useState(false);
  const { width, height } = useWindowSize();
  const [direction, setDirection] = useState(true);

  // Init
  useEffect(() => {
    // Fetch data from DB
    let unsubscribe = db
      .collection("rooms")
      .doc(id)
      .onSnapshot((room) => {
        if (room.exists) {
          // Check room isn't locked
          if (room.data().locked) {
            history.push(`/`);
          } else {
            // Check room isn't active
            if (room.data().active) {
              console.log("Room active!");
              history.push(`/`);
            } else {
              // Check room has space
              if (room.data().players.length >= 100) {
                //console.log("Room is full!");
                //history.push(`/`);
              } else {
                // Fetch game theme
                db.collection("themes")
                  .doc(room.data().theme.id)
                  .get()
                  .then((theme) => {
                    let currentThemeID = theme.id;
                    setTheme(theme.data());
                    setThemeID(currentThemeID);
                    // Init game
                    setLocked(room.data().locked);
                    setHost(room.data().host);
                    setPlayers(room.data().players);
                    setActivePlayer(room.data().activePlayer);
                    setGameTarget(room.data().target);
                    setWinner(room.data().winner);
                    setDamage(room.data().damage);
                    setDirection(room.data().direction);
                    // Fetch all themes so host can switch
                    let availableThemes = [];
                    db.collection("themes")
                      .where("active", "==", true)
                      .orderBy("name")
                      .get()
                      .then((results) => {
                        results.forEach((theme) => {
                          availableThemes.push({
                            id: theme.id,
                            value: theme.ref,
                            label: theme.data().name,
                          });
                        });
                        setThemes(availableThemes);
                        // Get index of current theme
                        setThemeIndex(
                          availableThemes.findIndex(
                            (availableTheme) =>
                              availableTheme.id === currentThemeID
                          )
                        );
                        // Finished loading
                        setLoading(false);
                      });
                  });
              }
            }
          }
        } else {
          // Invalid ID - Redirect
          history.push(`/`);
        }
      });
    return () => unsubscribe;
  }, []);

  const nextPlayer = (currentPlayer, direction) => {
    console.log(currentPlayer, direction);
    if (direction) {
      if (currentPlayer !== players.length - 1) {
        if (players[currentPlayer + 1].active) {
          setActivePlayer(currentPlayer + 1);
          db.collection("rooms")
            .doc(id)
            .update({
              activePlayer: currentPlayer + 1,
            });
        } else {
          nextPlayer(currentPlayer + 1, true);
        }
      } else {
        if (players[0].active) {
          db.collection("rooms").doc(id).update({
            activePlayer: 0,
          });
        } else {
          nextPlayer(0, true);
        }
      }
    } else {
      if (currentPlayer === 0) {
        if (players[players.length - 1].active) {
          setActivePlayer(players.length);
          db.collection("rooms")
            .doc(id)
            .update({
              activePlayer: players.length - 1,
            });
        } else {
          nextPlayer(players.length - 1, false);
        }
      } else {
        if (players[currentPlayer - 1].active) {
          setActivePlayer(currentPlayer + 1);
          db.collection("rooms")
            .doc(id)
            .update({
              activePlayer: currentPlayer - 1,
            });
        } else {
          nextPlayer(currentPlayer - 1, false);
        }
      }
    }
  };

  const drawCard = (special) => {
    // Get random number
    let cardValue = Math.floor(Math.random() * 10);

    // Check for curve ball
    if (special) {
      cardValue = special;
      if (special === 10) {
        // 50% health
        players[activePlayer].skills.health = false;
        players[activePlayer].score = Math.floor(
          players[activePlayer].score / 2
        );
        players[activePlayer].score =
          players[activePlayer].score < 1 ? 0 : players[activePlayer].score;
      } else if (special === 11) {
        // Prep damage
        players[activePlayer].skills.damage = false;
        db.collection("rooms").doc(id).update({
          damage: true,
        });
      } else if (special === 12) {
        // Guaranteed zero
        players[activePlayer].skills.zero = false;
      } else if (special === 13) {
        // Guaranteed zero
        console.log("Reverse", direction, "=>", !direction);
        setDirection(!direction);
        players[activePlayer].skills.reverse = false;
      }
    } else {
      // Check for damage
      if (damage === true) {
        setDamage(false);
        // Reset damage
        db.collection("rooms").doc(id).update({
          damage: false,
        });
        cardValue = 9;
      }
      players[activePlayer].score = players[activePlayer].score + cardValue;
    }

    // Update scores
    players[activePlayer].cards.push(cardValue);

    // Check for targets
    if (players[activePlayer].score >= gameTarget) {
      players[activePlayer].active = false;
      setPlayers(players);
    }

    db.collection("rooms")
      .doc(id)
      .update({
        direction: special === 13 ? !direction : direction,
        players: players,
      })
      .then(() => {
        // Update active player
        nextPlayer(activePlayer, special === 13 ? !direction : direction);

        // Check for winner
        let activePlayers = players.filter((player) => player.active === true);
        if (activePlayers.length === 1) {
          console.log("We have a winner", activePlayers[0]);
          db.collection("rooms").doc(id).update({
            winner: activePlayers[0].uid,
          });
        }
      });
  };

  const leaveGame = () => {
    if (window.confirm("Are you sure you want to leave the game?"))
      history.push(`/`);
  };

  const resetGame = () => {
    players.forEach((player, index) => {
      player.active = true;
      player.score = 0;
      player.cards = [];
      player.skills = { health: true, damage: true, zero: true, reverse: true };
    });
    db.collection("rooms").doc(id).update({
      activePlayer: 0,
      direction: true,
      players: players,
      winner: false,
      damage: false,
    });
  };

  const changeSettings = () => {
    setShowMenu(!showMenu);
    // Only the host can change game settings
    if (host === firebase.auth().currentUser.uid) {
      // Theme changed
      if (themeID !== newTheme.id) {
        db.collection("rooms").doc(id).update({
          theme: newTheme,
        });
      }
      // Lock changed
      db.collection("rooms").doc(id).update({
        locked: locked,
      });
    }
  };

  return loading || !themes.length || !theme || !host ? (
    <Loading />
  ) : (
    <section>
      <div className="modal" style={{ display: showMenu ? "grid" : "none" }}>
        <div className="modal-container">
          {host === firebase.auth().currentUser.uid && (
            <>
              <div>
                <Toggle
                  label="Theme"
                  options={themes}
                  selected={themeIndex}
                  onChange={(option) => setNewTheme(option.value)}
                />
              </div>
              <div>
                <button onClick={() => setLocked(!locked)}>
                  {locked ? "Unlock Room" : "Lock Room"}
                </button>
              </div>
              <div>
                <button onClick={resetGame}>Reset Game</button>
              </div>
            </>
          )}
          <div>
            <button onClick={leaveGame}>Leave Game</button>
          </div>
          <div>
            <button className="button-secondary" onClick={changeSettings}>
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="menu">
        <div>
          <p>Room ID: {id}</p>
        </div>
        <div>
          <svg viewBox="0 0 24 24" onClick={() => setLocked(!locked)}>
            {locked ? (
              <path
                fill="currentColor"
                d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
              />
            ) : (
              <path
                fill="currentColor"
                d="M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z"
              />
            )}
          </svg>
          <svg viewBox="0 0 24 24" onClick={() => setShowMenu(!showMenu)}>
            <path
              fill="currentColor"
              d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
            />
          </svg>
        </div>
      </div>
      <div className="players">
        {players.map((player, index) => (
          <>
            {winner === firebase.auth().currentUser.uid && (
              <Confetti width={width} height={1000} style={{ zIndex: 999 }} />
            )}
            <div
              key={index}
              className={`player ${index === activePlayer ? "active" : null} ${
                player.score >= gameTarget ? "out" : null
              }`}
            >
              {!winner &&
                index === activePlayer &&
                player.uid !== firebase.auth().currentUser.uid && (
                  <div className="player-loading">
                    <Loading />
                  </div>
                )}
              <div className="player-top">
                <div className="player-name">
                  {player.name}
                  {winner === player.uid && (
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"
                      />
                    </svg>
                  )}
                </div>
                <div className="player-score">
                  {`${player.score}/${gameTarget}`}
                </div>
              </div>
              <div className="player-health">
                <div
                  className="health-bar"
                  style={{
                    background:
                      (player.score / gameTarget) * 100 > 75
                        ? "#EA6060"
                        : (player.score / gameTarget) * 100 > 50
                        ? "#EA9A60"
                        : "#60EA76",
                    width: (player.score / gameTarget) * 100 + "%",
                  }}
                />
              </div>
              {players.length > 1 && (
                <div className="player-cards">
                  {player.cards.length ? (
                    player.cards
                      .map((card, index) => (
                        <Card
                          key={index}
                          zIndex={index}
                          value={card}
                          image={
                            theme.values[card] ? theme.values[card] : false
                          }
                          zero={player.skills.zero}
                        />
                      ))
                      .reverse()
                  ) : (
                    <Card first />
                  )}
                </div>
              )}
              {player.uid === firebase.auth().currentUser.uid && (
                <div
                  className={`player-actions ${
                    players.length < 2 ? "waiting" : null
                  }`}
                >
                  <button
                    className="button-small"
                    disabled={
                      players.length < 2 ||
                      winner ||
                      index !== activePlayer ||
                      player.uid !== firebase.auth().currentUser.uid
                    }
                    onClick={() => drawCard(false)}
                  >
                    {index === activePlayer &&
                    player.uid !== firebase.auth().currentUser.uid ? (
                      <Loading />
                    ) : players.length < 2 ? (
                      "Waiting for players"
                    ) : (
                      "Draw"
                    )}
                  </button>
                  {players.length > 1 && (
                    <>
                      <button
                        disabled={
                          players.length < 2 ||
                          winner ||
                          index !== activePlayer ||
                          player.uid !== firebase.auth().currentUser.uid ||
                          !player.skills.health ||
                          damage
                        }
                        onClick={() => drawCard(10)}
                      >
                        <span>♥️</span>
                      </button>
                      <button
                        disabled={
                          players.length < 2 ||
                          winner ||
                          index !== activePlayer ||
                          player.uid !== firebase.auth().currentUser.uid ||
                          !player.skills.damage ||
                          damage
                        }
                        onClick={() => drawCard(11)}
                      >
                        💣
                      </button>
                      <button
                        disabled={
                          players.length < 2 ||
                          winner ||
                          index !== activePlayer ||
                          player.uid !== firebase.auth().currentUser.uid ||
                          !player.skills.zero ||
                          damage
                        }
                        onClick={() => drawCard(12)}
                      >
                        🙏
                      </button>
                      <button
                        disabled={
                          players.length < 2 ||
                          winner ||
                          index !== activePlayer ||
                          player.uid !== firebase.auth().currentUser.uid ||
                          !player.skills.reverse ||
                          damage
                        }
                        onClick={() => drawCard(13)}
                      >
                        🔄
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        ))}
      </div>
    </section>
  );
};
