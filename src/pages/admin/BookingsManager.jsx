import React, { useState, useEffect } from 'react'
import { Card, Table, Td, Badge, LoadingOverlay } from '../../components/UI'
import { supabase } from '../../lib/supabase'

export default function BookingsManager() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary">إدارة الحجوزات</h1>
                <p className="text-slate-500 mt-1">عرض جميع الحجوزات السابقة والنشطة في النظام</p>
            </div>

            <Card>
                {loading ? <LoadingOverlay message="جاري جلب الحجوزات..." /> : (
                    <Table headers={['رقم الخيمة', 'اسم العميل', 'الموظف', 'المدة (ساعات)', 'المبلغ', 'الحالة', 'وقت الحجز']}>
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                                <Td className="font-bold text-secondary">{booking.tents?.number || '-'}</Td>
                                <Td>{booking.customer_name}</Td>
                                <Td>{booking.users?.name || '-'}</Td>
                                <Td>{booking.duration_hours}</Td>
                                <Td className="font-bold text-primary">{booking.total_price} ₪</Td>
                                <Td>{getStatusBadge(booking.status)}</Td>
                                <Td dir="ltr" className="text-right text-sm text-slate-500">
                                    {new Date(booking.created_at).toLocaleString('ar-EG')}
                                </Td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr>
                                <Td colSpan={7} className="text-center py-8 text-slate-500">لا توجد حجوزات</Td>
                            </tr>
                        )}
                    </Table>
                )}
            </Card>
        </div>
    )
}
