import React, { useState, useEffect } from 'react'
import { Card, Table, Td, Badge, LoadingOverlay } from '../../components/UI'
import { supabase } from '../../lib/supabase'
import { Edit2, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UsersManager() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingUser, setEditingUser] = useState(null)
    const [newName, setNewName] = useState('')
    const [updating, setUpdating] = useState(false)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleEditClick = (user) => {
        setEditingUser(user)
        setNewName(user.name || '')
    }

    const handleUpdateName = async () => {
        if (!newName.trim()) return toast.error('الرجاء إدخال الاسم')
        
        try {
            setUpdating(true)
            const { error } = await supabase
                .from('users')
                .update({ name: newName.trim() })
                .eq('id', editingUser.id)

            if (error) throw error
            
            toast.success('تم تحديث الاسم بنجاح')
            setEditingUser(null)
            fetchUsers()
        } catch (error) {
            console.error('Error updating name:', error)
            toast.error('حدث خطأ أثناء التحديث')
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary">إدارة الموظفين والمستخدمين</h1>
                <p className="text-slate-500 mt-1">عرض جميع حسابات النظام المسجلة وصلاحياتها</p>
            </div>

            <Card>
                {loading ? <LoadingOverlay message="جاري جلب المستخدمين..." /> : (
                    <Table headers={['الاسم', 'الصلاحية', 'تاريخ الانضمام', 'إجراءات']}>
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <Td className="font-bold text-secondary">{u.name || 'مستخدم'}</Td>
                                <Td>{u.role === 'admin' ? <Badge type="primary">مشرف</Badge> : <Badge type="warning">موظف</Badge>}</Td>
                                <Td dir="ltr" className="text-right text-sm text-slate-500">
                                    {new Date(u.created_at).toLocaleDateString('ar-EG')}
                                </Td>
                                <Td>
                                    <button 
                                        onClick={() => handleEditClick(u)}
                                        className="text-blue-500 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center justify-center"
                                        title="تعديل الاسم"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </Td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <Td colSpan={4} className="text-center py-8 text-slate-500">لا يوجد مستخدمون</Td>
                            </tr>
                        )}
                    </Table>
                )}
            </Card>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-right" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                                <Edit2 size={20} className="text-primary" /> تعديل اسم المستخدم
                            </h2>
                            <button onClick={() => setEditingUser(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5">
                            <label className="block text-sm font-bold text-slate-700 mb-2">اسم الموظف / الشاشة</label>
                            <input 
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="أدخل الاسم الجديد..."
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-bold"
                            />
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                            <button onClick={() => setEditingUser(null)} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors">إلغاء</button>
                            <button
                                disabled={updating || !newName.trim()}
                                onClick={handleUpdateName}
                                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                {updating ? 'جاري الحفظ...' : <><Save size={16} /> حفظ التعديل</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
