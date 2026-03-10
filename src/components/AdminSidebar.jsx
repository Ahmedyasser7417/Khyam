import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Tent, Users, CalendarDays, Settings, LogOut } from 'lucide-react'

export default function AdminSidebar() {
    const { signOut } = useAuth()
    const location = useLocation()

    const menuItems = [
        { title: 'لوحة التحكم', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { title: 'إدارة الخيام', icon: <Tent size={20} />, path: '/admin/tents' },
        { title: 'الحجوزات', icon: <CalendarDays size={20} />, path: '/admin/bookings' },
        { title: 'الموظفين', icon: <Users size={20} />, path: '/admin/users' },
        { title: 'الإعدادات', icon: <Settings size={20} />, path: '/admin/settings' },
    ]

    return (
        <aside className="w-64 bg-secondary text-white min-h-screen flex flex-col fixed right-0 top-0 bottom-0 z-40">
            <div className="h-20 flex items-center justify-center border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="font-bold text-lg">خ</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">إدارة خيام</span>
                </div>
            </div>

            <div className="flex-1 py-8 flex flex-col gap-2 px-4">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all w-full"
                >
                    <LogOut size={20} className="rotate-180" />
                    <span className="font-medium">تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    )
}
