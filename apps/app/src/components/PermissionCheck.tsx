export function PermissionCheck({
    checked,
    disabled,
    label,
    hint,
    onChange,
}: {
    checked: boolean
    disabled?: boolean
    label: string
    hint?: string
    onChange: (next: boolean) => void
}) {
    return (
        <label className="dashboard-perm-check">
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked)}
            />
            <span className="dashboard-perm-check-box" aria-hidden="true" />
            <span className="dashboard-perm-check-text">
                {label}
                {hint ? <span className="dashboard-perm-check-hint">{hint}</span> : null}
            </span>
        </label>
    )
}
