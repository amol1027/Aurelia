import { motion } from 'framer-motion';
import { FaArrowRight, FaPaw } from 'react-icons/fa';

export default function CallToAction() {
    return (
        <section id="cta" className="py-24 bg-warm-bg">
            <div className="max-w-[1280px] mx-auto px-6">
                <motion.div
                    className="relative overflow-hidden rounded-3xl
            bg-gradient-to-br from-accent-700 via-accent-900 to-[#1A0F0A]
            px-8 py-24 md:px-16 text-center text-white"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Decorative paws */}
                    <FaPaw className="absolute -top-2 -left-2 text-[6rem] text-primary-500/[0.06] -rotate-[25deg]" aria-hidden="true" />
                    <FaPaw className="absolute -bottom-2 -right-2 text-[8rem] text-primary-500/[0.06] rotate-[15deg]" aria-hidden="true" />

                    <span className="text-4xl block mb-4" aria-hidden="true">🐾</span>

                    <h2 className="font-heading text-section font-extrabold text-white mb-4">
                        Ready to Change a Life?
                    </h2>

                    <p className="text-lg text-white/80 max-w-[560px] mx-auto mb-10 leading-relaxed">
                        Every adoption saves two lives — the pet you bring home and the next one the shelter can take in.
                        Start your journey today.
                    </p>

                    <div className="flex justify-center">
                        <a href="#pets" className="btn-light text-base px-10 py-4">
                            Start Your Journey <FaArrowRight />
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
