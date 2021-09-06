import React from 'react'
import ReactDOM from 'react-dom'
import Home from './page/home'
import { CssBaseline, GeistProvider } from '@geist-ui/react'
import { BrowserRouter, Route, Switch } from "react-router-dom"
import Fields from "./page/fields"

ReactDOM.render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline />
      <BrowserRouter>
        <Route exact path="/" component={Home} />
        <Route path="/fields/:code" component={Fields} />
      </BrowserRouter>
    </GeistProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
