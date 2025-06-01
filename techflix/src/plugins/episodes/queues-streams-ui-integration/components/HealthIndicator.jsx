import React from 'react'

const HealthIndicator = ({ queue }) => {
  const healthy = queue['queue.depth'] < 500
  const color = healthy ? 'text-green-400' : 'text-red-500'
  return <div className={color}>{healthy ? 'Healthy' : 'Warning'}</div>
}

export default HealthIndicator
