import React from 'react';
import { Head } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import useWebsiteSetting from '@/hooks/use-website-setting';

// Subcomponents
import Navbar from './components/navbar';
import Hero from './components/hero';
import Services from './components/services';
import About from './components/about';
import Booking from './components/booking';
import Doctors from './components/doctors';
import StatsBanner from './components/stats-banner';
import Testimonials from './components/testimonials';
import CtaBanner from './components/cta-banner';
import Footer from './components/footer';

export default function HomePage() {
    const { isRtl } = useImport();
    const { settings } = useWebsiteSetting();

    const title = isRtl
        ? (settings?.title_ar || '')
        : (settings?.title_en || '');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-300">
            <Head title={title} />

            {/* Navigation Header */}
            <Navbar />

            {/* Main Sections */}
            <main>
                <Hero />
                <Services />
                <About />
                <Booking />
                <Doctors />
                <StatsBanner />
                <Testimonials />
                <CtaBanner />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
