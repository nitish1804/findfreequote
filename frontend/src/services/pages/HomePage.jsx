import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const services = [
    {
      id: 1,
      name: 'Solar',
      icon: '☀️',
      description: 'Get free quotes for solar panel installation from top-rated installers'
    },
    {
      id: 2,
      name: 'Roofing',
      icon: '🏠',
      description: 'Connect with professional roofing contractors for repairs or replacement'
    },
    {
      id: 3,
      name: 'Windows',
      icon: '🪟',
      description: 'Find reliable window installation and replacement services'
    },
    {
      id: 4,
      name: 'HVAC',
      icon: '❄️',
      description: 'Compare quotes for heating, ventilation, and air conditioning services'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Get Free Quotes From Trusted Home Service Professionals</h1>
          <p>Compare multiple quotes for Solar, Roofing, Windows, and more - all at no cost to you.</p>
          <div className="cta-buttons">
            <Link to="/get-quotes" className="btn btn-primary">
              Get Free Quotes Now
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              How It Works
            </Link>
          </div>
        </div>
        <div className="hero-image">
          {/* Hero image will be added here */}
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <Link to={`/services/${service.name.toLowerCase()}`} className="service-link">
                Learn More
              </Link>
            </div>
          ))}
        </div>
        <div className="all-services">
          <Link to="/services">View All Services →</Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Fill out a quick form</h3>
            <p>Tell us about your project needs in just 2 minutes.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get matched with pros</h3>
            <p>We connect you with pre-screened, qualified contractors.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Compare quotes & save</h3>
            <p>Review free quotes and choose the best option for you.</p>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="trust-signals-section">
        <div className="trust-signal">
          <div className="trust-number">10,000+</div>
          <div className="trust-text">Homeowners Served</div>
        </div>
        <div className="trust-signal">
          <div className="trust-number">4.8/5</div>
          <div className="trust-text">Customer Rating</div>
        </div>
        <div className="trust-signal">
          <div className="trust-number">500+</div>
          <div className="trust-text">Verified Contractors</div>
        </div>
        <div className="trust-signal">
          <div className="trust-number">100%</div>
          <div className="trust-text">Free Service</div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar"></div>
              <div>
                <div className="testimonial-name">Jennifer S.</div>
                <div className="testimonial-location">Dallas, TX</div>
              </div>
            </div>
            <p className="testimonial-quote">
              "FindFreeQuote made it so easy to compare solar installation options. Saved me time and money!"
            </p>
            <div className="testimonial-rating">★★★★★</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar"></div>
              <div>
                <div className="testimonial-name">Michael T.</div>
                <div className="testimonial-location">Portland, OR</div>
              </div>
            </div>
            <p className="testimonial-quote">
              "Got 3 quotes for my roof replacement in minutes. The contractors were all top-notch."
            </p>
            <div className="testimonial-rating">★★★★★</div>
          </div>
        </div>
      </section>

      {/* Contractor CTA Section */}
      <section className="contractor-cta-section">
        <div className="contractor-cta-content">
          <h2>Are You a Contractor?</h2>
          <p>
            Join our network of trusted professionals and connect with homeowners actively looking for your services.
          </p>
          <Link to="/contractors/join" className="btn btn-white">
            Join Our Network
          </Link>
        </div>
        <div className="contractor-cta-image">
          {/* Contractor image will be added here */}
        </div>
      </section>
    </div>
  );
};

export default HomePage;