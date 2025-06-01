import React from 'react'

const SeriesDetails = () => {
  return (
    <section className="series-details">
      <h2 className="details-header">More Details</h2>
      <div className="details-grid">
        <div className="details-main">
          <h3>About Tech Insights</h3>
          <p>Tech Insights is a revolutionary educational series that brings complex technology concepts to life through stunning visualizations and interactive experiences. Each episode dives deep into fundamental concepts that power modern software systems.</p>
          <p>From distributed systems to streaming architectures, our expert hosts guide you through the intricacies of modern technology with clarity and precision. Perfect for engineers looking to level up their understanding.</p>
        </div>
        <div className="details-sidebar">
          <div className="detail-item">
            <span className="detail-label">Cast:</span>
            <span className="detail-value">Sarah Chen, Mike Rodriguez, Dr. Emily Watson</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Genres:</span>
            <span className="detail-value">Technology, Educational, Interactive</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">This show is:</span>
            <span className="detail-value">TV-14</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Created by:</span>
            <span className="detail-value">TechFlix Studios</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SeriesDetails