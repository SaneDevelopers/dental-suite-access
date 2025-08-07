import { MapPin, Phone, Mail, Clock, Heart } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Clinic Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-primary">
              Bright Smile
            </div>
            <p className="text-muted-foreground">
              Your trusted dental care partner, committed to providing exceptional oral health services with a gentle touch.
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              <span>Caring for smiles since 2009</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Our Services
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Meet Our Doctors
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Events & Camps
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Patient Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>General Dentistry</li>
              <li>Teeth Cleaning</li>
              <li>Teeth Whitening</li>
              <li>Root Canal Treatment</li>
              <li>Dental Fillings</li>
              <li>Orthodontics</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  123 Health Street, Medical District, City 12345
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm text-muted-foreground">info@brightsmile.com</span>
              </div>
              <div className="flex items-start">
                <Clock className="h-4 w-4 mr-2 text-primary mt-1 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <div>Mon-Fri: 8:00 AM - 6:00 PM</div>
                  <div>Sat: 9:00 AM - 3:00 PM</div>
                  <div>Sun: Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Bright Smile Dental Clinic. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                HIPAA Notice
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};