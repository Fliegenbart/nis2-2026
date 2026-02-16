"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let frame: number;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);

  return count;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface ScannerViewportProps {
  locale: string;
  children?: React.ReactNode;
}

export function ScannerViewport({ locale, children }: ScannerViewportProps) {
  const t = useTranslations("landing.socialProof");
  const statsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const hasChildren = !!children;

  const sectionTitle =
    locale === "de"
      ? "Echtzeit-Bedrohungsanalyse"
      : "Real-Time Threat Analysis";

  // IntersectionObserver to trigger count-up
  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Count-up values
  const scanned = useCountUp(1247, 1500, isVisible);
  const atRisk = useCountUp(873, 1500, isVisible);
  const secured = useCountUp(89, 1500, isVisible);

  const stats = [
    { value: scanned.toLocaleString("de-DE") + "+", label: t("scanned") },
    { value: atRisk.toLocaleString("de-DE"), label: t("atRisk") },
    { value: secured.toLocaleString("de-DE"), label: t("secured") },
  ];

  return (
    <section className="bg-slate-950 py-32 sm:py-40" id="scanner-viewport">
      <div className="container mx-auto px-4">
        {/* Section headline */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-center">
          {sectionTitle}
        </h2>

        {/* Stats row */}
        <div ref={statsRef} className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center"
            >
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Children container (QuickCheck or Results) */}
        {hasChildren && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 mt-12">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
