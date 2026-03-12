import React, { useState, useEffect } from 'react'
import { Card, Badge } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Clock, Plus, User, X, ChevronRight, ChevronLeft, SaudiRiyal } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const categories = ['خيمة صغيرة', 'خيمة كبيرة', 'طاولات', 'خيمة VIP']
const paymentTypeLabel = { cash: 'نقدي 💵', network: 'شبكة 💳', split: 'جزئي 🔀' }
const paymentTimingLabel = { now: 'تم الدفع ⚡', later: 'عند الانتهاء 🕐' }

/* ─────────────────────────────────────────
   New Booking Modal
───────────────────────────────────────── */
function NewBookingModal({ onClose, onSuccess, currentUser }) {
    const [step, setStep] = useState(1) // 1: choose tent  2: details
    // const [selectedCategory, setSelectedCategory] = useState('الكل')
    const [selectedCategory, setSelectedCategory] = useState('خيمة صغيرة')
    const [tents, setTents] = useState([])
    const [loadingTents, setLoadingTents] = useState(true)
    const [selectedTent, setSelectedTent] = useState(null)
    const [duration, setDuration] = useState(1)
    const [paymentType, setPaymentType] = useState('cash')
    const [paymentTiming, setPaymentTiming] = useState('now')
    const [cashAmount, setCashAmount] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchTents = async () => {
            setLoadingTents(true)
            try {
                const { data: activeBookings } = await supabase
                    .from('bookings').select('tent_id').eq('status', 'active')
                const activeTentIds = (activeBookings || []).map(b => b.tent_id)

                let query = supabase.from('tents').select('*').eq('status', 'available').order('id', { ascending: true })
                if (activeTentIds.length > 0) query = query.not('id', 'in', `(${activeTentIds.join(',')})`)

                const { data, error } = await query
                if (error) throw error
                setTents(data || [])
            } catch {
                toast.error('حدث خطأ أثناء جلب الخيام')
            } finally {
                setLoadingTents(false)
            }
        }
        fetchTents()
    }, [])

    const filteredTents = tents.filter(t => selectedCategory === 'الكل' || t.category === selectedCategory)
    const total = selectedTent ? selectedTent.base_price * duration : 0

    const handleSubmit = async () => {
        if (paymentType === 'split') {
            const cash = parseFloat(cashAmount) || 0
            if (cash <= 0 || cash >= total) return toast.error('الرجاء إدخال مبلغ نقدي صحيح')
        }
        setSubmitting(true)
        try {
            const networkAmount = paymentType === 'split' ? total - (parseFloat(cashAmount) || 0) : 0
            const finalCash = paymentType === 'split' ? parseFloat(cashAmount) || 0 : (paymentType === 'cash' ? total : 0)

            const { error: bErr } = await supabase.from('bookings').insert([{
                tent_id: selectedTent.id,
                user_id: currentUser.id,
                customer_name: 'بدون اسم',
                duration_hours: duration,
                total_price: total,
                payment_type: paymentType,
                payment_timing: paymentTiming,
                cash_amount: paymentType === 'network' ? 0 : finalCash,
                network_amount: paymentType === 'cash' ? 0 : networkAmount,
            }])
            if (bErr) throw bErr

            const { error: tErr } = await supabase.from('tents').update({ status: 'booked' }).eq('id', selectedTent.id)
            if (tErr) throw tErr

            toast.success(`تم إنشاء الحجز بنجاح! ${total} ريال`)
            onSuccess()
            onClose()
        } catch {
            toast.error('حدث خطأ أثناء إتمام الحجز')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                        <Plus size={20} className="text-primary" /> حجز جديد
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 px-6 py-3 text-sm font-bold border-b border-slate-100">
                    <span className={`flex items-center gap-1 ${step === 1 ? 'text-primary' : 'text-slate-400'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-primary text-white' : step > 1 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {step > 1 ? '✓' : '1'}
                        </span>
                        اختر الخيمة
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className={`flex items-center gap-1 ${step === 2 ? 'text-primary' : 'text-slate-400'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                        تفاصيل الحجز
                    </span>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">

                    {/* ── Step 1: Tent Selection ── */}
                    {step === 1 && (
                        <div className="flex flex-col h-full">
                            {/* Category Pills */}
                            <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-slate-100 flex-shrink-0">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap text-xs transition-colors ${selectedCategory === cat ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >{cat}</button>
                                ))}
                            </div>

                            {loadingTents ? (
                                <div className="flex-1 flex items-center justify-center text-slate-400 font-bold py-16">جاري تحميل الخيام...</div>
                            ) : (
                                <div className="overflow-y-auto flex-1">
                                    <table className="w-full text-right text-sm border-collapse">
                                        <thead className="sticky top-0 bg-slate-50 z-10">
                                            <tr className="text-slate-500 font-bold text-xs">
                                                <th className="px-4 py-3">رقم الخيمة</th>
                                                <th className="px-4 py-3">الفئة</th>
                                                <th className="px-4 py-3">السعر / ساعة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTents.map((tent, idx) => (
                                                <tr
                                                    key={tent.id}
                                                    onClick={() => setSelectedTent(tent)}
                                                    className={`cursor-pointer border-t border-slate-100 transition-colors ${selectedTent?.id === tent.id
                                                        ? 'bg-primary/10 border-r-4 border-r-primary'
                                                        : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100'}`}
                                                >
                                                    <td className="px-4 py-3 font-bold text-secondary">{tent.number}</td>
                                                    <td className="px-4 py-3 text-slate-600">{tent.category}</td>
                                                    <td className="px-4 py-3 font-bold text-primary">{tent.base_price} ريال</td>
                                                </tr>
                                            ))}
                                            {filteredTents.length === 0 && (
                                                <tr><td colSpan={3} className="text-center py-12 text-slate-400 font-bold">لا توجد خيام متاحة في هذه الفئة</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Booking Details ── */}
                    {step === 2 && (
                        <div className="p-5 space-y-5">
                            {/* Selected Tent Summary */}
                            <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-secondary text-base">{selectedTent?.number}</p>
                                    <p className="text-slate-500 text-xs">{selectedTent?.category}</p>
                                </div>
                                <span className="text-primary font-bold">{selectedTent?.base_price} ريال / ساعة</span>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">المدة (بالساعات)</label>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setDuration(Math.max(1, duration - 1))}
                                        className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-xl flex items-center justify-center active:scale-95 transition-all">−</button>
                                    <input type="number" min="1" value={duration}
                                        onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-center text-xl font-bold" />
                                    <button type="button" onClick={() => setDuration(duration + 1)}
                                        className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-xl flex items-center justify-center active:scale-95 transition-all">+</button>
                                </div>
                            </div>

                            {/* Payment Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">طريقة الدفع</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[{ value: 'cash', label: 'نقدي', icon: '💵' }, { value: 'network', label: 'شبكة', icon: '💳' }, { value: 'split', label: 'جزئي', icon: '🔀' }].map(opt => (
                                        <button key={opt.value} type="button"
                                            onClick={() => { setPaymentType(opt.value); setCashAmount('') }}
                                            className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentType === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                                            <span className="text-xl">{opt.icon}</span>{opt.label}
                                        </button>
                                    ))}
                                </div>
                                {paymentType === 'split' && (
                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                        <label className="block text-xs font-bold text-amber-700 mb-2">المبلغ النقدي (ريال)</label>
                                        <input type="number" min="1" max={total - 1} value={cashAmount}
                                            onChange={e => setCashAmount(e.target.value)}
                                            placeholder="أدخل المبلغ النقدي..."
                                            className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 text-lg font-bold" />
                                        {cashAmount && <p className="text-xs text-amber-700 mt-1 font-medium">شبكة: {Math.max(0, total - (parseFloat(cashAmount) || 0))} ريال</p>}
                                    </div>
                                )}
                            </div>

                            {/* Payment Timing */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">توقيت الدفع</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[{ value: 'now', label: 'يدفع الآن', icon: '⚡' }, { value: 'later', label: 'عند الانتهاء', icon: '🕐' }].map(opt => (
                                        <button key={opt.value} type="button" onClick={() => setPaymentTiming(opt.value)}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentTiming === opt.value ? 'border-secondary bg-secondary/10 text-secondary' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                                            <span>{opt.icon}</span>{opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                    {step === 1 ? (
                        <div className="flex items-center justify-between gap-3">
                            <button onClick={onClose} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors">إلغاء</button>
                            <button
                                disabled={!selectedTent}
                                onClick={() => setStep(2)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                التالي <ChevronLeft size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Total */}
                            <div className="flex justify-between items-center bg-slate-800 text-white rounded-xl px-4 py-3">
                                <span className="text-slate-400 text-sm">الإجمالي</span>
                                <span className="text-xl font-bold flex items-center gap-1">{total} <SaudiRiyal size={16} /></span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors flex items-center gap-1">
                                    <ChevronRight size={16} /> رجوع
                                </button>
                                <button
                                    disabled={submitting}
                                    onClick={handleSubmit}
                                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'جاري الحجز...' : '✅ تأكيد الحجز'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────
   Close Booking Confirmation Modal
───────────────────────────────────────── */
function CloseConfirmModal({ booking, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-right">
                <div className="text-center mb-5">
                    <div className="text-5xl mb-3">💰</div>
                    <h2 className="text-xl font-bold text-secondary">تأكيد الدفع</h2>
                    <p className="text-slate-400 text-sm mt-1">هل تم تحصيل المبلغ؟</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-slate-500">الخيمة:</span><span className="font-bold text-secondary">{booking.tents?.number}</span></p>
                    <p className="flex justify-between"><span className="text-slate-500">وقت الدخول:</span><span className="font-bold whitespace-nowrap" dir="ltr">{new Date(booking.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span></p>
                    <p className="flex justify-between"><span className="text-slate-500">طريقة الدفع:</span><span className="font-bold">{paymentTypeLabel[booking.payment_type] || 'نقدي 💵'}</span></p>
                    <hr className="border-slate-200" />
                    <p className="flex justify-between"><span className="text-slate-500">المبلغ الإجمالي:</span><span className="font-bold text-lg text-primary">{booking.total_price} ريال</span></p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onConfirm(false)} className="py-3 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 transition-colors">💸 لم يُدفع بعد</button>
                    <button onClick={() => onConfirm(true)} className="py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-500 transition-colors">✅ تم التحصيل</button>
                </div>
                <button onClick={onCancel} className="w-full mt-3 py-2 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors">إلغاء</button>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────
   Main Employee Panel
───────────────────────────────────────── */
export default function EmployeePanel() {
    const { signOut, user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [showNewBooking, setShowNewBooking] = useState(false)
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
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const handleCloseBooking = async (paymentCollected) => {
        const booking = confirmBooking
        try {
            const { error: bError } = await supabase.from('bookings').update({ status: 'completed', payment_collected: paymentCollected }).eq('id', booking.id)
            if (bError) throw bError
            const { error: tError } = await supabase.from('tents').update({ status: 'available' }).eq('id', booking.tent_id)
            if (tError) throw tError

            paymentCollected
                ? toast.success('تم إنهاء الحجز وتحصيل المبلغ ✅')
                : toast('تم إنهاء الحجز - المبلغ لم يُدفع بعد ⚠️', { icon: '💸' })

            setConfirmBooking(null)
            fetchBookings()
        } catch {
            toast.error('حدث خطأ أثناء إنهاء الحجز')
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col" dir="rtl">

            {/* Header */}
            <header className="bg-secondary text-white shadow-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <span className="font-bold text-xl text-white">خ</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">نقطة البيع - خيام</h1>
                        <p className="text-slate-400 text-sm flex items-center gap-1.5">
                            <User size={13} /> الكاشير: {user?.user_metadata?.name || 'أحمد'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-300 font-mono bg-slate-800 px-4 py-2 rounded-lg">
                        <Clock size={16} className="text-primary" />
                        <span>{currentTime.toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm"
                    >
                        <LogOut size={16} className="rotate-180" /> إنهاء الوردية
                    </button>
                </div>
            </header>

            {/* Page Title Bar */}
            <div className="px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-secondary">الحجوزات النشطة</h2>
                    <p className="text-slate-400 text-sm">{loading ? '...' : `${bookings.length} حجز نشط`}</p>
                </div>
                <button
                    onClick={() => setShowNewBooking(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 text-sm"
                >
                    <Plus size={20} /> حجز جديد
                </button>
            </div>

            {/* Bookings Grid */}
            <main className="flex-1 px-6 pb-6">
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-slate-400 font-bold text-xl">جاري التحميل...</div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300 gap-4">
                        <span className="text-7xl">🏕️</span>
                        <p className="font-bold text-xl text-slate-400">لا توجد حجوزات نشطة حالياً</p>
                        <button onClick={() => setShowNewBooking(true)} className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-emerald-500 transition-colors">
                            <Plus size={18} /> ابدأ حجزاً جديداً
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                                    <tr>
                                        <th className="px-5 py-4">الخيمة</th>
                                        <th className="px-5 py-4">وقت الدخول</th>
                                        <th className="px-5 py-4">المبلغ والدفع</th>
                                        <th className="px-5 py-4">الوقت المتبقي</th>
                                        <th className="px-5 py-4 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...bookings]
                                        .sort((a, b) => {
                                            const remA = (a.duration_hours * 3600000) - (currentTime - new Date(a.created_at))
                                            const remB = (b.duration_hours * 3600000) - (currentTime - new Date(b.created_at))
                                            return remA - remB
                                        })
                                        .map(b => {
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
                                                <tr key={b.id} className={`transition-colors hover:bg-slate-50 ${isOverdue ? 'bg-red-50/50' : ''}`}>
                                                    <td className={`px-5 py-4 border-r-4 ${isOverdue ? 'border-r-red-500' : 'border-r-primary'}`}>
                                                        <p className="font-bold text-lg text-secondary">{b.tents?.number}</p>
                                                        <p className="text-xs text-slate-500">{b.tents?.category}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-slate-700 whitespace-nowrap" dir="ltr">{new Date(b.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{b.duration_hours} ساعة</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-primary">{b.total_price} ريال</p>
                                                        <p className="text-xs text-slate-500 mt-1">{paymentTypeLabel[b.payment_type]} · {paymentTimingLabel[b.payment_timing]}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-col gap-2 w-48">
                                                            <div className={`px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-mono font-bold tracking-widest text-lg ${isOverdue ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-800 text-white'}`} dir="ltr">
                                                                {isOverdue && <span className="text-sm">⚠️</span>}
                                                                {String(remH).padStart(2, '0')}:{String(remM).padStart(2, '0')}:{String(remS).padStart(2, '0')}
                                                            </div>
                                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                <div className={`h-1.5 rounded-full transition-all ${isOverdue ? 'bg-red-500' : progress > 75 ? 'bg-amber-400' : 'bg-primary'}`}
                                                                    style={{ width: `${Math.min(100, progress)}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <button onClick={() => setConfirmBooking(b)} className="px-4 py-3 w-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg font-bold text-sm transition-colors">
                                                            إنهاء الحجز
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* New Booking Modal */}
            {showNewBooking && (
                <NewBookingModal
                    onClose={() => setShowNewBooking(false)}
                    onSuccess={fetchBookings}
                    currentUser={user}
                />
            )}

            {/* Close Booking Confirmation */}
            {confirmBooking && (
                <CloseConfirmModal
                    booking={confirmBooking}
                    onConfirm={handleCloseBooking}
                    onCancel={() => setConfirmBooking(null)}
                />
            )}
        </div>
    )
}
