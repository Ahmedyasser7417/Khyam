import React, { useState, useEffect } from 'react'
import { Card, Table, Td, Badge, LoadingOverlay, Modal } from '../../components/UI'
import { Plus, SquarePen, Trash2, SaudiRiyal } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'


const CATEGORIES = ['خيمة صغيرة', 'خيمة كبيرة', 'طاولات', 'VIP خيمة']
const STATUSES = [
    { value: 'available', label: 'متاح' },
    { value: 'booked', label: 'محجوز' },
    { value: 'maintenance', label: 'صيانة' },
]

const defaultForm = { number: '', category: CATEGORIES[0], base_price: '', status: 'available' }

export default function TentsManager() {
    const [tents, setTents] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editTent, setEditTent] = useState(null) // null = Add, tent obj = Edit
    const [form, setForm] = useState(defaultForm)
    const [deleteId, setDeleteId] = useState(null) // tent id being confirmed for delete

    const fetchTents = async () => {
        try {
            const { data, error } = await supabase
                .from('tents')
                .select('*')
                .order('id', { ascending: true })
            if (error) throw error
            setTents(data || [])
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب الخيام')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchTents() }, [])

    // Open modal for adding
    const openAdd = () => {
        setEditTent(null)
        setForm(defaultForm)
        setModalOpen(true)
    }

    // Open modal for editing
    const openEdit = (tent) => {
        setEditTent(tent)
        setForm({ number: tent.number, category: tent.category, base_price: tent.base_price, status: tent.status })
        setModalOpen(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!form.number || !form.base_price) return toast.error('الرجاء ملء جميع الحقول')
        setSaving(true)
        try {
            if (editTent) {
                // Edit existing
                const { error } = await supabase.from('tents').update({
                    number: form.number,
                    category: form.category,
                    base_price: Number(form.base_price),
                    status: form.status,
                }).eq('id', editTent.id)
                if (error) throw error
                toast.success('تم تعديل الخيمة بنجاح ✅')
            } else {
                // Add new
                const { error } = await supabase.from('tents').insert([{
                    number: form.number,
                    category: form.category,
                    base_price: Number(form.base_price),
                    status: form.status,
                }])
                if (error) throw error
                toast.success('تم إضافة الخيمة بنجاح ✅')
            }
            setModalOpen(false)
            fetchTents()
        } catch (error) {
            toast.error(error.message || 'حدث خطأ أثناء الحفظ')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const { error } = await supabase.from('tents').delete().eq('id', deleteId)
            if (error) throw error
            toast.success('تم حذف الخيمة بنجاح')
            setDeleteId(null)
            fetchTents()
        } catch (error) {
            toast.error('حدث خطأ أثناء الحذف')
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'available': return <Badge type="success">متاح</Badge>
            case 'booked': return <Badge type="warning">محجوز</Badge>
            case 'maintenance': return <Badge type="danger">صيانة</Badge>
            default: return <Badge>{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">إدارة الخيام</h1>
                    <p className="text-slate-500 mt-1">تتبع وإدارة جميع الخيام المتاحة في النظام</p>
                </div>
                <button onClick={openAdd} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-sm">
                    <Plus size={20} />
                    إضافة خيمة
                </button>
            </div>

            {/* Table */}
            <Card>
                {loading ? <LoadingOverlay message="جاري جلب الخيام..." /> : (
                    <Table headers={['رقم الخيمة', 'الفئة', 'السعر/ساعة', 'الحالة', 'إجراءات']}>
                        {tents.map((tent) => (
                            <tr key={tent.id} className="hover:bg-slate-50/50 transition-colors text-right">
                                <Td className="font-bold text-secondary">{tent.number}</Td>
                                <Td>{tent.category}</Td>
                                <Td className="font-semibold text-primary">
                                    <span className="flex items-center gap-1">
                                        {tent.base_price}
                                        <SaudiRiyal size={18} />
                                    </span>
                                </Td>
                                <Td>{getStatusBadge(tent.status)}</Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(tent)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                            <SquarePen size={16} />
                                        </button>
                                        <button onClick={() => setDeleteId(tent.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} color="#ff0000" />
                                        </button>
                                    </div>
                                </Td>
                            </tr>
                        ))}
                        {tents.length === 0 && (
                            <tr><Td colSpan={5} className="text-center py-8 text-slate-400">لا توجد خيام حالياً. اضغط "إضافة خيمة" للبدء.</Td></tr>
                        )}
                    </Table>
                )}
            </Card>

            {/* Add / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editTent ? `تعديل خيمة: ${editTent.number}` : 'إضافة خيمة جديدة'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">رقم / اسم الخيمة</label>
                        <input
                            type="text"
                            required
                            value={form.number}
                            onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                            placeholder="مثال: T-101"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">الفئة</label>
                        <select
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-white"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">السعر بالساعة (₪)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={form.base_price}
                            onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))}
                            placeholder="مثال: 150"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">الحالة</label>
                        <select
                            value={form.status}
                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all bg-white"
                        >
                            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-60"
                        >
                            {saving ? 'جاري الحفظ...' : editTent ? 'حفظ التعديلات' : 'إضافة الخيمة'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="تأكيد الحذف"
                size="sm"
            >
                <p className="text-slate-600 mb-6">هل أنت متأكد من حذف هذه الخيمة؟ لا يمكن التراجع عن هذا الإجراء.</p>
                <div className="flex gap-3">
                    <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition-colors">
                        نعم، احذف
                    </button>
                    <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                        إلغاء
                    </button>
                </div>
            </Modal>
        </div>
    )
}
