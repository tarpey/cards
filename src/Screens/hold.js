<p className="divider">
        <span>OR</span>
      </p>

{host === firebase.auth().currentUser.uid && (
    <div onClick={resetGame}>Reset Game</div>
  )}
  <p>Target: {gameTarget}</p>
  <p>Room ID: {id}</p>

<div className="skills">
  {player.skills && (
    <select>
      <option value="-1">Skill...</option>
      {player.skills.map((skill, index) => (
        <option value={skill}>{skill}</option>
      ))}
    </select>
  )}
</div>;


<button
disabled={
  players.length < 2 ||
  winner ||
  index !== activePlayer ||
  player.uid !== firebase.auth().currentUser.uid
}
onClick={drawCard}
>
{index === activePlayer &&
player.uid !== firebase.auth().currentUser.uid ? (
  <Loading />
) : (
  "Curve Ball"
)}
</button>