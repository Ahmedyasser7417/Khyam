import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn, user, role, mockLogin } = useAuth()
    const navigate = useNavigate()

    // ✅ Watch for user/role changes after Supabase login and redirect accordingly
    useEffect(() => {
        if (user && role) {
            if (role === 'admin') {
                navigate('/admin', { replace: true })
            } else if (role === 'employee') {
                navigate('/employee', { replace: true })
            }
        }
    }, [user, role, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Mock login for testing without DB
            if (email === 'admin@test.com') {
                mockLogin('admin')  // sets user+role in context → useEffect redirects
                return
            } else if (email === 'employee@test.com') {
                mockLogin('employee')  // sets user+role in context → useEffect redirects
                return
            }

            // Real Supabase login — redirect is handled by the useEffect above
            await signIn(email, password)
        } catch (error) {
            toast.error('فشل تسجيل الدخول. تأكد من بياناتك.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-secondary">تسجيل الدخول</h2>
                    <p className="text-slate-500 mt-2">يرجى إدخال بيانات الدخول للمتابعة</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="abc@mail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'جاري التحقق...' : 'دخول'}
                    </button>
                </form>

                {/* <div className="mt-6 text-center text-sm text-slate-500">
                    <p>للتجربة بدون قاعدة بيانات:</p>
                    <p>Admin: admin@test.com</p>
                    <p>Employee: employee@test.com</p>
                </div> */}
            </div>
        </div>
    )
}
