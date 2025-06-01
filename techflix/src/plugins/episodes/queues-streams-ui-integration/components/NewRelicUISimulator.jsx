import React from 'react'

const NewRelicUISimulator = ({ view, theme, children }) => {
  return (
    <div className={`newrelic-ui-simulator ${theme}`}> 
      <div className="ui-view" data-view={view}>
        {children}
      </div>
    </div>
  )
}

export default NewRelicUISimulator
