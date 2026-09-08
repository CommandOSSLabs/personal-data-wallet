import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, it } from 'vitest'
import { PlaygroundStep } from './PlaygroundStep'

function Harness() {
    const [openId, setOpenId] = useState<string | null>(null)
    return (
        <>
            <PlaygroundStep
                id="one"
                openId={openId}
                onToggle={setOpenId}
                number={1}
                title="store artifact"
                description="encrypt a file"
                code="await memwal.storeArtifact(file)"
                onRun={() => undefined}
            />
            <PlaygroundStep
                id="two"
                openId={openId}
                onToggle={setOpenId}
                number={2}
                title="get artifact"
                description="download the file"
                code="await memwal.getArtifact(id)"
                onRun={() => undefined}
            />
        </>
    )
}

it('accordion expands one section at a time', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.queryByRole('button', { name: 'Run' })).toBeNull()
    await user.click(screen.getByRole('button', { name: /store artifact/i }))
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument()
    expect(document.body.textContent).toMatch(/storeArtifact/)
    await user.click(screen.getByRole('button', { name: /get artifact/i }))
    expect(document.body.textContent).not.toMatch(/storeArtifact/)
    expect(document.body.textContent).toMatch(/getArtifact/)
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument()
})
