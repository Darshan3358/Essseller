'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Database, Users, Wallet, BarChart, CheckCircle2, Shield, Gem,
  TrendingUp, Package, Box, DollarSign, ClipboardList, Twitter, Linkedin, Instagram, MessageCircle, ArrowRight
} from 'lucide-react';
import { Outfit } from 'next/font/google';
import styles from './landing.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '700', '800'] });

const NavLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Testimonials', href: '#testimonials' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use framer motion variants
  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  if (isLoading) return <div className={styles.mainContainer} />;

  // If user is logged in and visits root, they should logically see their dashboard or the landing
  // According to standard SaaS, if already logged in we might either redirect or just let them go to dashboard
  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  return (
    <div className={`${styles.body} ${outfit.className}`}>
      <div className={styles.mainContainer}>
        {/* Decorative Elements */}
        <div className={styles.gridOverlay} />

        {/* Animated Blobs */}
        <div className={styles.blob} style={{ width: '40vw', height: '40vw', background: 'rgba(0, 123, 255, 0.15)', top: '-10%', right: '-5%' }} />
        <div className={styles.blob} style={{ width: '35vw', height: '35vw', background: 'rgba(0, 180, 216, 0.1)', bottom: '10%', left: '-10%', animationDelay: '-5s' }} />
        <div className={styles.blob} style={{ width: '25vw', height: '25vw', background: 'rgba(0, 80, 255, 0.08)', top: '40%', left: '40%', animationDelay: '-10s' }} />

        {/* 1. Sticky Header */}
        <header className={`${styles.nav} ${scrolled ? 'bg-black/90 shadow-2xl backdrop-blur-xl' : 'bg-transparent'}`}>
          <Link href="/" className={styles.logo}>
            ESS <span>SmartSeller</span>
          </Link>
          <nav className={styles.navLinks}>
            {NavLinks.map(link => (
              <Link key={link.name} href={link.href}>{link.name}</Link>
            ))}
          </nav>
          <div className={styles.navActions}>
            {user ? (
              <button onClick={() => router.push('/dashboard')} className={styles.btnSecondary}>Dashboard</button>
            ) : (
              <Link href="/login" className={styles.btnSecondary}>Log In</Link>
            )}
            <button onClick={handleGetStarted} className={styles.btnPrimary}>
              Get Started
            </button>
          </div>
        </header>

        {/* 2. Hero Section */}
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ opacity, scale }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Professional E-Commerce Seller Platform</span>
          </div>

          <h1 className={styles.h1}>
            Empower Your E-Commerce Journey with <span>EssSmartSeller</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The powerful all-in-one ecosystem for managing products, coordinating with suppliers, and tracking orders. Scale your seller profile with a one-time license activation.
          </p>
          <div className={styles.heroCtas}>
            <button onClick={handleGetStarted} className={styles.btnPrimary}>
              Start Selling Today
            </button>
            <Link href="#how-it-works" className={styles.btnSecondary}>
              View Demo
            </Link>
          </div>

          <motion.div
            className={styles.dashboardMockup}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Fintech Dashboard Mockup */}
            <div className="w-full max-w-4xl h-64 md:h-[450px] bg-[#0A0F1C] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,123,255,0.2)] flex flex-col relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent pointer-events-none" />

              {/* Mockup Toolbar */}
              <div className="h-12 bg-[#05070A] border-b border-white/5 flex items-center justify-between px-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                </div>
                <div className="h-6 w-64 bg-white/5 rounded-full border border-white/5" />
                <div className="w-8 h-8 rounded-lg bg-blue-500/20" />
              </div>

              <div className="flex-1 p-8 flex gap-8 z-10">
                {/* Sidebar Sidebar */}
                <div className="hidden md:flex w-48 flex-col gap-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-8 rounded-lg flex items-center gap-3 px-3 ${i === 1 ? 'bg-blue-500/20 border border-blue-500/20' : 'bg-white/5'}`}>
                      <div className={`w-3 h-3 rounded-sm ${i === 1 ? 'bg-blue-400' : 'bg-white/10'}`} />
                      <div className="h-2 flex-1 bg-white/10 rounded-full" />
                    </div>
                  ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-8">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: 'Active Orders', val: '2,341', color: 'text-blue-400' },
                      { label: 'Net Profit', val: '$14,210', color: 'text-emerald-400' },
                      { label: 'Fulfillment', val: '98.2%', color: 'text-blue-400' }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</span>
                        <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Large Chart Area */}
                  <div className="flex-1 bg-white/2 rounded-xl border border-white/5 p-6 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold text-slate-400">Profit Overview</span>
                      <div className="flex gap-2">
                        <div className="w-12 h-4 bg-blue-500/20 rounded" />
                        <div className="w-12 h-4 bg-emerald-500/20 rounded" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-32 flex items-end gap-1 px-4">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-400/80 rounded-t-sm"
                          style={{ height: `${Math.sin(i * 0.5) * 40 + 60}%`, opacity: 0.6 + (i / 50) }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-around px-4 pointer-events-none">
                      {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white/5" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>



        {/* 4. Features Section */}
        <section id="features" className={styles.section}>
          <motion.h2
            className={styles.sectionTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            Built for Maximum Efficiency
          </motion.h2>

          <motion.div
            className={styles.grid}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          >
            {[
              { icon: <Package className="w-8 h-8 text-blue-400" />, title: 'Product Catalog', desc: 'Browse thousands of products from global suppliers and add them to your store with one click.' },
              { icon: <Box className="w-8 h-8 text-blue-400" />, title: 'Smart Storehouse', desc: 'Manage your local inventory efficiently with our integrated storage tracking system.' },
              { icon: <DollarSign className="w-8 h-8 text-blue-400" />, title: 'Wallet & Finance', desc: 'Securely manage your earnings, track commissions, and withdraw profit directly to your preferred account.' },
              { icon: <ClipboardList className="w-8 h-8 text-blue-400" />, title: 'Order Center', desc: 'Monitor customer orders and track fulfillment status in real-time from a single dashboard.' },
            ].map((feature, idx) => (
              <motion.div key={idx} className={styles.card} variants={fadeInUp}>
                <div className={styles.cardIcon}>{feature.icon}</div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardText}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 5. How It Works */}
        <section id="how-it-works" className={styles.section} style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.h2
            className={styles.sectionTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            How It Works
          </motion.h2>

          <div className={styles.timeline}>
            <motion.div className={styles.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepContent}>
                <h3 className="text-xl font-bold mb-4">Account Creation</h3>
                <p className="text-secondary">Register your seller account and complete your profile to access our global marketplace.</p>
              </div>
            </motion.div>
            <motion.div className={styles.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepContent}>
                <h3 className="text-xl font-bold mb-4">Package Activation</h3>
                <p className="text-secondary">Choose a merchant license that fits your scale. A one-time activation unlocks full selling power.</p>
              </div>
            </motion.div>
            <motion.div className={styles.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepContent}>
                <h3 className="text-xl font-bold mb-4">Start Selling</h3>
                <p className="text-secondary">Add products to your catalog, manage orders in the center, and withdraw your commissions.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 6. Pricing Section */}
        <section id="pricing" className={styles.section}>
          <motion.h2
            className={styles.sectionTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            Simple, Transparent Pricing
          </motion.h2>

          <motion.div
            className={styles.pricingGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          >
            <motion.div className={styles.pricingCard} variants={fadeInUp}>
              <h3 className={styles.pricingTitle}>Starter Merchant</h3>
              <p className="text-secondary mb-6 text-sm">Perfect for new sellers starting their journey.</p>
              <div className="text-4xl font-black text-white mb-2">$50</div>
              <div className="text-xs text-secondary mb-6 uppercase tracking-widest font-bold">Single Charge</div>
              <ul className={styles.pricingFeatures}>
                <li><CheckCircle2 size={16} /><span className="text-sm">5000 Products Limit</span></li>
                <li><CheckCircle2 size={16} /><span className="text-sm">Basic Analytics</span></li>
                <li><CheckCircle2 size={16} /><span className="text-sm">Community Support</span></li>
                <li><CheckCircle2 size={16} /><span className="text-sm">Standard Shipping Rates</span></li>
              </ul>
              <button onClick={handleGetStarted} className={styles.btnSecondary} style={{ width: '100%', marginTop: 'auto' }}>Get Started</button>
            </motion.div>

            <motion.div className={`${styles.pricingCard} ${styles.popular}`} variants={fadeInUp}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-400" />
              <span className={styles.popularBadge}>Most Popular</span>
              <h3 className={styles.pricingTitle} style={{ marginTop: '1rem' }}>Professional Seller</h3>
              <p className="text-secondary mb-6 text-sm">Scale your business with advanced tools.</p>
              <div className="text-5xl font-black text-white mb-2">$150</div>
              <div className="text-[10px] text-blue-400 mb-8 uppercase tracking-[0.2em] font-black">One-Time Activation</div>
              <ul className={styles.pricingFeatures} style={{ marginBottom: '3rem' }}>
                <li><CheckCircle2 size={16} className="text-blue-400" /><span className="text-sm">10,000 Products Limit</span></li>
                <li><CheckCircle2 size={16} className="text-blue-400" /><span className="text-sm">Order Center Access</span></li>
                <li><CheckCircle2 size={16} className="text-blue-400" /><span className="text-sm">Priority 24/7 Support</span></li>
                <li><CheckCircle2 size={16} className="text-blue-400" /><span className="text-sm">Storehouse Analytics</span></li>
                <li><CheckCircle2 size={16} className="text-blue-400" /><span className="text-sm">Custom Profile Branding</span></li>
              </ul>
              <button onClick={handleGetStarted} className={styles.btnPrimary} style={{ width: '100%', padding: '1.25rem' }}>Active License</button>
            </motion.div>

            <motion.div className={styles.pricingCard} variants={fadeInUp}>
              <h3 className={styles.pricingTitle}>Enterprise Pro</h3>
              <p className="text-secondary mb-6 text-sm">Complete solution for large scale operations.</p>
              <div className="text-4xl font-black text-white mb-2">$450</div>
              <div className="text-xs text-secondary mb-6 uppercase tracking-widest font-bold">Single Charge</div>
              <ul className={styles.pricingFeatures}>
                <li><CheckCircle2 size={16} /><span className="text-sm">18,000 Products Limit</span></li>
                <li><CheckCircle2 size={16} /><span className="text-sm">Multiple Storefronts</span></li>
                <li><CheckCircle2 size={16} /><span className="text-sm">Dedicated Account Manager</span></li>
                <li><CheckCircle2 size={16} /><span className="text-sm">Spread Packages Support</span></li>
                <li><CheckCircle2 size={16} /><span className="text-sm">Product Query Priority</span></li>
                <li><CheckCircle2 size={16} /><span className="text-sm">Enterprise Onboarding</span></li>
              </ul>
              <button onClick={handleGetStarted} className={styles.btnSecondary} style={{ width: '100%', marginTop: 'auto' }}>Get Started</button>
            </motion.div>
          </motion.div>
        </section>

        {/* 7. Testimonials */}
        <section id="testimonials" className={styles.section}>
          <motion.h2
            className={styles.sectionTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            What Our Sellers Say
          </motion.h2>

          <motion.div
            className={styles.testimonials}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          >
            <motion.div className={styles.testimonialCard} variants={fadeInUp}>
              <p className={styles.quote}>"Since using this platform, my order processing time has been cut in half. The supplier integration is absolutely flawless! Highly recommended."</p>
              <div className={styles.author}>
                <div className={styles.avatar}>SK</div>
                <div>
                  <div className={styles.authorName}>Sarah K.</div>
                  <div className={styles.authorTitle}>Boutique Owner</div>
                </div>
              </div>
            </motion.div>
            <motion.div className={styles.testimonialCard} variants={fadeInUp}>
              <p className={styles.quote}>"The withdrawal process is so transparent and fast. It feels like a true financial tool built for e-commerce entrepreneurs. Nothing else compares."</p>
              <div className={styles.author}>
                <div className={styles.avatar}>MT</div>
                <div>
                  <div className={styles.authorName}>Mike T.</div>
                  <div className={styles.authorTitle}>E-com Entrepreneur</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 8. Final CTA Section */}
        <section className={styles.ctaSection}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2>Ready to scale your e-commerce business?</h2>
            <p>Join thousands of successful sellers today. Setup takes less than 5 minutes.</p>
            <button onClick={handleGetStarted} className={styles.btnPrimary} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
              Create Your Free Account
            </button>
          </motion.div>
        </section>

        {/* 9. Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <Link href="/" className={styles.logo} style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                ESS <span>SmartSeller</span>
              </Link>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                The ultimate operating system for modern e-commerce sellers. Manage inventory, suppliers, and finances all in one place.
              </p>
              <div className={styles.socialIcons}>
                <a href="#"><Twitter size={20} /></a>
                <a href="#"><Linkedin size={20} /></a>
                <a href="#"><Instagram size={20} /></a>
                <a href="#"><MessageCircle size={20} /></a>
              </div>
            </div>

            <div className={styles.footerCol}>
              <h4>Product</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#">Updates</a></li>
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h4>Company</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h4>Legal</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Return Policy</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.copyright}>
            © {new Date().getFullYear()} EssSmartSeller. All systems operational.
          </div>
        </footer>
      </div>
    </div>
  );
}
