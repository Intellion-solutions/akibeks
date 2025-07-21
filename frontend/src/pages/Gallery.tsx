
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Gallery = () => {
  const [filter, setFilter] = useState("all");

  const projects = [
    {
      id: 1,
      title: "Modern Residential Complex",
      category: "residential",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500",
      description: "Luxury apartments in Westlands, Nairobi"
    },
    {
      id: 2,
      title: "Commercial Office Building",
      category: "commercial",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500",
      description: "10-story office complex in CBD"
    },
    {
      id: 3,
      title: "Road Construction Project",
      category: "infrastructure",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500",
      description: "Highway construction in Nakuru"
    },
    {
      id: 4,
      title: "Residential Villa",
      category: "residential",
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=500",
      description: "Custom villa design in Karen"
    },
    {
      id: 5,
      title: "Shopping Mall",
      category: "commercial",
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500",
      description: "Modern shopping center in Kilimani"
    },
    {
      id: 6,
      title: "Bridge Construction",
      category: "infrastructure",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
      description: "Bridge over Nairobi River"
    }
  ];

  const categories = [
    { value: "all", label: "All Projects" },
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "infrastructure", label: "Infrastructure" }
  ];

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(project => project.category === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Project Gallery</h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
              Explore our portfolio of completed construction and engineering projects across Kenya.
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={filter === category.value ? "default" : "outline"}
                  onClick={() => setFilter(category.value)}
                  className={filter === category.value ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    <Badge 
                      className="absolute top-4 left-4 bg-orange-600"
                    >
                      {project.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600">{project.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Gallery;
