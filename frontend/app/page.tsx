'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Plus, Minus, Info } from 'lucide-react';
import styles from './landing.module.css';

export default function LandingPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const handleGetStarted = () => {
        if (user) {
            router.push('/dashboard');
        } else {
            router.push('/register');
        }
    };

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    if (isLoading) return <div className="min-h-screen bg-white" />;

    return (
        <div className={styles.body}>
            {/* Main Header */}
            <header className={styles.mainHeader}>
                <div className={styles.logo}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden' }}>
                            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ color: '#111', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>SmartSeller</span>
                    </Link>
                </div>
                <div className={styles.rightLinks}>
                    {user ? (
                        <Link href="/dashboard" className={styles.btnPrimary}>Dashboard</Link>
                    ) : (
                        <Link href="/login" className={styles.btnPrimary}>Login</Link>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroOverlay}>
                    <div className={styles.heroCard}>
                        <h2>Make money selling on ESS</h2>
                        <p>Sell your items fast—millions of buyers are waiting.</p>
                        <button onClick={handleGetStarted} className={styles.btnPrimary}>
                            List an item
                        </button>
                    </div>
                </div>
            </section>

            {/* Basics Section */}
            <section className={styles.basicsSection}>
                <div className={styles.container}>
                    <h2>Learn the basics</h2>
                    <p className={styles.subtitle}>Here's what you need to know to start selling.</p>

                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.circle}>1</div>
                            <h3>Instantly List Winning Products & Launch Your Store</h3>
                            <p>Access a ready-made catalog of high-demand, proven-to-sell products. Listings come fully optimized with images, descriptions, and pricing — just activate and go live. No inventory, no guesswork.</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.circle}>2</div>
                            <h3>Sell with Built-In Operational Support & Risk Protection</h3>
                            <p>Focus on scaling — we handle supplier management, fulfillment, and customer inquiries. With real-time monitoring and expert support, your store runs smoothly, 24/7.</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.circle}>3</div>
                            <h3>Get Paid On Your Terms — When You Make a Sale</h3>
                            <p>Enjoy fast, flexible payouts — choose daily or weekly. Once a product sells, your earnings are automatically deposited. You sell, we fulfill, and you get paid. Simple as that.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Business Section */}
            <section className={styles.businessSection}>
                <div className={styles.container}>
                    <div className={styles.businessContent}>
                        <div className={styles.textContent}>
                            <h2>Selling as a business? We make it easy</h2>
                            <p>
                                We've got powerful tools to help you manage your inventory and orders,
                                track your sales, and build your brand.
                            </p>
                            <button onClick={handleGetStarted} className={styles.btnPrimary} style={{ background: 'transparent', border: '1.5px solid #3665f3', color: '#3665f3' }}>
                                Get Started Today
                            </button>
                        </div>
                        <div className={styles.imageContent}>
                            <img src="https://i.ebayimg.com/00/s/NjY3WDE2MDA=/z/wdoAAOSwU3tksa02/$_57.JPG" alt="Merchant packing box" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Listing Section */}
            <section className={styles.listingSection}>
                <div className={styles.container}>
                    <div className={styles.listingHeader}>
                        <h2>Create a great listing</h2>
                        <p>Here’s six ways to set yourself up for success.</p>
                    </div>
                    <div className={styles.cardSlider}>
                        <div className={styles.card} style={{ backgroundColor: '#fff3e6' }}>
                            <h3>Use High-Converting Product Titles</h3>
                            <ul>
                                <li>We provide data-backed suggestions so you can create titles that attract clicks. </li>
                                <li>Just tweak the keywords — we've already done the heavy lifting!</li>
                            </ul>
                        </div>
                        <div className={styles.card} style={{ backgroundColor: '#fff9cc' }}>
                            <h3>Skip the Photo Hassle</h3>
                            <ul>
                                <li>No need to shoot your own photos — we supply professional, high-quality images for all products. </li>
                                <li>Clean, clear, and conversion-optimized.</li>
                            </ul>
                        </div>
                        <div className={styles.card} style={{ backgroundColor: '#e6f0ff' }}>
                            <h3>Choose the Best Selling Format</h3>
                            <ul>
                                <li>We test and optimize the sales formats for you. </li>
                                <li>Whether it's fixed-price or limited-time offers, your listings are set up to convert fast.</li>
                            </ul>
                        </div>
                        <div className={styles.card} style={{ backgroundColor: '#e6ffe6' }}>
                            <h3>Set to Sell at the Right Price</h3>
                            <ul>
                                <li>We analyze market trends and auto-suggest pricing that stays competitive.</li>
                                <li>While still giving you great profit margins.</li>
                            </ul>
                        </div>
                        <div className={styles.card} style={{ backgroundColor: '#ffe6f2' }}>
                            <h3>Reliable, Fast Shipping Options</h3>
                            <ul>
                                <li>Products are sourced from trusted suppliers with fast delivery times.</li>
                                <li>Shipping details are already handled — just list and sell.</li>
                            </ul>
                        </div>
                        <div className={styles.card} style={{ backgroundColor: '#f2e6ff' }}>
                            <h3>Ready-to-Go Item Details</h3>
                            <ul>
                                <li>No guesswork needed — product descriptions, specs, and categories are pre-filled.</li>
                                <li>Accurate, clear, and optimized for search visibility.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className={styles.faqSection}>
                <h2>FAQ</h2>
                <div className={styles.faqContainer}>
                    {[
                        { q: "How much does it cost to sell?", a: "Our platform charges a yearly subscription fee, billed after the first year of service. You only pay once the service has been fully provided, ensuring you have a full year to grow your business risk-free." },
                        { q: "What’s the best way to ship my item?", a: "We’ve partnered with trusted suppliers who handle fulfillment, so you don’t need to worry about shipping. You get fast, reliable delivery with tracking included." },
                        { q: "Can I sell locally on my platform?", a: "Yes! We offer location-based sales options, allowing you to target specific regions and cater to local buyers." },
                        { q: "How much will it cost to ship my item?", a: "Shipping costs are covered by our trusted suppliers, and you can offer competitive rates to your customers. Costs are automatically calculated based on the product's dimensions and destination." },
                        { q: "Where can I get shipping supplies?", a: "With our DFY platform, no shipping supplies are needed! We take care of fulfillment, including packaging and shipping, through our reliable network of suppliers." },
                        { q: "How should I choose my listing price?", a: "We’ve optimized product pricing based on market trends and competitor analysis. You can tweak prices, but we suggest following our pre-set guidelines for maximum profitability." },
                        { q: "How does your platform protect sellers?", a: "We offer comprehensive seller protections, covering everything from returns to payment disputes. Plus, our platform provides 24/7 support to ensure your business runs smoothly." },
                        { q: "What can I sell on your platform?", a: "Our platform allows you to sell a wide range of products from various categories. We handle sourcing and ensure all products are in high demand — but please review our approved product categories for compliance." }
                    ].map((faq, i) => (
                        <div key={i} className={`${styles.faqItem} ${activeFaq === i ? styles.active : ''}`}>
                            <button className={styles.faqQuestion} onClick={() => toggleFaq(i)}>
                                {faq.q}
                                <span><ChevronDown size={18} /></span>
                            </button>
                            <div className={styles.faqAnswer}>
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA Banner */}
            <section className={styles.heroBanner}>
                <div className={styles.heroBannerContent}>
                    <h1>You've got this.<br />We've got your back.</h1>
                    <button onClick={handleGetStarted} className={styles.btnPrimary} style={{ borderRadius: '30px', padding: '12px 30px' }}>
                        List an item
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.siteFooter}>
                <div className={styles.footerBottom}>
                    <p>Copyright © 1995–2025 ESS Inc. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
