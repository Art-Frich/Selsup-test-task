import React from 'react'
import ReactDOM from 'react-dom/client'
import ParamEditor from './ParamEditor'
import { model, params } from './constants'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ParamEditor params={params} model={model} />
  </React.StrictMode>,
)
