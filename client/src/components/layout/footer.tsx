import { Link } from 'wouter';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-gray circuit-lines border-t border-gray-800">
      <div className="max-w-7xl mx-auto pt-16 pb-8 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/">
              <a className="mb-6 block">
                <span className="font-syncopate text-2xl font-bold text-white">
                  <span className="text-electric-blue">LUX</span>
                </span>
              </a>
            </Link>
            <p className="text-muted-gray text-sm mb-6 leading-relaxed">
              Elevate your space with our collection of handcrafted luxury chandeliers that blend artistry, innovation, and sophistication.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-gray hover:text-electric-blue transition-colors">
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-muted-gray hover:text-electric-blue transition-colors">
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-gray hover:text-electric-blue transition-colors">
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-muted-gray hover:text-electric-blue transition-colors">
                <Linkedin size={18} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-muted-gray hover:text-electric-blue transition-colors">
                <Youtube size={18} />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-space font-medium text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products?featured=true">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    Featured Collection
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/ar-experience">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    AR Experience
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=Modern">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    Modern Chandeliers
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=Crystal">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    Crystal Chandeliers
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=Smart%20Lighting">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    Smart Lighting
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-space font-medium text-white mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    FAQ
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/shipping">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    Shipping & Delivery
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/returns">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    Returns & Exchanges
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/warranty">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    Warranty Information
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                    Contact Us
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-space font-medium text-white mb-4">Contact Information</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="text-electric-blue mr-3 mt-0.5" />
                <span className="text-sm text-muted-gray">
                  1234 Luxury Lane, Suite 500<br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-electric-blue mr-3" />
                <a href="tel:+12125551234" className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                  +1 (212) 555-1234
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-electric-blue mr-3" />
                <a href="mailto:info@lux.com" className="text-sm text-muted-gray hover:text-electric-blue transition-colors">
                  info@lux.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between">
          <p className="text-xs text-muted-gray">
            &copy; {new Date().getFullYear()} LUX Chandeliers. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/privacy">
              <a className="text-xs text-muted-gray hover:text-electric-blue transition-colors">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-xs text-muted-gray hover:text-electric-blue transition-colors">
                Terms of Service
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;