"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowSquareOut, GithubLogo } from "@phosphor-icons/react";
import { NexTBLogo } from "@/components/brand/NexTBLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { transitStats } from "@/lib/stats";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function CountUp({ value, duration = 1400 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString("ro-RO")}
    </span>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-elevated bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[3.75rem] max-w-5xl items-center gap-4 px-5">
        <Link href="/" className="shrink-0">
          <NexTBLogo size="md" />
        </Link>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle compact />
          <Link
            href="/app/home"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-foreground px-5 py-2.5 text-[14px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            Deschide aplicația
            <ArrowRight className="h-4 w-4 shrink-0" weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function AppPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-elevated-2 bg-card shadow-xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-elevated px-4 py-3.5">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Piața Unirii</p>
          <p className="text-[11px] text-muted">Linia 385</p>
        </div>
        <span className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-medium text-muted">
          Live
        </span>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center gap-2.5 rounded-xl -foreground bg-elevated py-2.5 pl-2.5 pr-3">
          <span className="w-11 shrink-0 text-[15px] font-bold tabular-nums text-foreground">
            3 min
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-foreground">Otokar Kent 12m</p>
            <p className="mt-1 text-[11px] text-muted">23 pasageri · AC funcțional</p>
            <p className="mt-0.5 text-[10px] text-muted">B 42 STB · ~2 stații</p>
          </div>
          <div className="relative h-9 w-24 shrink-0">
            <Image
              src="/vehicles/Otokar+C12.png"
              alt=""
              width={48}
              height={36}
              className="h-full w-full object-contain object-right"
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-elevated/50 py-2.5 pl-2.5 pr-3 opacity-55">
          <span className="w-11 shrink-0 text-[15px] font-bold tabular-nums text-muted">8 min</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-muted">M-Benz Citaro EURO 4</p>
            <p className="mt-0.5 text-[10px] text-muted">B 385 STB · ~5 stații</p>
          </div>

          <div className="relative h-9 w-24 shrink-0">
            <Image
              src="/vehicles/4661.png"
              alt=""
              width={48}
              height={36}
              className="h-full w-full object-contain object-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


function Hero() {
  return (
    <section className="px-5 pb-16 pt-10 sm:pb-20 sm:pt-14">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-[2.75rem] sm:leading-tight">
            Are <u>aer condiționat</u> următorul autobuz?
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Urmărește autobuzele, troleibuzele și tramvaiele STB în timp real. Află modelul vehiculului, numărul de pasageri la bord și statusul AC, totul din date publice.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app/home"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-[15px] font-semibold text-background transition-opacity hover:opacity-90"
            >
              Deschide aplicația
              <ArrowRight className="h-4 w-4" weight="bold" />
            </Link>
            <Link
              href="#data-sources"
              className="inline-flex items-center justify-center rounded-xl border border-elevated-2 bg-card px-6 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-elevated"
            >
              Vezi sursele de date
            </Link>
          </div>
        </div>
        <div className="lg:justify-self-end lg:w-full lg:max-w-md">
          <AppPreview />
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { summary } = transitStats;

  return (
    <section className="border-t border-elevated bg-card/30 px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-bold tracking-tight">Datele colectate</h2>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-elevated bg-card px-4 py-4">
            <dt className="text-[12px] text-muted">autobuze în parc</dt>
            <dd className="mt-1 text-2xl font-bold text-foreground">
              <CountUp value={summary.buses} />
            </dd>
          </div>
          <div className="rounded-xl border border-elevated bg-card px-4 py-4">
            <dt className="text-[12px] text-muted">troleibuze active</dt>
            <dd className="mt-1 text-2xl font-bold text-foreground">
              <CountUp value={summary.trolleybuses} />
            </dd>
          </div>
          <div className="rounded-xl border border-elevated bg-card px-4 py-4">
            <dt className="text-[12px] text-muted">tramvaie active</dt>
            <dd className="mt-1 text-2xl font-bold text-foreground">
              <CountUp value={summary.trams} />
            </dd>
          </div>
          <div className="rounded-xl border border-elevated bg-card px-4 py-4">
            <dt className="text-[12px] text-muted">linii (GTFS)</dt>
            <dd className="mt-1 text-2xl font-bold text-foreground">
              <CountUp value={summary.lines.total} />
            </dd>
          </div>
          <div className="rounded-xl border border-elevated bg-card px-4 py-4">
            <dt className="text-[12px] text-muted">stații</dt>
            <dd className="mt-1 text-2xl font-bold text-foreground">
              <CountUp value={summary.stops} />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function InfoTb() {
  return (
    <section className="px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-bold tracking-tight">În raport cu InfoTB</h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          InfoTB este aplicația oficială STB și funcționează bine pentru urmărirea mijloacelor de transport în comun. NexTB
          nu o înlocuiește, o completează; este un proiect independent care arată cum aceleași date publice ar
          putea fi prezentate într-o manieră mai interactivă și informativă.
        </p>
      </div>
    </section>
  );
}

function Credits() {
  return (
    <section className="border-t border-elevated px-5 py-14" id="data-sources">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-bold tracking-tight">Surse de date</h2>
        <p className="mt-3 max-w-2xl text-[15px] text-muted">
          Proiectul nu ar fi fost posibil fără munca comunității și pe datele deschise TPBI (mo-bi.ro).
        </p>
        <div className="mt-6 overflow-hidden rounded-xl border border-elevated bg-card">
          <div className="hidden border-b border-elevated bg-elevated/40 px-4 py-3 sm:grid sm:grid-cols-[11rem_minmax(0,1fr)_2.5rem] sm:gap-6">
            <span className="text-[12px] font-medium uppercase tracking-wide text-muted">Sursa</span>
            <span className="text-[12px] font-medium uppercase tracking-wide text-muted">
              Ce oferă
            </span>
            <span className="sr-only">Link</span>
          </div>
          <ul className="divide-y divide-elevated">
          <li>
              <a
                href="http://transport-in-comun.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-2 px-4 py-4 transition-colors hover:bg-elevated/30 sm:grid-cols-[11rem_minmax(0,1fr)_2.5rem] sm:items-center sm:gap-6"
              >
                <span className="truncate text-[14px] font-semibold text-foreground">
                  transport-in-comun.ro
                </span>
                <p className="text-[13px] leading-relaxed text-muted sm:col-start-2 sm:row-start-1">
                  Date despre parcul de troleibuze din București: producător, tip, an fabricație,
                  depou și istoric.
                </p>
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted transition-colors group-hover:text-foreground sm:col-start-3 sm:row-start-1 sm:justify-self-end">
                  <span className="sm:hidden">Vizitează</span>
                  <ArrowSquareOut className="h-4 w-4 shrink-0" weight="bold" />
                </span>
              </a>
            </li>
            
            <li>
              <a
                href="http://metrouusor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-2 px-4 py-4 transition-colors hover:bg-elevated/30 sm:grid-cols-[11rem_minmax(0,1fr)_2.5rem] sm:items-center sm:gap-6"
              >
                <div className="flex min-w-0 items-center">
                  <Image
                    src="https://forum.metrouusor.com/images/forumlogo-medium.png"
                    alt="Metrou Ușor"
                    width={160}
                    height={36}
                    className="h-7 w-auto max-w-full object-contain object-left opacity-90 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <p className="text-[13px] leading-relaxed text-muted sm:col-start-2 sm:row-start-1">
                  Date despre autobuze și tramvaie: număr parc, autobază, kilometraj și alte observații tehnice.
                </p>
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted transition-colors group-hover:text-foreground sm:col-start-3 sm:row-start-1 sm:justify-self-end">
                  <span className="sm:hidden">Vizitează</span>
                  <ArrowSquareOut className="h-4 w-4 shrink-0" weight="bold" />
                </span>
              </a>
            </li>

            <li>
              <a
                href="https://mo-bi.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-2 px-4 py-4 transition-colors hover:bg-elevated/30 sm:grid-cols-[11rem_minmax(0,1fr)_2.5rem] sm:items-center sm:gap-6"
              >
                <div className="flex min-w-0 items-center">
                  <Image
                    src="https://mo-bi.ro/sites/default/files/TPBI_0.png"
                    alt="TPBI"
                    width={120}
                    height={36}
                    className="h-7 w-auto max-w-full object-contain object-left opacity-90 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <p className="text-[13px] leading-relaxed text-muted sm:col-start-2 sm:row-start-1">
                  Date live: poziția vehiculelor, sosiri estimate, număr de pasageri la bord și identificatori tehnici.
                </p>
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted transition-colors group-hover:text-foreground sm:col-start-3 sm:row-start-1 sm:justify-self-end">
                  <span className="sm:hidden">Vizitează</span>
                  <ArrowSquareOut className="h-4 w-4 shrink-0" weight="bold" />
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 pb-16 pt-2">
      <div className="mx-auto max-w-5xl rounded-2xl border border-elevated bg-card px-6 py-12 text-center sm:px-10 sm:py-14">
        <h2 className="text-2xl font-bold tracking-tight">Gata de plecare?</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
          Deschide interfața și urmărește următorul vehicul. <br />  Nu ai nevoie de cont sau de a instala vreo aplicație.
        </p>
        <Link
          href="/app/home"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-foreground px-7 py-3.5 text-[15px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          Deschide aplicația
          <ArrowRight className="h-4 w-4" weight="bold" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-elevated px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-row items-center gap-2">
            <NexTBLogo size="sm" /> 
            <div className="w-[1px] h-4 bg-elevated-2"></div>
            <p className="text-[12px] text-muted">
              Versiunea W2.0.0
            </p>
          </div>
          <a
            href="https://github.com/rocristoi/nextb-web"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-foreground"
          >
            <GithubLogo className="h-4 w-4" weight="fill" />
            Vezi codul sursă
          </a>
        </div>
        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
          <Link href="/termeni" className="transition-colors hover:text-foreground">
            Termeni și condiții
          </Link>
          <Link href="/confidentialitate" className="transition-colors hover:text-foreground">
            Politica de confidențialitate
          </Link>
          <Link href="/app/home" className="transition-colors hover:text-foreground">
            Deschide aplicația
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Stats />
        <InfoTb />
        <Credits />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
