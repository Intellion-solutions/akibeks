
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Building, Home, Wrench, Hammer } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: "Modern Villa Construction",
    location: "Karen, Nairobi",
    image: "/placeholder.svg",
    description: "Luxury 5-bedroom villa with contemporary design",
    icon: Home,
    status: "Completed"
  },
  {
    id: 2,
    title: "Commercial Office Complex",
    location: "Westlands, Nairobi",
    image: "/placeholder.svg",
    description: "10-story office building with modern amenities",
    icon: Building,
    status: "In Progress"
  },
  {
    id: 3,
    title: "Industrial Warehouse",
    location: "Mombasa Road",
    image: "/placeholder.svg",
    description: "Large-scale warehouse facility for logistics",
    icon: Wrench,
    status: "Completed"
  },
  {
    id: 4,
    title: "Residential Apartments",
    location: "Kileleshwa, Nairobi",
    image: "/placeholder.svg",
    description: "30-unit apartment complex with parking",
    icon: Hammer,
    status: "Planning"
  }
];

const ProjectSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projects.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg">
      {projects.map((project, index) => (
        <Card
          key={project.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 'translate-x-full'
          } ${index < currentSlide ? '-translate-x-full' : ''}`}
        >
          <CardContent className="p-0 h-full">
            <div className="relative h-full bg-gradient-to-r from-blue-900 to-blue-800 flex items-center">
              <div className="absolute inset-0 bg-black opacity-40"></div>
              <div className="relative z-10 p-8 text-white max-w-2xl">
                <div className="flex items-center mb-4">
                  <project.icon className="w-8 h-8 mr-3 text-orange-400" />
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                    {project.status}
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-2">{project.title}</h3>
                <p className="text-lg opacity-90 mb-2">{project.location}</p>
                <p className="text-gray-200">{project.description}</p>
              </div>
              <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-gray-200 to-transparent flex items-center justify-center">
                <project.icon className="w-32 h-32 text-gray-400 opacity-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
        size="icon"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </Button>
      
      <Button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
        size="icon"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </Button>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-orange-500' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectSlideshow;
