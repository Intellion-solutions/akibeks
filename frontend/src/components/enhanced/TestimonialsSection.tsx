
import React from 'react';
import { Star, Quote } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'John Smith',
      role: 'Homeowner',
      content: 'Outstanding work on our kitchen renovation! The team was professional, timely, and the quality exceeded our expectations. Highly recommend Akibeks for any construction needs.',
      rating: 5,
      avatar: 'JS'
    },
    {
      name: 'Sarah Johnson',
      role: 'Facilities Manager, TechCorp Industries',
      content: 'Akibeks handled our office electrical upgrade with exceptional professionalism. The project was completed on time and within budget. Great communication throughout the process.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Brown',
      role: 'General Contractor',
      content: 'I have worked with Akibeks on multiple commercial projects. Their plumbing work is top-notch and their team is reliable. They are my go-to subcontractor for plumbing installations.',
      rating: 5,
      avatar: 'MB'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
            Client Reviews
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What Our Clients Say
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what our satisfied clients have to say about our work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <GradientCard 
              key={index} 
              gradient={index % 2 === 0 ? 'blue' : 'purple'}
              className="hover:scale-105 transition-transform duration-300"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue-200" />
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </GradientCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
