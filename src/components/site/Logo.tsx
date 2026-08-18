import logo from "@/assets/marimax-logo.jpg.asset.json";

export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={logo.url}
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
      <img src={logo.url} alt="MARIMAX" className="h-full w-auto" loading="eager" />
    </span>
  );
}
