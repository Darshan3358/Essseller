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
import { ShoppingCart, Star, Sparkles as SparklesIcon, Monitor, Watch, Zap, ShoppingBag as ShoppingBagIcon } from 'lucide-react';

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
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Global E-Commerce Excellence</span>
          </div>

          <h1 className={styles.h1}>
            Your Global Store, <span>Powered by Intelligence.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The ultimate ecosystem for modern sellers. Discover high-margin products, coordinate with elite suppliers, and scale your brand globally.
          </p>
          <div className={styles.heroCtas}>
            <button onClick={handleGetStarted} className={styles.btnPrimary}>
              Open Your Store
            </button>
            <Link href="#showcase" className={styles.btnSecondary}>
              Explore Catalog
            </Link>
          </div>

          {/* Product Showcase - E-commerce Feel */}
          <div id="showcase" className={styles.productShowcase}>
            {[
              {
                id: 1,
                name: 'Audiophile Pro X-1',
                category: 'Electronics',
                price: 249,
                oldPrice: 399,
                image: '/wireless_headphones_hero_1773860911797.png'
              },
              {
                id: 2,
                name: 'Zenith Titanium',
                category: 'Fashion',
                price: 189,
                oldPrice: 249,
                image: '/smart_watch_hero_1773861068085.png'
              },
              {
                id: 3,
                name: 'Neo-Flow Runners',
                category: 'Footwear',
                price: 129,
                oldPrice: 199,
                image: '/running_sneakers_hero_1773861091920.png'
              },
              {
                id: 4,
                name: 'Aura Matte Series',
                category: 'Lifestyle',
                price: 45,
                oldPrice: 89,
                image: '/eco_water_bottle_hero_1773861108133.png'
              }
            ].map((product) => (
              <motion.div
                key={product.id}
                className={styles.productCard}
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={styles.productImage}>
                  <img src={product.image} alt={product.name} />
                </div>
                <div className={styles.productInfo}>
                  <p className={styles.productCategory}>{product.category}</p>
                  <h3 className={styles.productTitle}>{product.name}</h3>
                  <div className={styles.productPrice}>
                    ${product.price}
                    <span>${product.oldPrice}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 3. Trending Categories */}
        <section className={styles.section}>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-white">Trending Categories</h2>
            <Link href="/register" className="text-blue-400 font-bold flex items-center gap-2 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className={styles.categoryGrid}>
            {[
              { name: 'Electronics', icon: <Monitor className="w-6 h-6" /> },
              { name: 'Fashion', icon: <Watch className="w-6 h-6" /> },
              { name: 'Fitness', icon: <Zap className="w-6 h-6" /> },
              { name: 'Home & Living', icon: <ShoppingBagIcon className="w-6 h-6" /> },
            ].map((cat, i) => (
              <div key={i} className={styles.categoryCard}>
                <div className="p-4 bg-white/5 rounded-2xl text-blue-400">
                  {cat.icon}
                </div>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </section>



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
