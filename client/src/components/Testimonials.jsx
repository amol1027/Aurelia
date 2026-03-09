import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
    {
        name: 'Sarah M.',
        role: 'Adopted Luna',
        text: 'Aurelia made the whole process so warm and easy. From the first visit to bringing Luna home, every step felt like it was designed with love. Our family is now complete!',
        stars: 5,
        initials: 'SM',
        color: 'bg-amber-400',
    },
    {
        name: 'James T.',
        role: 'Adopted Biscuit',
        text: "I was nervous about adopting for the first time, but the Aurelia team walked me through everything. Biscuit was the best decision I ever made — total game changer!",
        stars: 5,
        initials: 'JT',
        color: 'bg-green-400',
    },
    {
        name: 'Priya K.',
        role: 'Adopted Mochi',
        text: "The adoption process was transparent and quick. Mochi settled in within days and now rules our household. We couldn't be happier with our fluffy queen!",
        stars: 5,
        initials: 'PK',
        color: 'bg-purple-400',
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-warm-bg">
            <div className="max-w-[1280px] mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="section-label">Happy Families</span>
                    <h2 className="font-heading text-section font-bold mb-2">Stories That Warm the Heart</h2>
                    <p className="text-warm-muted max-w-[600px] mx-auto">
                        Hear from families who found their perfect companion through Aurelia.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            className="bg-warm-surface rounded-2xl p-8 shadow-warm-sm border border-warm-border
                relative transition-all duration-300 ease-out
                hover:-translate-y-1 hover:shadow-warm-lg hover:border-primary-200"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <FaQuoteLeft className="absolute top-6 right-6 text-3xl text-primary-100" />

                            {/* Stars */}
                            <div className="flex gap-1 text-primary-500 text-sm mb-4">
                                {[...Array(t.stars)].map((_, j) => (
                                    <FaStar key={j} />
                                ))}
                            </div>

                            <p className="text-warm-muted leading-[1.8] mb-6 italic">{t.text}</p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-11 h-11 rounded-full flex items-center justify-center
                    text-white font-bold text-sm shrink-0 ${t.color}`}
                                    aria-hidden="true"
                                >
                                    {t.initials}
                                </div>
                                <div>
                                    <strong className="block text-sm font-semibold text-warm-text">{t.name}</strong>
                                    <span className="text-xs text-warm-faded">{t.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
