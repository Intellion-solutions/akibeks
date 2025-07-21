
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Wrench, 
  Hammer, 
  Home, 
  Factory, 
  Truck, 
  TreePine, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const services = [
  {
    id: 1,
    title: "Residential Construction",
    description: "Custom homes, villas, and apartment complexes with modern designs and quality finishes",
    icon: Home,
    color: "from-blue-500 to-blue-600",
    features: ["Custom Architecture", "Quality Materials", "Timely Completion", "Warranty Support"],
    projects: "200+",
    price: "From KSh 35,000/sqm"
  },
  {
    id: 2,
    title: "Commercial Buildings",
    description: "Office complexes, retail spaces, warehouses, and mixed-use developments",
    icon: Building,
    color: "from-green-500 to-green-600",
    features: ["Code Compliance", "Modern Amenities", "Energy Efficient", "Professional Standards"],
    projects: "150+",
    price: "From KSh 45,000/sqm"
  },
  {
    id: 3,
    title: "Civil Engineering",
    description: "Infrastructure development, roads, bridges, and water management systems",
    icon: Wrench,
    color: "from-purple-500 to-purple-600",
    features: ["Site Planning", "Structural Design", "Environmental Compliance", "Project Management"],
    projects: "100+",
    price: "Custom Pricing"
  },
  {
    id: 4,
    title: "Industrial Projects",
    description: "Manufacturing facilities, processing plants, and industrial infrastructure",
    icon: Factory,
    color: "from-orange-500 to-orange-600",
    features: ["Heavy Construction", "Specialized Equipment", "Safety Standards", "Maintenance Plans"],
    projects: "50+",
    price: "From KSh 60,000/sqm"
  },
  {
    id: 5,
    title: "Renovation & Remodeling",
    description: "Transform existing spaces with modern upgrades and space optimization",
    icon: Hammer,
    color: "from-red-500 to-red-600",
    features: ["Space Optimization", "Modern Upgrades", "Minimal Disruption", "Cost Effective"],
    projects: "300+",
    price: "From KSh 15,000/sqm"
  }
];

const ServicesCarousel = () => {
  const [activeService, setActiveService] = useState(0);

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {services.map((service, index) => (
          <Button
            key={service.id}
            onClick={() => setActiveService(index)}
            variant={activeService === index ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              activeService === index ? "bg-orange-500 hover:bg-orange-600" : ""
            }`}
          >
            <service.icon className="w-4 h-4" />
            {service.title}
          </Button>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeService * 100}%)` }}
        >
          {services.map((service, index) => (
            <div key={service.id} className="w-full flex-shrink-0">
              <Card className="mx-auto max-w-4xl hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                    <service.icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-lg">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-800">Key Features:</h4>
                      <div className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Completed Projects:</span>
                        <Badge variant="secondary">{service.projects}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Starting Price:</span>
                        <span className="font-bold text-orange-600">{service.price}</span>
                      </div>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        Get Quote <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesCarousel;
