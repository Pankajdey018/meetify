import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { FiVideo, FiLock, FiZap, FiGlobe } from "react-icons/fi";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landingPageContainer">
      <div className="pageWrapper">
        {/* ---------- NAV ---------- */}
        <nav>
          <h2>Meetify</h2>

          <div className="navList">
            <p onClick={() => navigate("/auth")}>REGISTER</p>
            <div role="button" onClick={() => navigate("/auth")}>
              <p>LOGIN</p>
            </div>
          </div>
        </nav>

        {/* ---------- FEATURES ---------- */}
        <div className="featureStrip">
          <Feature icon={<FiVideo />} text="HD Video" />
          <Feature icon={<FiLock />} text="Secure Calls" />
          <Feature icon={<FiZap />} text="Real-time" />
          <Feature icon={<FiGlobe />} text="Global Access" />
        </div>

        {/* ---------- HERO ---------- */}
        <div className="landingMainContainer">
          <div>
            <h1>
              <span className="accent">CONNECT</span> with your loved ones
            </h1>
            <p>Cover the distance with Meetify</p>

            <div role="button">
              <Link to="/auth">Get Started</Link>
            </div>
          </div>

          {/* ---------- IMAGE + STATUS DOT ---------- */}
          <div className="imageWrapper">
            <span className="statusDot" />
            <img src="./mobile.png" alt="Meetify preview" />
          </div>
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <Footer />
    </div>
  );
}

const Feature = ({ icon, text }) => (
  <div className="featureItem">
    {icon}
    <p>{text}</p>
  </div>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footerContainer">
        {/* Brand Section */}
        <div className="footerBrand">
          <h3>Meetify</h3>
          <p>Simple and secure video meetings from anywhere.</p>
        </div>

        {/* Contact Info */}
        <div className="footerContact">
          <h4>Contact</h4>
          <p>Name: Pankaj Dey</p>
          <p>
            Phone: <a href="tel:+917439480223">+91 7439480223</a>
          </p>
          <p>
            Email:{" "}
            <a href="mailto:pankajdey.dev@gmail.com">pankajdey.dev@gmail.com</a>
          </p>
        </div>

        {/* Extra Links */}
        <div className="footerLinks">
          <h4>Quick Links</h4>
          <p>About</p>
          <p>Privacy Policy</p>
          <p>Terms & Conditions</p>
        </div>
      </div>

      <div className="footerBottom">
        <p>© {new Date().getFullYear()} Meetify. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Landing;
