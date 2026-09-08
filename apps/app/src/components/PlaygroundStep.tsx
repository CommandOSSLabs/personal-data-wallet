import { type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'

SyntaxHighlighter.registerLanguage('javascript', js)

const walrusCodeTheme = {
    hljs: {
        color: '#faf8f5',
        background: '#050505',
    },
    'hljs-keyword': {
        color: '#cab1ff',
    },
    'hljs-built_in': {
        color: '#faf8f5',
    },
    'hljs-title': {
        color: '#faf8f5',
    },
    'hljs-attr': {
        color: '#e8ff75',
    },
    'hljs-property': {
        color: '#e8ff75',
    },
    'hljs-variable': {
        color: '#faf8f5',
    },
    'hljs-string': {
        color: '#e8ff75',
    },
    'hljs-comment': {
        color: '#8f9294',
    },
    'hljs-number': {
        color: '#e8ff75',
    },
    'hljs-literal': {
        color: '#e8ff75',
    },
    'hljs-params': {
        color: '#faf8f5',
    },
}

export { walrusCodeTheme }

interface PlaygroundStepProps {
    id: string
    openId: string | null
    onToggle: (id: string) => void
    number: number | string
    title: string
    description: string
    code?: string
    onRun?: () => void | Promise<void>
    runLabel?: string
    result?: string | null
    resultLabel?: string
    error?: string | null
    loading?: boolean
    highlight?: boolean
    hideRun?: boolean
    children?: ReactNode
}

export function PlaygroundStep({
    id,
    openId,
    onToggle,
    number,
    title,
    description,
    code,
    onRun,
    runLabel = 'Run',
    result = null,
    resultLabel = 'response',
    error = null,
    loading = false,
    highlight,
    hideRun,
    children,
}: PlaygroundStepProps) {
    const expanded = openId === id
    const hasOutput = Boolean(result || error)

    return (
        <div className={`card demo-step${expanded ? '' : ' demo-step--collapsed'}`}>
            <button
                type="button"
                className="demo-step-toggle-header"
                aria-expanded={expanded}
                onClick={() => onToggle(id)}
            >
                <div className="demo-step-header-row">
                    <div className={`demo-step-badge${highlight ? ' demo-step-badge--highlight' : ''}`}>
                        {number}
                    </div>
                    <div className="demo-step-toggle-copy">
                        <div className="card-title demo-step-title">{title}</div>
                        <div className="card-subtitle">{description}</div>
                    </div>
                </div>
                <ChevronDown
                    className={`demo-step-chevron${expanded ? ' demo-step-chevron--open' : ''}`}
                    size={22}
                    aria-hidden="true"
                />
            </button>
            {expanded && (
                <div className="demo-step-body">
                    {children}
                    {code != null && (
                        <div className={hasOutput ? 'demo-code-block--spaced' : ''}>
                            <SyntaxHighlighter
                                language="javascript"
                                style={walrusCodeTheme}
                                className="demo-code-block"
                                customStyle={{ margin: 0 }}
                            >
                                {code}
                            </SyntaxHighlighter>
                        </div>
                    )}
                    {!hideRun && onRun && (
                        <div className="demo-step-run-row">
                            <button
                                className={`btn btn-primary btn-sm${loading ? ' demo-run-button--loading' : ''}`}
                                onClick={onRun}
                                disabled={loading}
                            >
                                {loading ? <span className="spinner demo-button-spinner" /> : runLabel}
                            </button>
                        </div>
                    )}
                    {result && (
                        <div className="demo-result-panel">
                            <div className="demo-result-label">{resultLabel}</div>
                            <pre className="demo-result-pre">{result}</pre>
                        </div>
                    )}
                    {error && (
                        <div className="demo-error-panel">
                            <div className="demo-error-label">error</div>
                            <pre className="demo-error-pre">{error}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
