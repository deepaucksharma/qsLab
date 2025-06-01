import React from 'react'

const MetricsChart = ({ metric, data }) => (
  <div className="metrics-chart">
    <strong>{metric}</strong>
    <pre>{JSON.stringify(data)}</pre>
  </div>
)

export default MetricsChart
