import { SentinelNavbar } from "@/components/sentinel-navbar";

export default function HomePage() {
  return (
    <main>
      <SentinelNavbar />
      <section className="page-shell">
        <p className="demo-copy">Navbar only. The rest of the site can be added later.</p>
      </section>
    </main>
  );
}
