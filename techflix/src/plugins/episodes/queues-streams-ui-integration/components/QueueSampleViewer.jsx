import React from 'react'

const QueueSampleViewer = ({ sample }) => (
  <pre className="queue-sample-viewer">
    {JSON.stringify(sample, null, 2)}
  </pre>
)

export default QueueSampleViewer
