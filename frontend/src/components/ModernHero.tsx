
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Award, Users, Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface ModernHeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  showTestimonialButton?: boolean;
}

const ModernHero = ({ 
  title = "Building Tomorrow's Infrastructure",
  subtitle = "From concept to completion, we deliver innovative engineering solutions that shape the future. Trust AKIBEKS for your next construction project.",
  ctaText = "Get Started",
  ctaLink = "/request-quote",
  showTestimonialButton = true
}: ModernHeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-sky-300/40 rounded-lg animate-bounce opacity-50" style={{ animationDelay: '2s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-cyan-200/30 rounded-full animate-bounce opacity-70" style={{ animationDelay: '4s', animationDuration: '10s' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/40 rounded-lg animate-bounce opacity-50" style={{ animationDelay: '1s', animationDuration: '7s' }}></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] animate-pulse opacity-30"></div>
        
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-sky-500/5 to-transparent animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100/80 backdrop-blur-sm border border-blue-200/50 rounded-full text-blue-700 text-sm font-medium mb-8 animate-fade-in shadow-lg">
              <Award className="w-4 h-4 mr-2" />
              Award-Winning Engineering Solutions
              <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {title.includes('Infrastructure') ? (
                <>
                  <span className="block animate-fade-in">Building Tomorrow's</span>
                  <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent block animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    Infrastructure
                  </span>
                </>
              ) : (
                <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 bg-clip-text text-transparent animate-fade-in">
                  {title}
                </span>
              )}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl animate-fade-in leading-relaxed" style={{ animationDelay: '0.4s' }}>
              {subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <Link to={ctaLink} className="flex items-center">
                  {ctaText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              {showTestimonialButton && (
                <Button variant="outline" size="lg" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm hover:border-blue-400 transition-all duration-300">
                  <Link to="/submit-testimonial" className="flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Share Review
                  </Link>
                </Button>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600 text-sm">Projects Completed</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-sky-600 mb-2">15+</div>
                <div className="text-gray-600 text-sm">Years Experience</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-cyan-600 mb-2">50+</div>
                <div className="text-gray-600 text-sm">Expert Engineers</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Animated Cards */}
          <div className="relative animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="grid grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-blue-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Expert Team</h3>
                <p className="text-gray-600 text-sm">Professional engineers with decades of experience</p>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-sky-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 mt-8 shadow-lg hover:shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Quality Assured</h3>
                <p className="text-gray-600 text-sm">ISO certified processes and premium materials</p>
              </div>
              
              {/* Card 3 */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-cyan-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 -mt-4 shadow-lg hover:shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">On-Time Delivery</h3>
                <p className="text-gray-600 text-sm">95% of projects delivered ahead of schedule</p>
              </div>
              
              {/* Card 4 */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-blue-100 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-sky-500 rounded-lg flex items-center justify-center mb-4">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">Round-the-clock project monitoring and support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-blue-400 rounded-full flex justify-center bg-white/20 backdrop-blur-sm">
          <div className="w-1 h-3 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default ModernHero;
