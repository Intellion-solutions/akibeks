
import React from 'react';
import { FeatureCard } from '@/components/ui/feature-card';
import { 
  Building2, 
  Zap, 
  Wrench, 
  Users, 
  PenTool, 
  Shield,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: Building2,
      title: 'Construction',
      description: 'Complete building construction from foundation to finishing with highest quality standards.',
      iconColor: 'text-blue-600'
    },
    {
      icon: Zap,
      title: 'Electrical Systems',
      description: 'Professional electrical installation, repair, and maintenance for residential and commercial properties.',
      iconColor: 'text-yellow-600'
    },
    {
      icon: Wrench,
      title: 'Plumbing Services',
      description: 'Expert plumbing solutions including installation, repair, and emergency services.',
      iconColor: 'text-blue-500'
    },
    {
      icon: PenTool,
      title: 'Civil Engineering',
      description: 'Structural design, planning, and engineering services for complex construction projects.',
      iconColor: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Project Management',
      description: 'End-to-end project coordination ensuring timeline, budget, and quality compliance.',
      iconColor: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Rigorous quality control and safety protocols throughout every project phase.',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            Our Expertise
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Professional Services
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We offer comprehensive engineering and construction services designed to meet 
            your specific needs with precision and excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <FeatureCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              iconColor={service.iconColor}
              className="hover:border-blue-200"
            />
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            View All Services
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
