import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLink: string;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLink,
}: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted px-4">
      {/* Animated Binge Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <svg
          viewBox="0 0 1400 700"
          className="binge-background absolute left-1/2 top-1/2 h-auto w-[1100px] max-w-none sm:w-[1250px] md:w-[1450px] lg:w-[1650px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter
              id="bingeGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="12" />
            </filter>

            <filter
              id="bingeSoftGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Soft glow behind the handwriting */}
          <text
            x="700"
            y="410"
            textAnchor="middle"
            fontFamily="Brush Script MT, Snell Roundhand, Segoe Script, cursive"
            fontSize="310"
            fontWeight="500"
            fill="none"
            stroke="#EF4444"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.16"
            filter="url(#bingeGlow)"
          >
            Binge
          </text>

          {/* Main handwritten Binge */}
          <text
            className="binge-text"
            x="700"
            y="410"
            textAnchor="middle"
            fontFamily="Brush Script MT, Snell Roundhand, Segoe Script, cursive"
            fontSize="310"
            fontWeight="500"
            fill="none"
            stroke="#EF4444"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            Binge
          </text>

          {/* Moving light along the word */}
          <text
            className="binge-highlight"
            x="700"
            y="410"
            textAnchor="middle"
            fontFamily="Brush Script MT, Snell Roundhand, Segoe Script, cursive"
            fontSize="310"
            fontWeight="500"
            fill="none"
            stroke="#F87171"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="100 1800"
            opacity="0.8"
            filter="url(#bingeSoftGlow)"
          >
            Binge
          </text>
        </svg>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border/30 bg-card/5 p-8 shadow-xl backdrop-blur-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2"
            aria-label="Binge Home"
          >
            <Image
              src="/binge.png"
              alt="Binge Logo"
              width={40}
              height={40}
              priority
              className="h-10 w-10 object-contain"
            />

            <span className="text-4xl font-bold text-red-500">
              Binge
            </span>
          </Link>

          <p className="mt-2 text-lg font-semibold text-foreground">
            {title}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footerText}{" "}
          <Link
            href={footerLink}
            className="font-semibold text-red-500 hover:underline"
          >
            {footerLinkText}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .binge-background {
          transform: translate(-50%, -50%);
          transform-origin: center;
          animation: bingeMove 24s ease-in-out infinite;
        }

        .binge-text {
          animation: bingePulse 8s ease-in-out infinite;
        }

        .binge-highlight {
          animation: bingeHighlight 6s linear infinite;
        }

        @keyframes bingeMove {
          0% {
            transform: translate(-50%, -50%) translate(-32vw, -18vh)
              rotate(-9deg) scale(0.95);
          }

          18% {
            transform: translate(-50%, -50%) translate(25vw, -28vh)
              rotate(7deg) scale(1.05);
          }

          38% {
            transform: translate(-50%, -50%) translate(32vw, 15vh)
              rotate(11deg) scale(0.92);
          }

          57% {
            transform: translate(-50%, -50%) translate(-20vw, 30vh)
              rotate(-7deg) scale(1.08);
          }

          76% {
            transform: translate(-50%, -50%) translate(-35vw, 5vh)
              rotate(-12deg) scale(0.98);
          }

          100% {
            transform: translate(-50%, -50%) translate(-32vw, -18vh)
              rotate(-9deg) scale(0.95);
          }
        }

        @keyframes bingePulse {
          0%,
          100% {
            opacity: 0.75;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes bingeHighlight {
          from {
            stroke-dashoffset: 1900;
          }

          to {
            stroke-dashoffset: -1900;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .binge-background,
          .binge-text,
          .binge-highlight {
            animation: none !important;
          }
        }

        @media (max-width: 640px) {
          .binge-background {
            animation-duration: 28s;
          }
        }
      `}</style>
    </main>
  );
}