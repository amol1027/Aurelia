import { motion } from 'framer-motion';
import { FaSearch, FaFileAlt, FaHome } from 'react-icons/fa';

const steps = [
    {
        icon: <FaSearch />,
        number: '01',
        title: 'Browse & Discover',
        desc: 'Explore our gallery of lovable pets. Filter by species, breed, age, or personality to find your perfect match.',
    },
    {
        icon: <FaFileAlt />,
        number: '02',
        title: 'Apply Online',
        desc: 'Fill out a simple adoption application. Our team reviews it within 24 hours and schedules a meet-and-greet.',
    },
    {
        icon: <FaHome />,
        number: '03',
        title: 'Welcome Home',
        desc: 'After a successful meeting, bring your new family member home. We provide a starter kit and ongoing support.',
    },
];

export default function HowItWorks() {
    return (
        <section
            id="how"
            className="py-24 bg-gradient-to-b from-primary-50 to-warm-bg"
        >
            <div className="max-w-[1280px] mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="section-label">How It Works</span>
                    <h2 className="font-heading text-section font-bold mb-2">Three Simple Steps to Happiness</h2>
                    <p className="text-warm-muted max-w-[600px] mx-auto">
                        Our streamlined adoption process makes finding your perfect companion effortless.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                    {/* Connecting line - desktop only */}
                    <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+30px)]
            w-[calc(66.66%-60px)] h-0.5
            bg-gradient-to-r from-primary-300 via-primary-500 to-primary-300" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            className="relative z-10 text-center flex flex-col items-center gap-4"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Icon circle */}
                            <div className="group relative w-[88px] h-[88px] flex items-center justify-center
                rounded-full bg-gradient-to-br from-primary-100 to-primary-50
                text-primary-700 text-[1.6rem]
                border-[3px] border-primary-200
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(45,34,25,0.12),0_0_40px_rgba(255,193,7,0.25)]
                hover:border-primary-400 hover:from-primary-200 hover:to-primary-100">
                                {step.icon}
                                {/* Number badge */}
                                <span className="absolute -top-1.5 -right-1.5 w-7 h-7 flex items-center justify-center
                  bg-gradient-to-br from-primary-500 to-primary-700
                  text-white text-xs font-bold rounded-full shadow-warm-sm">
                                    {step.number}
                                </span>
                            </div>

                            <h3 className="font-heading text-lg font-bold text-warm-text">{step.title}</h3>
                            <p className="text-sm text-warm-muted leading-relaxed max-w-[300px]">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
