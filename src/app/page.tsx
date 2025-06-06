import Footer from "./components/Footer";
import Header from "./components/Header";
import About from "./components/home/About";
import Contact from "./components/home/Contact";
import Hero from "./components/home/Hero";
import Portfolio from "./components/home/Portfolio";
import Services from "./components/home/Services";
import Testimonial from "./components/home/Testimonial";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <div className="relative z-10">
        <About />
      </div>
      <Services />
      <Portfolio />
      <Testimonial />
      <Contact />
      <Footer />
    </>
  );
}
