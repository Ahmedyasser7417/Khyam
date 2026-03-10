import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import { Card } from '../../components/UI'
import { Users, CalendarDays, TrendingUp, Tent, SaudiRiyal } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import TentsManager from './TentsManager'
import BookingsManager from './BookingsManager'
import UsersManager from './UsersManager'

const DashboardHome = () => {
    const [stats, setStats] = useState({
        todayBookings: 0,
        todayRevenue: 0,
        availableTents: 0,
        totalTents: 0,
        activeEmployees: 0
    })

    const fetchStats = async () => {
        try {
            const startOfDay = new Date()
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date()
            endOfDay.setHours(23, 59, 59, 999)

            const { data: bookings } = await supabase
                .from('bookings')
                .select('total_price')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())

            const todayRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0
            const todayBookings = bookings?.length || 0

            const { data: tents } = await supabase.from('tents').select('id, status')
            const availableTents = tents?.filter(t => t.status === 'available').length || 0
            const totalTents = tents?.length || 0

            const { count: activeEmployees } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'employee')

            setStats({
                todayBookings,
                todayRevenue,
                availableTents,
                totalTents,
                activeEmployees: activeEmployees || 0
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">لوحة التحكم</h1>
                    <p className="text-slate-500 mt-1">مرحباً بك في لوحة التحكم</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <CalendarDays size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">حجوزات اليوم</p>
                            <p className="text-2xl font-bold text-secondary">{stats.todayBookings}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">إيرادات اليوم</p>
                            <span className="flex items-center gap-1 text-2xl font-bold text-secondary">{stats.todayRevenue} <SaudiRiyal size={20} /> </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <Tent size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">الخيام المتاحة</p>
                            <p className="text-2xl font-bold text-secondary text-left font-mono" dir="ltr">{stats.availableTents} <span className="text-slate-400 text-lg">/ {stats.totalTents}</span></p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">الموظفين النشطين</p>
                            <p className="text-2xl font-bold text-secondary">{stats.activeEmployees}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <AdminSidebar />
            <div className="flex-1 mr-64 min-w-0">
                <main className="p-8 max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/tents" element={<TentsManager />} />
                        <Route path="/bookings" element={<BookingsManager />} />
                        <Route path="/users" element={<UsersManager />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}

