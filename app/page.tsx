import Finder from "@/components/Finder";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div id="top" className="min-h-screen">
      <Hero />
      <main className="px-4">
        <Finder />
      </main>
      <Footer />
    </div>
  );
}
