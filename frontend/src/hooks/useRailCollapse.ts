import {useState} from 'react'

/**
 * Desktop rail collapse state, remembered per browser. Uses the same storage key as AppShell so the
 * folded/expanded choice stays consistent when moving between the shell pages and the standalone
 * User Management / Family Members screens.
 */
export const useRailCollapse = () => {
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem('tms.rail.collapsed') === '1'
        } catch {
            return false
        }
    })

    const toggle = () => {
        setCollapsed((current) => {
            const next = !current
            try {
                localStorage.setItem('tms.rail.collapsed', next ? '1' : '0')
            } catch {
                /* private mode - collapsing still works for this session */
            }
            return next
        })
    }

    return {collapsed, toggle}
}