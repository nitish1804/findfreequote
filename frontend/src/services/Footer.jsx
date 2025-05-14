import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const services = [
    { name: 'Solar', path: '/services/solar' },
    { name: 'Roofing', path: '/services/roofing' },
    { name: 'Windows', path: '/services/windows' },
    { name: 'HVAC', path: '/services/hvac' },
    { name: 'Siding', path: '/services/siding' },
  ];

  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'For Contractors', path: '/contractors/join' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const resourceLinks = [
    { name: 'FAQ', path: '/faq' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Contractor Terms', path: '/contractors/terms' },
  ];

  const socialMedia = [
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
    { name: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3 className="footer-heading">Services</h3>
            <ul className="footer-links">
              {services.map((service) => (
                <li key={service.name}>
                  <Link to={service.path}>{service.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-links">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-heading">Resources</h3>
            <ul className="footer-links">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-heading">Connect</h3>
            <div className="social-icons">
              {socialMedia.map((platform) => (
                <a 
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform.name}
                  className={`social-icon ${platform.icon}`}
                >
                  {/* Social media icon placeholder */}
                  {platform.icon.charAt(0).toUpperCase()}
                </a>
              ))}
            </div>
            <div className="contact-info">
              <p>1-800-FREE-QUOTE</p>
              <p>contact@findfreequote.com</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} FindFreeQuote.com. All rights reserved.
          </div>
          <div className="subfooter-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;