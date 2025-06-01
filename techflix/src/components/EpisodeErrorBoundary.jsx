import React from 'react'
import { Info } from 'lucide-react'

class EpisodeErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Episode Error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-red-500 p-8 z-50">
          <Info className="w-12 h-12 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Episode Loading Error</h2>
          <p className="text-center mb-4">
            An error occurred while loading this episode. Please try refreshing the page.
          </p>
          <details className="max-w-2xl w-full bg-gray-900 p-4 rounded-lg">
            <summary className="cursor-pointer text-gray-400 mb-2">
              Technical Details
            </summary>
            <pre className="text-sm text-red-300 bg-black/50 p-4 rounded overflow-auto">
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          {this.props.onBack && (
            <button 
              onClick={this.props.onBack} 
              className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default EpisodeErrorBoundary