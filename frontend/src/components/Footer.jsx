import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ isAdmin = false }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={isAdmin ? 'admin-footer' : 'public-footer'}>
            <div className={isAdmin ? 'admin-footer-content' : 'public-footer-content'}>
                <div className="footer-section">
                    <div className="footer-logo">
                        <img
                            src="/images/adonai-logo-compact-new.svg"
                            alt="Adonai Farm"
                            style={{ height: 28, marginRight: '0.5rem', verticalAlign: 'middle' }}
                        />
                        <span className="footer-brand">Adonai Farm</span>
                    </div>
                    <p>Premium Livestock Excellence</p>
                    <p>Sustainable farming practices in Kericho, Kenya</p>
                </div>

                <div className="footer-section">
                    <h4>Contact Information</h4>
                    <p>📍 Chepsir, Kericho, Kenya</p>
                    <p>📞 +254 722 759 217</p>
                    <p>✉️ info@adonaifarm.co.ke</p>
                </div>

                <div className="footer-section">
                    <h4>Our Services</h4>
                    <ul>
                        <li>Livestock Management</li>
                        <li>Breeding Programs</li>
                        <li>Farm Consulting</li>
                        <li>Agricultural Technology</li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/services">Services</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    © {currentYear} Adonai Farm. All rights reserved. |
                    <Link to="/privacy" style={{ marginLeft: '0.5rem' }}>Privacy Policy</Link> |
                    <Link to="/terms" style={{ marginLeft: '0.5rem' }}>Terms of Service</Link>
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem' }}>
                    🌱 Committed to sustainable agriculture and livestock excellence
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.5rem', textAlign: 'center' }}>
                    Built by <a
                        href="mailto:triolinkl@gmail.com"
                        style={{
                            color: '#8B4513',
                            textDecoration: 'none',
                            fontWeight: '600',
                            borderBottom: '1px solid transparent',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.borderBottomColor = '#8B4513';
                            e.target.style.color = '#A0522D';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.borderBottomColor = 'transparent';
                            e.target.style.color = '#8B4513';
                        }}
                    >
                        TrioLink Ltd.
                    </a> - Want a website like this? Contact us!
                </p>
            </div>
        </footer>
    );
};

export default Footer;