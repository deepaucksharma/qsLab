import React from 'react'

const AlertConditions = ({ queue }) => (
  <div className="alert-conditions">
    <p>Alerting on queue: {queue['queue.name']}</p>
  </div>
)

export default AlertConditions
