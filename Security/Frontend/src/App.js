import React from 'react'
import SecurityGroup from './components/security-group'
import Waf from './components/waf'
import Error from './components/error.js'
import Home from './components/home.js'
import NavBar from './components/navbar.js'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { withAuthenticator } from "@aws-amplify/ui-react";

function App() {
  return (
    <Router>
      <NavBar />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/security-group">
            <SecurityGroup />
        </Route>
        <Route exact path="/waf">
          <Waf />
        </Route>
        <Route path="*">
          <Error />
        </Route>
      </Switch>
    </Router>
  )
}

export default withAuthenticator(App)
