import React from 'react'
import { X } from 'lucide-react'

export function Card({ children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
            {children}
        </div>
    )
}

export function Badge({ children, type = 'default' }) {
    const styles = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        primary: 'bg-primary/10 text-primary'
    }

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[type]}`}>
            {children}
        </span>
    )
}

export function Table({ headers, children }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 ">
                        {headers.map((header, i) => (
                            <th key={i} className="px-6 py-4 text-sm font-semibold text-slate-600">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr:nth-child(even)]:bg-slate-50/70">
                    {children}
                </tbody>
            </table>
        </div>
    )
}

export function Th({ children }) {
    return <th className="px-6 py-4 text-sm font-semibold text-slate-600">{children}</th>
}

export function Td({ children, className = '', colSpan }) {
    return <td colSpan={colSpan} className={`px-6 py-4 text-sm text-slate-600 ${className}`}>{children}</td>
}

// Loading Spinner
export function Spinner({ size = 'md', className = '' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
    return (
        <div className={`${sizes[size]} border-4 border-slate-200 border-t-primary rounded-full animate-spin ${className}`} />
    )
}

// Full-page loading overlay
export function LoadingOverlay({ message = 'جاري التحميل...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Spinner size="lg" />
            <p className="text-slate-500 font-medium">{message}</p>
        </div>
    )
}

// Reusable Modal
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null
    const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            {/* Modal Box */}
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} z-10 animate-in fade-in slide-in-from-bottom-4 duration-200`}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-secondary">{title}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}
