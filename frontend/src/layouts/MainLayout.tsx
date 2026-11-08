import type {ReactNode} from 'react'
import {AppShell} from './AppShell'
import type {MainLayoutProps} from '../types'

function MainLayout({children}: MainLayoutProps & { children: ReactNode }) {
    return <AppShell>{children}</AppShell>
}

export default MainLayout