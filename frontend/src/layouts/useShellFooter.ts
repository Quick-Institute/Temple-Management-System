import type {ComponentType} from 'react'
import {createContext, useContext, useEffect} from 'react'

export type ShellFooter = ComponentType

export const ShellFooterContext = createContext<(footer: ShellFooter | null) => void>(() => {
})

export const useShellFooter = (Footer: ShellFooter): void => {
    const setFooter = useContext(ShellFooterContext)
    useEffect(() => {
        setFooter(Footer)
        return () => setFooter(null)
    }, [setFooter, Footer])
}