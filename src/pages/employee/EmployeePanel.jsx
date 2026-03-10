import React, { useState, useEffect } from 'react'
import { Card, Badge } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Clock, Plus, Receipt, User, Timer, SaudiRiyal } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

// Categories
const categories = ['الكل', 'خيمة صغيرة', 'خيمة كبيرة', 'طاولات', 'خيمة VIP']

const paymentTypeLabel = { cash: 'نقدي 💵', network: 'شبكة 💳', split: 'مختلط 🔀' }
const paymentTimingLabel = { now: 'دُفع ⚡', later: 'عند الانتهاء 🕐' }

const ActiveBookingsList = () => {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [confirmBooking, setConfirmBooking] = useState(null)

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('bookings')
                .select('*, tents (number, category)')
                .eq('status', 'active')
                .order('created_at', { ascending: false })

            if (error) throw error
            setBookings(data || [])
        } catch (error) {
            console.error('Error fetching Bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const handleCloseBooking = async (booking, paymentCollected) => {
        try {
            const { error: bError } = await supabase
                .from('bookings')
                .update({ status: 'completed', payment_collected: paymentCollected })
                .eq('id', booking.id)
            if (bError) throw bError

            const { error: tError } = await supabase
                .from('tents')
                .update({ status: 'available' })
                .eq('id', booking.tent_id)
            if (tError) throw tError

            if (paymentCollected) {
                toast.success('تم إنهاء الحجز وتحصيل المبلغ ✅')
            } else {
                toast('تم إنهاء الحجز - المبلغ لم يُدفع بعد ⚠️', { icon: '💸' })
            }
            setConfirmBooking(null)
            fetchBookings()
        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ أثناء إنهاء الحجز')
        }
    }

    if (loading) return <div className="flex-1 flex items-center justify-center text-slate-400 font-bold text-xl">جاري التحميل...</div>

    return (
        <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-slate-200 relative">

            {/* Payment Confirmation Modal */}
            {confirmBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-right">
                        <div className="text-center mb-5">
                            <div className="text-5xl mb-3">💰</div>
                            <h2 className="text-xl font-bold text-secondary">تأكيد الدفع</h2>
                            <p className="text-slate-400 text-sm mt-1">هل تم تحصيل المبلغ؟</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                            <p className="flex justify-between">
                                <span className="text-slate-500">الخيمة:</span>
                                <span className="font-bold text-secondary">{confirmBooking.tents?.number}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-slate-500">العميل:</span>
                                <span className="font-bold">{confirmBooking.customer_name}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-slate-500">طريقة الدفع:</span>
                                <span className="font-bold">{paymentTypeLabel[confirmBooking.payment_type] || 'نقدي 💵'}</span>
                            </p>
                            <hr className="border-slate-200" />
                            <p className="flex justify-between">
                                <span className="text-slate-500">المبلغ الإجمالي:</span>
                                <span className="font-bold text-lg text-primary">{confirmBooking.total_price} ريال</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleCloseBooking(confirmBooking, false)}
                                className="py-3 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 transition-colors"
                            >
                                💸 لم يُدفع بعد
                            </button>
                            <button
                                onClick={() => handleCloseBooking(confirmBooking, true)}
                                className="py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-500 transition-colors"
                            >
                                ✅ تم التحصيل
                            </button>
                        </div>

                        <button
                            onClick={() => setConfirmBooking(null)}
                            className="w-full mt-3 py-2 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {bookings.map(b => {
                    const startTime = new Date(b.created_at)
                    const totalMs = b.duration_hours * 3600000
                    const elapsedMs = currentTime - startTime
                    const remainingMs = totalMs - elapsedMs
                    const isOverdue = remainingMs <= 0

                    const remH = isOverdue ? 0 : Math.floor(remainingMs / 3600000)
                    const remM = isOverdue ? 0 : Math.floor((remainingMs % 3600000) / 60000)
                    const remS = isOverdue ? 0 : Math.floor((remainingMs % 60000) / 1000)

                    const progress = Math.min(100, (elapsedMs / totalMs) * 100)

                    return (
                        <Card key={b.id} className={`p-4 border-t-4 ${isOverdue ? 'border-red-500' : 'border-primary'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-xl text-secondary">{b.tents?.number}</h3>
                                    <p className="text-sm text-slate-500">{b.tents?.category}</p>
                                </div>
                                <Badge type={isOverdue ? 'danger' : 'success'}>
                                    {isOverdue ? '⚠️ انتهى الوقت' : `${b.duration_hours} ساعة`}
                                </Badge>
                            </div>

                            {/* Countdown */}
                            <div className={`rounded-xl p-3 mb-3 text-center ${isOverdue ? 'bg-red-50' : 'bg-slate-800'}`}>
                                <p className={`text-xs font-bold mb-1 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                                    {isOverdue ? 'تجاوز الوقت المحدد!' : 'الوقت المتبقي'}
                                </p>
                                <span className={`text-3xl font-mono font-bold tracking-widest ${isOverdue ? 'text-red-600 animate-pulse' : 'text-white'}`} dir="ltr">
                                    {String(remH).padStart(2, '0')}:{String(remM).padStart(2, '0')}:{String(remS).padStart(2, '0')}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                                <div
                                    className={`h-2 rounded-full transition-all ${isOverdue ? 'bg-red-500' : progress > 75 ? 'bg-amber-400' : 'bg-primary'}`}
                                    style={{ width: `${Math.min(100, progress)}%` }}
                                />
                            </div>

                            <div className="space-y-1.5 mb-3 text-sm">
                                <p className="flex justify-between"><span className="text-slate-500">العميل:</span> <span className="font-bold">{b.customer_name}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500">المبلغ:</span> <span className="font-bold text-primary">{b.total_price} ريال</span></p>
                                <p className="flex justify-between">
                                    <span className="text-slate-500">الدفع:</span>
                                    <span className="font-bold">{paymentTypeLabel[b.payment_type] || 'نقدي 💵'} · {paymentTimingLabel[b.payment_timing] || 'دُفع ⚡'}</span>
                                </p>
                            </div>

                            <button onClick={() => setConfirmBooking(b)} className="w-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white py-2 rounded-lg font-bold transition-colors">
                                إنهاء وإفراغ الخيمة
                            </button>
                        </Card>
                    )
                })}
                {bookings.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400 font-bold text-xl">لا توجد حجوزات نشطة حالياً</div>
                )}
            </div>
        </div>
    )
}

export default function EmployeePanel() {
    const { signOut, user } = useAuth()
    const [activeTab, setActiveTab] = useState('new-booking')
    const [selectedCategory, setSelectedCategory] = useState('الكل')
    const [selectedTent, setSelectedTent] = useState(null)
    const [duration, setDuration] = useState(1)
    const [customerName, setCustomerName] = useState('')
    const [paymentType, setPaymentType] = useState('cash')
    const [paymentTiming, setPaymentTiming] = useState('now')
    const [cashAmount, setCashAmount] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [tents, setTents] = useState([])
    const [loadingTents, setLoadingTents] = useState(true)

    // Live Timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const fetchTents = async () => {
        try {
            setLoadingTents(true)

            const { data: activeBookings } = await supabase
                .from('bookings')
                .select('tent_id')
                .eq('status', 'active')

            const activeTentIds = (activeBookings || []).map(b => b.tent_id)

            let query = supabase
                .from('tents')
                .select('*')
                .eq('status', 'available')
                .order('id', { ascending: true })

            if (activeTentIds.length > 0) {
                query = query.not('id', 'in', `(${activeTentIds.join(',')})`)
            }

            const { data, error } = await query
            if (error) throw error
            setTents(data || [])
        } catch (error) {
            console.error('Error fetching tents:', error.message)
            toast.error('حدث خطأ أثناء جلب الخيام')
        } finally {
            setLoadingTents(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'new-booking') {
            fetchTents()
        }
    }, [activeTab])

    // Realtime: re-fetch tents whenever any tent status changes
    useEffect(() => {
        const channel = supabase
            .channel('tents-status-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tents' }, () => {
                if (activeTab === 'new-booking') {
                    fetchTents()
                }
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [activeTab])

    const filteredTents = tents.filter(t =>
        selectedCategory === 'الكل' || t.category === selectedCategory
    )

    const handleBooking = async (e) => {
        e.preventDefault()
        if (!selectedTent) return toast.error('الرجاء اختيار خيمة')
        if (!customerName) return toast.error('الرجاء إدخال اسم العميل')

        const total = selectedTent.base_price * duration

        if (paymentType === 'split') {
            const cash = parseFloat(cashAmount) || 0
            if (cash <= 0 || cash >= total) return toast.error('الرجاء إدخال مبلغ نقدي صحيح')
        }

        const networkAmount = paymentType === 'split' ? total - (parseFloat(cashAmount) || 0) : 0
        const finalCashAmount = paymentType === 'split' ? parseFloat(cashAmount) || 0 : (paymentType === 'cash' ? total : 0)

        try {
            const { error: bookingError } = await supabase
                .from('bookings')
                .insert([{
                    tent_id: selectedTent.id,
                    user_id: user.id,
                    customer_name: customerName,
                    duration_hours: duration,
                    total_price: total,
                    payment_type: paymentType,
                    payment_timing: paymentTiming,
                    cash_amount: paymentType === 'network' ? 0 : finalCashAmount,
                    network_amount: paymentType === 'cash' ? 0 : networkAmount,
                }])

            if (bookingError) throw bookingError

            const { error: tentError } = await supabase
                .from('tents')
                .update({ status: 'booked' })
                .eq('id', selectedTent.id)

            if (tentError) throw tentError

            const timingLabel = paymentTiming === 'now' ? 'الدفع الآن' : 'الدفع عند الانتهاء'
            toast.success(`تم إنشاء الحجز بنجاح! ${total} ريال - ${timingLabel}`)

            fetchTents()
            setSelectedTent(null)
            setCustomerName('')
            setDuration(1)
            setPaymentType('cash')
            setPaymentTiming('now')
            setCashAmount('')
        } catch (error) {
            console.error('Error creating booking:', error.message)
            toast.error('حدث خطأ أثناء إتمام الحجز')
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
            {/* POS Header */}
            <header className="bg-secondary text-white shadow-md p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <span className="font-bold text-xl text-white">خ</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">نقطة البيع - خيام</h1>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            <User size={14} /> الكاشير: {user?.user_metadata?.name || 'أحمد'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-300 font-mono bg-slate-800 px-4 py-2 rounded-lg">
                        <Clock size={16} className="text-primary" />
                        <span>{currentTime.toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <LogOut size={18} className="rotate-180" />
                        <span className="font-bold">إنهاء الوردية</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col p-4 overflow-hidden gap-4">
                    {/* Navigation Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('new-booking')}
                            className={`flex-1 py-4 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${activeTab === 'new-booking' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Plus size={24} /> حجز جديد
                        </button>
                        <button
                            onClick={() => setActiveTab('active-bookings')}
                            className={`flex-1 py-4 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${activeTab === 'active-bookings' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Timer size={24} /> الحجوزات النشطة
                        </button>
                    </div>

                    {activeTab === 'new-booking' && (
                        <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                            {/* Category Filter */}
                            <div className="flex items-center gap-3 p-4 border-b border-slate-100 overflow-x-auto">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-colors text-sm ${selectedCategory === cat ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Tents Table */}
                            {loadingTents ? (
                                <div className="flex-1 flex items-center justify-center text-slate-400 font-bold text-xl">
                                    جاري تحميل الخيام المتاحة...
                                </div>
                            ) : (
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-right text-sm border-collapse">
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-slate-100 text-slate-500 font-bold text-xs">
                                                <th className="px-5 py-3">رقم الخيمة</th>
                                                <th className="px-5 py-3">الفئة</th>
                                                <th className="px-5 py-3">السعر / ساعة</th>
                                                <th className="px-5 py-3 text-center">الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTents.map((tent, idx) => (
                                                <tr
                                                    key={tent.id}
                                                    onClick={() => setSelectedTent(tent)}
                                                    className={`cursor-pointer border-t border-slate-100 transition-colors ${selectedTent?.id === tent.id
                                                        ? 'bg-primary/10 border-r-4 border-r-primary'
                                                        : idx % 2 === 0
                                                            ? 'bg-white hover:bg-slate-50'
                                                            : 'bg-slate-50/60 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <td className={`px-5 py-3 font-bold text-base text-secondary ${selectedTent?.id === tent.id ? 'pr-4' : ''}`}>
                                                        {tent.number}
                                                    </td>
                                                    <td className="px-5 py-3 text-slate-600">{tent.category}</td>
                                                    <td className="px-5 py-3 font-bold text-primary">{tent.base_price} ريال</td>
                                                    <td className="px-5 py-3 text-center">
                                                        <Badge type="success">متاح</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredTents.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-16 text-slate-400 font-bold">
                                                        لا توجد خيام متاحة في هذه الفئة حالياً
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'active-bookings' && (
                        <ActiveBookingsList />
                    )}
                </main>

                {/* Sidebar Order Summary */}
                <aside className="w-[400px] bg-white border-r border-slate-200 p-6 flex flex-col relative z-20 shadow-xl">
                    <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
                        <Receipt className="text-primary" /> تفاصيل الحجز
                    </h2>

                    <form onSubmit={handleBooking} className="flex-1 flex flex-col gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">اسم العميل</label>
                            <input
                                type="text"
                                required
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                placeholder="أدخل اسم العميل..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
                            />
                        </div>

                        <Card className="p-4 bg-slate-50 border-slate-200">
                            <h3 className="font-bold text-slate-500 mb-4 text-sm">الخيمة المختارة</h3>
                            {selectedTent ? (
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div>
                                        <p className="font-bold text-secondary text-lg">{selectedTent.number}</p>
                                        <p className="text-slate-500 text-sm">{selectedTent.category}</p>
                                    </div>
                                    <span className="font-bold text-primary flex items-center gap-1">{selectedTent.base_price} <SaudiRiyal size={18} /></span>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-amber-500 bg-amber-50 rounded-lg border border-amber-100 font-medium text-sm">
                                    الرجاء اختيار خيمة من القائمة
                                </div>
                            )}
                        </Card>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">المدة (بالساعات)</label>
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => setDuration(Math.max(1, duration - 1))} className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-xl flex items-center justify-center active:scale-95 transition-all">-</button>
                                <input
                                    type="number"
                                    min="1"
                                    value={duration}
                                    onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-center text-xl font-bold"
                                />
                                <button type="button" onClick={() => setDuration(duration + 1)} className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-xl flex items-center justify-center active:scale-95 transition-all">+</button>
                            </div>
                        </div>

                        {/* Payment Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">طريقة الدفع</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'cash', label: 'نقدي', icon: '💵' },
                                    { value: 'network', label: 'شبكة', icon: '💳' },
                                    { value: 'split', label: 'مختلط', icon: '🔀' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => { setPaymentType(opt.value); setCashAmount('') }}
                                        className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentType === opt.value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        <span className="text-xl">{opt.icon}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {paymentType === 'split' && (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                    <label className="block text-xs font-bold text-amber-700 mb-2">المبلغ النقدي (ريال)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedTent ? selectedTent.base_price * duration - 1 : undefined}
                                        value={cashAmount}
                                        onChange={e => setCashAmount(e.target.value)}
                                        placeholder="أدخل المبلغ النقدي..."
                                        className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 text-lg font-bold"
                                    />
                                    {cashAmount && selectedTent && (
                                        <p className="text-xs text-amber-700 mt-1 font-medium">
                                            شبكة: {Math.max(0, selectedTent.base_price * duration - (parseFloat(cashAmount) || 0))} ريال
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Payment Timing */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">توقيت الدفع</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'now', label: 'يدفع الآن', icon: '⚡' },
                                    { value: 'later', label: 'عند الانتهاء', icon: '🕐' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setPaymentTiming(opt.value)}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentTiming === opt.value
                                            ? 'border-secondary bg-secondary/10 text-secondary'
                                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        <span>{opt.icon}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-inner space-y-4">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span>السعر الإجمالي</span>
                                    <span className="text-2xl font-bold text-white flex items-center gap-1">
                                        {selectedTent ? selectedTent.base_price * duration : 0} <SaudiRiyal size={18} />
                                    </span>
                                </div>
                                <hr className="border-slate-700" />
                                <button
                                    type="submit"
                                    disabled={!selectedTent || !customerName}
                                    className="w-full bg-primary hover:bg-emerald-500 text-white font-bold py-4 rounded-xl text-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                                >
                                    تأكيد الحجز
                                </button>
                            </div>
                        </div>
                    </form>
                </aside>
            </div>
        </div>
    )
}
