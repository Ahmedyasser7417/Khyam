import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, Users, ShieldCheck, Clock, MapPin, CheckCircle2 } from 'lucide-react'

const categories = [
    {
        id: 1,
        name: 'خيمة صغيرة',
        price: '500',
        image: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?auto=format&fit=crop&q=80&w=800',
        features: ['تتسع لـ 5-10 أشخاص', 'إضاءة داخلية', 'فرش أرضي فاخر'],
    },
    {
        id: 2,
        name: 'خيمة كبيرة',
        price: '1200',
        image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop',
        features: ['تتسع لـ 20-30 شخص', 'تكييف اختياري', 'جلسات عربية متكاملة'],
    },
    {
        id: 3,
        name: 'طاولات',
        price: '150',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
        features: ['مجموعة من 4 كراسي', 'مفارش أنيقة', 'تنسيق حسب الطلب'],
    },
    {
        id: 4,
        name: 'VIP خيمة',
        price: '2500',
        image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&auto=format&fit=crop',
        features: ['ديكورات ملكية', 'خدمة ضيافة VIP', 'تكييف ممتاز', 'مواقف خاصة'],
    }
]

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans">

            {/* Navbar */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                            <span className="font-bold text-xl">خ</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-secondary">خيام</span>
                    </div>
                    <Link
                        to="/login"
                        className="bg-primary/10 text-primary font-bold px-6 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        تسجيل الدخول
                    </Link>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-secondary via-secondary to-primary text-white py-20 lg:py-32 px-4 overflow-hidden">
                    <div className="container mx-auto max-w-5xl relative z-10 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                            احجز خيمتك بكل سهولة
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            نوفر لك تشكيلة واسعة من الخيام المجهزة بأعلى المعايير، لتستمتع بأجواء رائعة في الهواء الطلق مع عائلتك وأصدقائك.
                        </p>

                        {/* Search Box */}
                        {/* <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-full shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 text-slate-800">
                            <div className="flex-1 w-full flex items-center bg-slate-50 rounded-xl md:rounded-full px-4 py-3 border border-slate-100">
                                <MapPin className="text-primary ml-3" size={20} />
                                <input
                                    type="text"
                                    placeholder="ابحث عن نوع الخيمة أو الموقع"
                                    className="bg-transparent w-full outline-none"
                                />
                            </div>
                            <div className="flex-1 w-full flex items-center bg-slate-50 rounded-xl md:rounded-full px-4 py-3 border border-slate-100">
                                <Calendar className="text-primary ml-3" size={20} />
                                <input
                                    type="date"
                                    className="bg-transparent w-full outline-none"
                                />
                            </div>
                            <button className="w-full md:w-auto bg-primary text-white font-bold py-4 px-8 rounded-xl md:rounded-full hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2 m-1">
                                <Search size={20} />
                                <span>ابحث الآن</span>
                            </button>
                        </div> */}
                    </div>
                </section>

                {/* Categories Section */}
                <section className="py-20 lg:py-32 px-4 bg-slate-50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">اكتشف تشكيلتنا</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto text-lg">اختر ما يناسب مناسبتك من بين مجموعتنا المتنوعة من الخيام والجلسات</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {categories.map((cat) => (
                                <div key={cat.id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 group flex flex-col">
                                    <div className="relative h-56 overflow-hidden shrink-0">
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-secondary font-bold text-sm shadow-sm">
                                            {cat.price} ريال / يوم
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col grow">
                                        <h3 className="text-2xl font-bold text-secondary mb-4">{cat.name}</h3>
                                        <ul className="space-y-3 mb-8 grow">
                                            {cat.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-slate-600">
                                                    <CheckCircle2 size={20} className="text-primary shrink-0" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <button className="w-full mt-auto bg-slate-100 text-secondary hover:bg-primary hover:text-white font-bold py-3 rounded-xl transition-colors">
                                            احجز الآن
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-20 lg:py-32 px-4 bg-white">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="flex-1">
                                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">لماذا تختار خدمة خيام؟</h2>
                                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                                    نحن نحرص على تقديم أفضل تجربة لعملائنا من خلال الجودة العالية والخدمة السريعة لنضمن لك أوقاتاً سعيدة ومريحة.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                            <ShieldCheck className="text-primary w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-secondary mb-1">جودة وأمان</h4>
                                            <p className="text-slate-500">خيام مقاومة للعوامل الجوية ومجهزة بأفضل المعايير</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                            <Clock className="text-primary w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-secondary mb-1">سرعة في التنفيذ</h4>
                                            <p className="text-slate-500">تركيب وتجهيز في الوقت المحدد دون تأخير</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                            <Users className="text-primary w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-secondary mb-1">فريق محترف</h4>
                                            <p className="text-slate-500">فريق عمل مدرب لتقديم أفضل خدمة لراحتك</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 relative w-full aspect-square md:aspect-auto">
                                <img
                                    src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?fit=crop&w=800&q=80"
                                    alt="Why Choose Us"
                                    className="rounded-3xl shadow-2xl relative z-10 w-full object-cover"
                                />
                                <div className="absolute -inset-4 bg-primary/20 rounded-3xl -z-0 rotate-3"></div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-secondary text-slate-400 py-12 px-4 border-t border-slate-800">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                            <span className="font-bold text-xl">خ</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">خيام</span>
                    </div>
                    <div className="text-center md:text-right">
                        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} خيام</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
