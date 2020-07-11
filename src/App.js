import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AuthProvider } from "./Config/Auth";
import Home from "./Screens/Home";
import New from "./Screens/New";
import Join from "./Screens/Join";
import Settings from "./Screens/Settings";
import How from "./Screens/How";
import Game from "./Screens/Game";
import "normalize.css";
import "./App.scss";

export default () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/new" component={New} />
          <Route path="/join/:id" component={Join} />
          <Route path="/join" component={Join} />
          <Route path="/settings" component={Settings} />
          <Route path="/how" component={How} />
          <Route path="/game/:id" component={Game} />
          <Route exact path="/" component={Home} />
        </Switch>
      </Router>
    </AuthProvider>
  );
};
