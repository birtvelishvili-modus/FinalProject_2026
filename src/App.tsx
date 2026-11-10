/**
 * @file App.tsx
 * @description Root Application Entrypoint amindi.ge-ს ზუსტი დიზაინით
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BackgroundSky } from './components/layout/BackgroundSky';
import { Footer } from './components/layout/Footer';
import { Converter } from './components/Converter';
import { WindAndPressure } from './features/LeftBarWindAndPressure';
import { WeatherForecast } from './features/WeatherForecast';
import { CurrentWeather } from './features/CurrentWeather';
import { HourlyWeatherForecast } from './features/HourlyWeatherForecast';
import { FullHourlyForecast } from './features/FullHourlyForecast';
import { AstrologyHoroscope } from './features/AstrologyHoroscope';
import { ZodiacDetailPage } from './features/ZodiacDetailPage';
import { CurrencyRates } from './components/currency/CurrencyRates';
import { Slider } from './features/Slider';
import { sliderData } from './services/data';
import { detectUserCity, UserCoordinates } from './services/weatherService';
import { ArrowUpRight } from 'lucide-react';
import hotsaleLogo from './assets/logo/hotsale.png';

const Box = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  const hasBg = className.includes('bg-');
  const hasText = className.includes('text-');
  const hasBorder = className.includes('border-');
  return (
    <div
      className={`flex items-center justify-center text-center text-[11px] font-bold rounded-[4px] ${
        hasBorder ? '' : 'border-2 border-dashed border-slate-400'
      } ${hasBg ? '' : 'bg-white/90'} ${hasText ? '' : 'text-slate-600'} ${className}`}
    >
      {children}
    </div>
  );
};

export default function App() {
  // მომხმარებლის მიმდინარე ქალაქი (საწყისად Tbilisi, შემდეგ დეტექტირდება ავტომატურად)
  const [city, setCity] = useState<string>('Tbilisi');
  const [coordinates, setCoordinates] = useState<UserCoordinates | null>(null);
  // ცენტრალური სექციის ხედი: 'daily' (დღეების პროგნოზი) ან 'hourly' (24-საათიანი ბადე)
  const [centerView, setCenterView] = useState<'daily' | 'hourly'>('daily');

  // არჩეული ზოდიაქოს ნიშნის ცალკე გვერდი (null = მთავარი გვერდი)
  const [activeZodiacPage, setActiveZodiacPage] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#/horoscope/')) {
      return window.location.hash.replace('#/horoscope/', '') || null;
    }
    return null;
  });
  const [activeZodiacTab, setActiveZodiacTab] = useState<'daily' | 'monthly' | 'yearly' | 'general'>('daily');

  // URL hash-ის მოსმენა (ბრაუზერის Back/Forward ღილაკებისთვის)
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/horoscope/')) {
        const sign = hash.replace('#/horoscope/', '');
        setActiveZodiacPage(sign || null);
      } else if (
        // ასტროლოგიური სექციების hash-ები — მთავარ გვერდზე ვრჩებით (zodiac widget-ამდე სქროლი)
        hash === '#/zodiac' ||
        hash === '#/astro-compatibility' ||
        hash === '#/numerology'
      ) {
        // hash მხოლოდ URL-ში ვცვლით, გვერდი არ გადაადგილდება
      } else {
        setActiveZodiacPage(null);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleNavigateToZodiac = (signId: string, tab?: string) => {
    setActiveZodiacPage(signId);
    if (tab && ['daily', 'monthly', 'yearly', 'general'].includes(tab)) {
      setActiveZodiacTab(tab as 'daily' | 'monthly' | 'yearly' | 'general');
    }
    window.location.hash = `/horoscope/${signId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMain = () => {
    setActiveZodiacPage(null);
    window.history.pushState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // აპლიკაციის ჩატვირთვისას ავტომატურად ვადგენთ მომხმარებლის ქვეყანას/ქალაქს
  useEffect(() => {
    let cancelled = false;
    detectUserCity().then((detected) => {
      if (cancelled) return;
      if (detected.kind === 'coordinates') {
        setCoordinates(detected.coordinates);
      } else {
        setCoordinates(null);
        setCity(detected.city);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BackgroundSky>
      <div className="min-h-screen text-slate-700 flex flex-col justify-between">

        {/* 1. Header (სრული სიგანით ზემოთ) */}
        <Header />

        {/* 2. ცენტრალური შეფუთვა: ზოდიაქოს ცალკე გვერდი ან მთავარი პანელი */}
        {activeZodiacPage ? (
          <main role="main" className="flex-1 w-full">
            <ZodiacDetailPage
              signId={activeZodiacPage}
              initialTab={activeZodiacTab}
              onBack={handleBackToMain}
              onSelectSign={handleNavigateToZodiac}
            />
          </main>
        ) : (
          <div className="mx-auto w-full max-w-[1240px] px-2 sm:px-4 py-2 sm:py-3 flex-1">

            {/* Top Banner (რადიო პალიტრა / რეკლამა) */}
            <div className="w-full mb-3">
              <Box className="h-[65px] sm:h-[90px] w-full bg-[#3d4b3c] text-white text-xs sm:text-base">
                Top Banner (რადიო პალიტრა FM 103.9)
              </Box>
            </div>

            {/* 3-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[235px_1fr_235px] xl:grid-cols-[260px_1fr_260px] gap-3 sm:gap-4">

              {/* მარცხენა სვეტი: ერთიანი მუქი პანელი amindi.ge-ს სტილში */}
              <aside className="w-full lg:w-[235px] xl:w-[260px] shrink-0 bg-[#2f4058]/90 text-white rounded-[4px] p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 shadow-lg backdrop-blur-sm self-start">

                {/* 1. მიმდინარე ამინდი */}
                <div className="w-full pb-3 border-b border-white/20">
                  <CurrentWeather city={city} coordinates={coordinates} />
                </div>

                {/* 2. ამინდი საათების მიხედვით */}
                <div className="w-full pb-3 border-b border-white/20">
                  <HourlyWeatherForecast
                    city={city}
                    coordinates={coordinates}
                    isFullHourlyOpen={centerView === 'hourly'}
                    onViewFullHourly={() => setCenterView((prev) => (prev === 'hourly' ? 'daily' : 'hourly'))}
                  />
                </div>

                {/* 3. ქარი და წნევა (დინამიური მონაცემებით) */}
                <div className="w-full">
                  <WindAndPressure city={city} />
                </div>

                {/* 4. ვალუტის კურსები */}
                <div className="w-full flex justify-center bg-[#1e2a3b] overflow-hidden rounded">
                  <CurrencyRates />
                </div>

              </aside>

              {/* ცენტრალური სვეტი */}
              <main className="space-y-3 sm:space-y-4 min-w-0">
                {/* ამინდის პროგნოზი: დღეების მიხედვით ან 24-საათიანი სრული ბადე */}
                <div className="w-full">
                  {centerView === 'hourly' ? (
                    <FullHourlyForecast city={city} coordinates={coordinates} />
                  ) : (
                    <WeatherForecast city={city} coordinates={coordinates} />
                  )}
                </div>

                {/* ვიდეო / ლაივ კამერა */}
                <Box className="h-[220px] sm:h-[340px] w-full bg-slate-900 text-white text-xs sm:text-base">
                  Live Video / კამერა
                </Box>

                {/* სლაიდერი (შეიძინე დანაზოგით - Hotsale) */}
                <div className="w-full">
                  <Slider slides={sliderData} />
                </div>

                {/* ასტროლოგია / ჰოროსკოპი (სულ ბოლოში) */}
                <div className="w-full">
                  <AstrologyHoroscope onNavigateToZodiac={handleNavigateToZodiac} />
                </div>
              </main>

              {/* მარჯვენა სვეტის რეკლამა */}
              <aside className="space-y-3 sm:space-y-4 flex flex-col">
                {/* ზედა რეკლამა (Palitra News) */}
                <a
                  href="https://palitranews.ge/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Palitra News-ის მთავარი ამბების ნახვა"
                  className="group relative flex h-[180px] w-full flex-col justify-between overflow-hidden rounded-[4px] bg-[#c9252c] p-4 text-white shadow-lg transition-colors hover:bg-[#b51d25] sm:h-[280px] sm:p-6"
                >
                  <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-[24px] border-white/10 sm:h-56 sm:w-56" />
                  <div className="relative flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] sm:text-sm">Palitra News</span>
                    <span className="rounded border border-white/60 px-2 py-1 text-[9px] font-bold uppercase tracking-wider sm:text-[10px]">სიახლე</span>
                  </div>
                  <div className="relative">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-xs">იყავი ინფორმირებული</p>
                    <h2 className="max-w-[210px] text-xl font-bold leading-tight sm:text-[28px]">მთავარი ამბები, ყოველთვის შენთან</h2>
                  </div>
                  <div className="relative flex items-center justify-between border-t border-white/30 pt-3 text-xs font-semibold sm:pt-4 sm:text-sm">
                    <span>გაიგე მეტი</span>
                    <ArrowUpRight aria-hidden="true" size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </a>

                {/* კონვერტორი (ზუსტად ბანერის ქვეშ) */}
                <div className="w-full">
                  <Converter />
                </div>

                {/* ქვედა რეკლამა */}
                <a
                  href="https://hotsale.ge/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Hotsale-ზე სასტუმროების შეთავაზებების ნახვა"
                  className="group relative h-[160px] w-full overflow-hidden rounded-[4px] bg-[#1e3d2f] text-white shadow-lg sm:h-[260px]"
                >
                  <img
                    src={sliderData[0].image}
                    alt=""
                    className="absolute inset-x-0 top-0 h-[58%] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-[#1e3d2f]" />
                  <div className="absolute inset-x-0 top-0 flex justify-end p-3 sm:p-4">
                    <img src={hotsaleLogo} alt="Hotsale" className="h-5 w-auto sm:h-6" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-5">
                    <div className="min-w-0">
                      <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-200 sm:text-[10px]">დროა განიტვირთო</p>
                      <h2 className="text-base font-bold leading-tight sm:text-[22px]">აღმოაჩინე დასვენების შეთავაზებები</h2>
                    </div>
                    <ArrowUpRight aria-hidden="true" size={19} className="mb-0.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </a>
              </aside>

            </div>
          </div>
        )}

        {/* 3. Footer */}
        <footer className="w-full mt-8">
          <Footer />
        </footer>

      </div>
    </BackgroundSky>
  );
}