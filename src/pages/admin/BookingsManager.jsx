import React, { useState, useEffect, useMemo } from 'react'
import { Card, Table, Td, Badge, LoadingOverlay } from '../../components/UI'
import { SaudiRiyal, ChevronDown, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function BookingsManager() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedDay, setExpandedDay] = useState(null)

    const fetchBookings = async () => {
        try {
            setLoading(true)
            // Join with tents and users to get detailed info
            const { data, error } = await supabase
                .from('bookings')
                .select('*, tents(number, category), users(name)')
                .order('created_at', { ascending: false })
            if (error) throw error
            setBookings(data || [])
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <Badge type="primary">نشط</Badge>
            case 'completed': return <Badge type="success">مكتمل</Badge>
            case 'cancelled': return <Badge type="danger">ملغى</Badge>
            default: return <Badge>{status}</Badge>
        }
    }

    const groupedBookings = useMemo(() => {
        const groups = {}
        bookings.forEach(b => {
            const dateObj = new Date(b.created_at)
            
            // Format to something like: الأحد، ١ مارس ٢٠٢٦
            const dateStr = dateObj.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            
            if (!groups[dateStr]) {
                groups[dateStr] = {
                    date: dateStr,
                    bookings: [],
                    tents: {},
                    totalMoney: 0,
                    totalCash: 0,
                    totalNetwork: 0,
                    timestamp: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime() 
                }
            }

            let cash = Number(b.cash_amount) || 0;
            let net = Number(b.network_amount) || 0;

            if (cash === 0 && net === 0 && b.total_price > 0) {
                if (b.payment_type === 'cash') cash = b.total_price;
                else if (b.payment_type === 'network') net = b.total_price;
            }

            groups[dateStr].bookings.push(b)
            groups[dateStr].totalMoney += b.total_price || 0
            groups[dateStr].totalCash += cash
            groups[dateStr].totalNetwork += net

            const tentNum = b.tents?.number || 'غير معروف'
            if (!groups[dateStr].tents[tentNum]) {
                groups[dateStr].tents[tentNum] = {
                    tentNumber: tentNum,
                    bookingCount: 0,
                    totalHours: 0,
                    totalMoney: 0
                }
            }
            groups[dateStr].tents[tentNum].bookingCount += 1
            groups[dateStr].tents[tentNum].totalHours += Number(b.duration_hours) || 0
            groups[dateStr].tents[tentNum].totalMoney += Number(b.total_price) || 0
        })

        const sortedGroups = Object.values(groups).sort((a, b) => b.timestamp - a.timestamp)
        
        sortedGroups.forEach(group => {
            group.tentsList = Object.values(group.tents).sort((a, b) => {
                const numA = parseInt(a.tentNumber) || 0;
                const numB = parseInt(b.tentNumber) || 0;
                return numA - numB;
            })
        })

        return sortedGroups
    }, [bookings])


    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary">إدارة الحجوزات</h1>
                <p className="text-slate-500 mt-1">عرض جميع الحجوزات السابقة والنشطة في النظام</p>
            </div>

            {loading ? <LoadingOverlay message="جاري جلب الحجوزات..." /> : (
                <div className="space-y-4">
                    {groupedBookings.length === 0 && (
                        <Card><div className="text-center py-8 text-slate-500">لا توجد حجوزات</div></Card>
                    )}
                    {groupedBookings.map(dayGroup => (
                        <div key={dayGroup.date} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Header / Summary */}
                            <div 
                                onClick={() => setExpandedDay(expandedDay === dayGroup.date ? null : dayGroup.date)}
                                className={`cursor-pointer p-5 flex items-center justify-between transition-colors ${expandedDay === dayGroup.date ? 'bg-primary/5 border-b border-primary/10' : 'hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-secondary">{dayGroup.date}</h3>
                                        <p className="text-sm text-slate-500">{dayGroup.bookings.length} حجوزات</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-end">
                                        <p className="text-xs text-slate-500 font-bold mb-1">الإجمالي</p>
                                        <p className="font-bold text-xl text-primary flex items-center gap-1">
                                            {dayGroup.totalMoney} <SaudiRiyal size={18} />
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-xs text-slate-500 font-bold mb-1">نقدي</p>
                                        <p className="font-bold text-amber-600 flex items-center gap-1">
                                            {dayGroup.totalCash} <SaudiRiyal size={16} />
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-xs text-slate-500 font-bold mb-1">شبكة</p>
                                        <p className="font-bold text-blue-600 flex items-center gap-1">
                                            {dayGroup.totalNetwork} <SaudiRiyal size={16} />
                                        </p>
                                    </div>
                                    <div className={`p-2 rounded-full transition-transform ${expandedDay === dayGroup.date ? 'rotate-180 bg-slate-200' : 'bg-slate-100'}`}>
                                        <ChevronDown size={20} className="text-slate-500" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Expandable Content (The detail table) */}
                            {expandedDay === dayGroup.date && (
                                <div className="p-0 border-t border-slate-100 bg-slate-50/50">
                                    <Table headers={['رقم الخيمة', 'عدد مرات الحجز', 'إجمالي الساعات', 'إجمالي المبلغ']}>
                                        {dayGroup.tentsList.map((tentData, index) => (
                                            <tr key={index} className="hover:bg-white transition-colors bg-slate-50/30">
                                                <Td className="font-bold text-secondary">خيمة {tentData.tentNumber}</Td>
                                                <Td>
                                                    <Badge type="primary">{tentData.bookingCount} مرات</Badge>
                                                </Td>
                                                <Td className="font-medium text-slate-700">{tentData.totalHours} ساعة</Td>
                                                <Td className="font-semibold text-primary">
                                                    <span className="flex items-center gap-1">
                                                        {tentData.totalMoney}
                                                        <SaudiRiyal size={18} />
                                                    </span>
                                                </Td>
                                            </tr>
                                        ))}
                                    </Table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
