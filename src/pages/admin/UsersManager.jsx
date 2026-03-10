import React, { useState, useEffect } from 'react'
import { Card, Table, Td, Badge, LoadingOverlay } from '../../components/UI'
import { supabase } from '../../lib/supabase'

export default function UsersManager() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary">إدارة الموظفين والمستخدمين</h1>
                <p className="text-slate-500 mt-1">عرض جميع حسابات النظام المسجلة وصلاحياتها</p>
            </div>

            <Card>
                {loading ? <LoadingOverlay message="جاري جلب المستخدمين..." /> : (
                    <Table headers={['الاسم', 'الصلاحية', 'تاريخ الانضمام']}>
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <Td className="font-bold text-secondary">{u.name || 'مستخدم'}</Td>
                                <Td>{u.role === 'admin' ? <Badge type="primary">مشرف</Badge> : <Badge type="warning">موظف</Badge>}</Td>
                                <Td dir="ltr" className="text-right text-sm text-slate-500">
                                    {new Date(u.created_at).toLocaleDateString('ar-EG')}
                                </Td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <Td colSpan={3} className="text-center py-8 text-slate-500">لا يوجد مستخدمون</Td>
                            </tr>
                        )}
                    </Table>
                )}
            </Card>
        </div>
    )
}
