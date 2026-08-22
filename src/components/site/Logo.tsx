const LOGO_SRC = "/marimax-logo.jpg";

export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={LOGO_SRC}
        alt="MARIMAX"
        className="h-full w-auto rounded-sm mix-blend-screen brightness-125 contrast-125 invert"
        loading="eager"
      />
    </span>
  );
}

export function LogoLight({ className = "h-10" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img src={LOGO_SRC} alt="MARIMAX" className="h-full w-auto" loading="eager" />
    </span>
  );
}
