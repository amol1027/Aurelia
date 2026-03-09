import { motion } from 'framer-motion';
import { FaArrowRight, FaHeart } from 'react-icons/fa';

export default function Hero() {
    return (
        <section
            id="hero"
            className="relative min-h-dvh flex items-center overflow-hidden pt-[72px]
        bg-gradient-to-br from-warm-bg via-primary-50 to-[#FFF5E0]"
            aria-label="Welcome to Aurelia"
        >
            {/* Decorative orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] rounded-full
          bg-[radial-gradient(circle,_#FFE08280,_transparent_70%)] blur-[80px] opacity-50 animate-float-slow" />
                <div className="absolute -bottom-[5%] -left-[5%] w-[350px] h-[350px] rounded-full
          bg-[radial-gradient(circle,_#FFE0B280,_transparent_70%)] blur-[80px] opacity-50 animate-float"
                    style={{ animationDelay: '-3s' }} />
                <div className="absolute top-1/2 left-[40%] w-[250px] h-[250px] rounded-full
          bg-[radial-gradient(circle,_#FFECB380,_transparent_70%)] blur-[80px] opacity-50 animate-float-slow"
                    style={{ animationDelay: '-5s' }} />
                {/* Dot pattern */}
                <div className="absolute inset-0
          bg-[radial-gradient(#FFD54F_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.12]" />
            </div>

            <div className="max-w-[1280px] mx-auto px-6 py-10 relative z-10
        grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24">

                {/* Content */}
                <motion.div
                    className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide
            text-primary-800 bg-gradient-to-r from-primary-50 to-primary-100
            px-4 py-1 rounded-full border border-primary-200 w-fit">
                        <FaHeart className="text-red-400 text-[0.6rem] animate-pulse-slow" />
                        Trusted by 2,000+ happy families
                    </span>

                    <h1 className="font-heading text-hero font-extrabold leading-[1.08] tracking-tight">
                        Every Pet Deserves
                        <br />
                        <span className="bg-gradient-to-r from-primary-700 via-primary-500 to-primary-800
              bg-clip-text text-transparent">
                            A Loving Home
                        </span>
                    </h1>

                    <p className="text-lg text-warm-muted leading-relaxed max-w-[500px]">
                        Aurelia connects adorable pets with caring families. Browse our furry friends,
                        fall in love, and start a beautiful journey together.
                    </p>

                    <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
                        <a href="#pets" className="btn-primary text-base px-10 py-4">
                            Meet Our Pets <FaArrowRight />
                        </a>
                        <a href="#how" className="btn-secondary text-base px-10 py-4">
                            How It Works
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 mt-6 pt-8 border-t border-warm-border
            max-sm:flex-wrap max-sm:justify-center max-sm:gap-4">
                        {[
                            { num: '2,400+', label: 'Pets Adopted' },
                            { num: '98%', label: 'Happy Matches' },
                            { num: '150+', label: 'Partner Shelters' },
                        ].map((s, i) => (
                            <div key={s.label} className="flex items-center gap-8">
                                {i > 0 && <div className="w-px h-10 bg-warm-border max-sm:hidden" />}
                                <div className="flex flex-col">
                                    <span className="font-heading text-2xl font-bold text-warm-text">{s.num}</span>
                                    <span className="text-xs text-warm-faded font-medium">{s.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Image */}
                <motion.div
                    className="relative flex justify-center items-center order-first lg:order-last"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="relative w-[300px] h-[300px] lg:w-[420px] lg:h-[420px]
            rounded-3xl overflow-hidden shadow-warm-xl">
                        <img
                            src="/pets/luna.webp"
                            alt="Luna, a friendly golden retriever available for adoption"
                            className="w-full h-full object-cover"
                        />
                        {/* Glow */}
                        <div className="absolute -inset-5 rounded-3xl
              bg-[radial-gradient(circle,_rgba(255,193,7,0.15),_transparent_60%)] -z-10" />
                    </div>

                    {/* Floating card 1 */}
                    <div className="absolute bottom-[15%] -left-[5%] lg:left-[-5%]
            flex items-center gap-2 bg-white/90 backdrop-blur-xl
            px-4 py-2 rounded-xl shadow-warm-lg border border-white/60 animate-float"
                        style={{ animationDelay: '-1s' }}>
                        <span className="text-2xl">🐾</span>
                        <div>
                            <strong className="block text-sm text-warm-text">Luna</strong>
                            <span className="text-xs text-warm-faded">Ready for adoption!</span>
                        </div>
                    </div>

                    {/* Floating card 2 */}
                    <div className="absolute top-[10%] -right-[8%] lg:right-[-8%]
            flex items-center gap-2 bg-white/90 backdrop-blur-xl
            px-4 py-2 rounded-xl shadow-warm-lg border border-white/60 animate-float"
                        style={{ animationDelay: '-3s' }}>
                        <span className="text-2xl">❤️</span>
                        <div>
                            <strong className="block text-sm text-warm-text">Matched!</strong>
                            <span className="text-xs text-warm-faded">3 families today</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
