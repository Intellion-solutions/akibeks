
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(156,146,172)_2px,transparent_2px)] bg-[length:30px_30px]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Trusted by 500+ Clients
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Building Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
                  Dreams
                </span>
                Into Reality
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Professional engineering and construction services with over 15 years of excellence. 
                From concept to completion, we bring your vision to life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-blue-600 px-8 py-4 rounded-xl transition-all duration-300">
                <Play className="w-5 h-5 mr-2" />
                Watch Our Work
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  <AnimatedCounter value={500} suffix="+" />
                </div>
                <div className="text-sm text-gray-600 mt-1">Projects Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  <AnimatedCounter value={15} suffix="+" />
                </div>
                <div className="text-sm text-gray-600 mt-1">Years Experience</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  <AnimatedCounter value={98} suffix="%" />
                </div>
                <div className="text-sm text-gray-600 mt-1">Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Visual */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src="/public/lovable-uploads/36449ecf-a66d-4784-8ffb-6eb18390ec8f.png" 
                alt="Construction Excellence" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Floating cards */}
            <div className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Project Active</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-xs text-gray-500">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
