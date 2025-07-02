import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="bg-gray-50 text-gray-800">

      {/* Hero Section */}
      <section className="hero-bg min-h-[400px] flex items-center justify-center text-white text-center px-4 py-16">
        <div className="bg-black bg-opacity-50 p-10 rounded" data-aos="zoom-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Connecting Global Technology</h2>
          <p className="text-lg">Bringing AI & IoT into manufacturing and business in Vietnam</p>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-16 bg-white" data-aos="fade-up">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">About Us</h3>
          <p className="max-w-3xl mx-auto text-gray-700">
            3NestInvest is an investment and trading company, specializing in introducing AI & IoT solutions from global markets into Vietnam through exclusive distribution models.
            With teams based in both the U.S. and Vietnam, we drive digital transformation for medium and large enterprises.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-16 bg-gray-100" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-10">Mission & Vision</h3>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="p-6 bg-white shadow rounded-lg">
              <h4 className="text-xl font-semibold mb-2">Our Mission</h4>
              <p>To promote digital transformation by connecting Vietnamese businesses with world-class technology.</p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg">
              <h4 className="text-xl font-semibold mb-2">Our Vision</h4>
              <p>To become Vietnam’s top catalyst in the field of AIoT and industrial digital transformation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 bg-white" data-aos="fade-up">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-10">Our Services</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 shadow rounded bg-gray-50">
              <h4 className="font-semibold text-lg mb-2">Investment & Development</h4>
              <p>Supporting Vietnamese enterprises in optimizing their technology and business models.</p>
            </div>
            <div className="p-6 shadow rounded bg-gray-50">
              <h4 className="font-semibold text-lg mb-2">Exclusive Distribution</h4>
              <p>Exclusive AI/IoT solution partnerships with global providers such as Atom Rock.</p>
            </div>
            <div className="p-6 shadow rounded bg-gray-50">
              <h4 className="font-semibold text-lg mb-2">Industrial AI & IoT</h4>
              <p>Deploying Vision AI, Audio AI, Data Analytics, and Edge-to-Cloud IoT systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-16 bg-gray-100" data-aos="fade-up">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-8">Strategic Partners</h3>
          <p className="max-w-xl mx-auto mb-6 text-gray-700">
            3NestInvest is an official "Global Enabler" partner of Atom Rock – a provider with over 4,000 deployed AI systems worldwide.
          </p>
          {/* <img
            src="https://www.atomrock.com/images/logo_dark.png"
            alt="Atom Rock logo"
            className="mx-auto h-16 opacity-80"
          /> */}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 3NestInvest. All rights reserved.</p>
          <p className="text-sm mt-2">49A Le Van Huu, Hai Ba Trung, Hanoi, Vietnam</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
