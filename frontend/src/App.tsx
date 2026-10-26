import type {ErrorInfo, ReactNode} from 'react'
import {Component} from 'react'
import {AppRoutes} from './routes/AppRoutes'

/**
 * Keeps a render error from leaving a blank page: the router and the provider tree live in
 * main.tsx, so the boundary sits here, just inside them.
 */
class ScreenErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    state = {error: null as Error | null}

    static getDerivedStateFromError(error: Error) {
        return {error}
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[tms] render error', error, info.componentStack)
    }

    render() {
        if (!this.state.error) return this.props.children
        return (
            <div className="grid min-h-svh place-items-center bg-cream p-6">
                <div className="card max-w-lg p-6">
                    <h1 className="font-temple text-[1.3rem] text-sage-900">Something went wrong on this screen</h1>
                    <p className="mt-2 text-[0.9rem] text-ink-soft">
                        The page failed to render. Reload to continue - the demo keeps no state, so nothing is lost.
                    </p>
                    <pre
                        className="mono mt-3 overflow-x-auto rounded-lg bg-cream-deep p-3 text-[0.72rem] text-ink-soft">
                        {this.state.error.message}
                    </pre>
                    <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Reload</button>
                </div>
            </div>
        )
    }
}

const App = () => (
    <ScreenErrorBoundary>
        <AppRoutes/>
    </ScreenErrorBoundary>
)

export default App