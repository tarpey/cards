import React from "react";
import { Link } from "react-router-dom";
import logo from "../Images/logo.png";

export default ({ theme, toggleTheme, history }) => {
  return (
    <header>
      <Link to="/">
        <img src={logo} alt="Cards" />
      </Link>
    </header>
  );
};
