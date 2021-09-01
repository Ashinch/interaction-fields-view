import React from 'react'
import ReactDOM from 'react-dom'
import Home from './page/Home'
import { CssBaseline, GeistProvider } from '@geist-ui/react'
import { BrowserRouter, Route, Switch } from "react-router-dom"
import Fields from "./page/Fields"

ReactDOM.render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline />
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/fields/:code" component={Fields} />
        </Switch>
      </BrowserRouter>
    </GeistProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
