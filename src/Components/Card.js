import React from "react";

export default ({ zIndex, value, first = false, image }) => {
  const specialCard = (value) => {
    if (value === 10) {
      // 50% health
      return "♥️";
    } else if (value === 11) {
      // Deal damage
      return "💣";
    } else if (value === 12) {
      // Guanteed zero
      return "🙏";
    } else if (value === 13) {
      // Reverse
      return "🔄";
    }
  };
  return (
    <div
      className={`card ${first ? "first" : null}`}
      style={{ zIndex: zIndex }}
    >
      <div className="value">{value ? false : value}</div>
      <div>
        {value > 9 ? (
          specialCard(value)
        ) : image ? (
          <img src={image} alt="" />
        ) : (
          value
        )}
      </div>
    </div>
  );
};
