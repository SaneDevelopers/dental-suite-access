import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-primary">
              Bright Smile
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button 
                onClick={() => scrollToSection('hero')}
                className="hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('doctors')}
                className="hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Doctors
              </button>
              <button 
                onClick={() => scrollToSection('events')}
                className="hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Events
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Contact
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => scrollToSection('contact')}>
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </Button>
            <Button onClick={() => navigate('/auth')}>
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
            <button 
              onClick={() => scrollToSection('hero')}
              className="block hover:bg-accent hover:text-accent-foreground px-3 py-2 text-base font-medium w-full text-left"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="block hover:bg-accent hover:text-accent-foreground px-3 py-2 text-base font-medium w-full text-left"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('doctors')}
              className="block hover:bg-accent hover:text-accent-foreground px-3 py-2 text-base font-medium w-full text-left"
            >
              Doctors
            </button>
            <button 
              onClick={() => scrollToSection('events')}
              className="block hover:bg-accent hover:text-accent-foreground px-3 py-2 text-base font-medium w-full text-left"
            >
              Events
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="block hover:bg-accent hover:text-accent-foreground px-3 py-2 text-base font-medium w-full text-left"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="block hover:bg-accent hover:text-accent-foreground px-3 py-2 text-base font-medium w-full text-left"
            >
              Contact
            </button>
            <div className="px-3 py-2 space-y-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => scrollToSection('contact')}>
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
              <Button className="w-full" onClick={() => navigate('/auth')}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};