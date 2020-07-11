import React, { useState, useEffect } from "react";

export default ({ label, options, selected = 0, onChange }) => {
  const [selectedOption, setSelectedOption] = useState(options[selected]);

  const nextOption = (reverse = false) => {
    let index = options.findIndex(
      (option) => option.value === selectedOption.value
    );
    setSelectedOption(
      reverse
        ? index === 0
          ? options[options.length - 1]
          : options[index - 1]
        : index < options.length - 1
        ? options[index + 1]
        : options[0]
    );
  };

  // Init
  useEffect(() => {
    onChange(selectedOption);
  }, [selectedOption, onChange]);

  return (
    <div>
      <div className="toggle button">
        <div className="toggle-left">
          <span onClick={() => nextOption(true)}>&lt;</span>
        </div>
        <div className="toggle-middle">
          <div className="toggle-label">{label}</div>
          <div className="toggle-selected">{selectedOption.label}</div>
        </div>
        <div className="toggle-right">
          <span onClick={() => nextOption(false)}>&gt;</span>
        </div>
      </div>
    </div>
  );
};
