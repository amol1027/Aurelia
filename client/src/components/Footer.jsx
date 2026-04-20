import { Link } from 'react-router-dom';
import { FaPaw, FaHeart, FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';
import { HiMail, HiArrowRight } from 'react-icons/hi';

export default function Footer() {
    return (
        <footer className="bg-warm-dark text-white/70 pt-24" aria-label="Site footer">
            <div className="max-w-[1280px] mx-auto px-6 pb-16 border-b border-white/[0.08]
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-12">

                {/* Brand */}
                <div>
                    <a href="/#hero" className="flex items-center gap-2 font-heading text-2xl font-bold text-white mb-4">
                        <FaPaw className="text-primary-500 text-xl" />
                        Aurelia
                    </a>
                    <p className="text-sm leading-relaxed mb-6 max-w-[280px]">
                        Connecting loving homes with pets who deserve them. Every adoption is a happily-ever-after.
                    </p>
                    <div className="flex gap-2">
                        {[
                            { icon: <FaInstagram />, label: 'Instagram', href: '/#testimonials' },
                            { icon: <FaTwitter />, label: 'Twitter', href: '/#testimonials' },
                            { icon: <FaFacebookF />, label: 'Facebook', href: '/#testimonials' },
                            { icon: <HiMail />, label: 'Email', href: '/how-it-works' },
                        ].map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                className="w-10 h-10 flex items-center justify-center rounded-full
                  bg-white/[0.06] text-white/60 text-sm border border-white/[0.08]
                  hover:bg-primary-500 hover:text-warm-text hover:border-primary-500
                  hover:-translate-y-0.5 transition-all duration-200"
                                aria-label={s.label}
                            >
                                {s.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-6 tracking-wide">Quick Links</h4>
                    <ul className="space-y-2">
                        {[
                            { label: 'Available Pets', to: '/pets' },
                            { label: 'Adoption Process', to: '/how-it-works' },
                            { label: 'Success Stories', to: '/#testimonials' },
                            { label: 'Volunteer', to: '/register' },
                        ].map((link) => (
                            <li key={link.label}>
                                <Link
                                    to={link.to}
                                    className="text-sm text-white/55 hover:text-primary-400 hover:pl-1

                    transition-all duration-200"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-6 tracking-wide">Support</h4>
                    <ul className="space-y-2">
                        {[
                            { label: 'FAQs', to: '/how-it-works' },
                            { label: 'Contact Us', to: '/profile' },
                            { label: 'Donation', to: '/register' },
                            { label: 'Partner Shelters', to: '/register' },
                        ].map((link) => (
                            <li key={link.label}>
                                <Link
                                    to={link.to}
                                    className="text-sm text-white/55 hover:text-primary-400 hover:pl-1
                    transition-all duration-200"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-6 tracking-wide">Stay Updated</h4>
                    <p className="text-sm mb-4">Get adoption tips and new pet alerts.</p>
                    <form className="flex rounded-full overflow-hidden border border-white/10 bg-white/[0.04]"
                        onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Your email"
                            className="flex-1 px-5 py-2.5 bg-transparent text-white text-sm outline-none
                placeholder:text-white/35 font-body"
                            aria-label="Email for newsletter"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-primary-500 text-warm-text flex items-center justify-center
                hover:bg-primary-600 transition-colors duration-200"
                            aria-label="Subscribe to newsletter"
                        >
                            <HiArrowRight size={16} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom */}
            <div className="max-w-[1280px] mx-auto px-6 py-6 flex items-center justify-center
        text-xs text-white/35 gap-1">
                <p className="flex items-center gap-1">
                    Made with <FaHeart className="text-red-400 text-[0.55rem] animate-pulse-slow" /> by Aurelia &copy; {new Date().getFullYear()}
                </p>
            </div>
        </footer>
    );
}
