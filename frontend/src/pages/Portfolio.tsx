
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Users, Award, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const portfolioProjects = [
    {
      id: 1,
      title: "Westlands Residential Complex",
      category: "residential",
      client: "Skyline Properties",
      value: "KSh 450M",
      duration: "18 months",
      location: "Westlands, Nairobi",
      status: "Completed",
      year: "2023",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
      description: "Luxury 200-unit residential complex with modern amenities including swimming pool, gym, and children's play area.",
      features: ["200 residential units", "Swimming pool & gym", "Underground parking", "24/7 security"],
      awards: ["Best Residential Project 2023", "Green Building Certification"]
    },
    {
      id: 2,
      title: "CBD Office Tower",
      category: "commercial",
      client: "Corporate Ventures Ltd",
      value: "KSh 800M",
      duration: "24 months",
      location: "Nairobi CBD",
      status: "Completed",
      year: "2022",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
      description: "30-story commercial office building with state-of-the-art facilities and sustainable design features.",
      features: ["30 floors", "LEED certified", "Smart building systems", "Executive conference facilities"],
      awards: ["Commercial Excellence Award", "Sustainable Design Recognition"]
    },
    {
      id: 3,
      title: "Thika Superhighway Bridge",
      category: "infrastructure",
      client: "Kenya National Highways Authority",
      value: "KSh 1.2B",
      duration: "30 months",
      location: "Thika Road",
      status: "Completed",
      year: "2021",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      description: "Major bridge construction project enhancing connectivity and reducing traffic congestion.",
      features: ["800m span", "6-lane capacity", "Pedestrian walkways", "Earthquake resistant design"],
      awards: ["Infrastructure Project of the Year", "Engineering Excellence Award"]
    }
  ];

  const stats = [
    { icon: Award, label: "Projects Completed", value: "150+" },
    { icon: Users, label: "Happy Clients", value: "300+" },
    { icon: DollarSign, label: "Total Project Value", value: "KSh 15B+" },
    { icon: TrendingUp, label: "Years Experience", value: "12+" }
  ];

  const categories = [
    { value: "all", label: "All Projects" },
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "infrastructure", label: "Infrastructure" }
  ];

  const filteredProjects = selectedCategory === "all" 
    ? portfolioProjects 
    : portfolioProjects.filter(project => project.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Portfolio</h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
              Showcasing excellence in construction and engineering across Kenya with award-winning projects.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {filteredProjects.map((project, index) => (
                <div key={project.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-96 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{project.category}</Badge>
                          <Badge variant="outline">{project.status}</Badge>
                        </div>
                        <CardTitle className="text-2xl">{project.title}</CardTitle>
                        <CardDescription className="text-lg">{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center text-sm">
                            <Users className="w-4 h-4 mr-2 text-orange-600" />
                            <span className="font-medium">Client:</span>
                            <span className="ml-1">{project.client}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="w-4 h-4 mr-2 text-orange-600" />
                            <span className="font-medium">Value:</span>
                            <span className="ml-1">{project.value}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                            <span className="font-medium">Duration:</span>
                            <span className="ml-1">{project.duration}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                            <span className="font-medium">Location:</span>
                            <span className="ml-1">{project.location}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Key Features:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {project.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Awards & Recognition:</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.awards.map((award, idx) => (
                              <Badge key={idx} className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                                {award}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Portfolio;
