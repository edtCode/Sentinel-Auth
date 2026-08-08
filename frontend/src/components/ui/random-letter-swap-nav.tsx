import { RandomLetterSwap } from "@/components/ui/random-letter-swap";

const links = [
  { label: "Home", href: "#top" },
  { label: "Docs", href: "#docs" },
  { label: "Changelog", href: "#changelog" },
  { label: "GitHub", href: "https://github.com/Brijnandan11", external: true },
];

export function RandomLetterSwapNav() {
  return (
    <nav className="hidden items-center gap-6 lg:flex">
      {links.map((link) => (
        <RandomLetterSwap
          key={link.label + link.href}
          label={link.label}
          href={link.href}
          external={link.external}
        />
      ))}
    </nav>
  );
}