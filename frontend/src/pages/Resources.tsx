
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, FileText, Video, Calculator, Search, TrendingUp, Users, Award } from "lucide-react";

const Resources = () => {
  const resourceCategories = [
    {
      title: "Construction Guides",
      description: "Comprehensive guides for construction best practices",
      icon: BookOpen,
      count: 25,
      color: "text-blue-600"
    },
    {
      title: "Engineering Tools",
      description: "Calculators and tools for engineering calculations",
      icon: Calculator,
      count: 12,
      color: "text-green-600"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video tutorials and demonstrations",
      icon: Video,
      count: 18,
      color: "text-purple-600"
    },
    {
      title: "Technical Documents",
      description: "Standards, specifications, and technical papers",
      icon: FileText,
      count: 30,
      color: "text-orange-600"
    }
  ];

  const featuredResources = [
    {
      title: "Complete Guide to Concrete Mix Design",
      description: "Comprehensive guide covering all aspects of concrete mix design for different applications",
      category: "Construction Guide",
      downloads: 1250,
      rating: 4.8,
      type: "PDF"
    },
    {
      title: "Structural Load Calculator",
      description: "Advanced calculator for determining structural loads in building design",
      category: "Engineering Tool",
      downloads: 890,
      rating: 4.9,
      type: "Tool"
    },
    {
      title: "Foundation Design Tutorial Series",
      description: "Video series covering foundation design principles and practical applications",
      category: "Video Tutorial",
      downloads: 2100,
      rating: 4.7,
      type: "Video"
    },
    {
      title: "Kenya Building Code Standards",
      description: "Updated building codes and standards for construction in Kenya",
      category: "Technical Document",
      downloads: 1680,
      rating: 4.6,
      type: "PDF"
    },
    {
      title: "Steel Structure Design Guide",
      description: "Comprehensive guide for steel structure design and analysis",
      category: "Construction Guide",
      downloads: 950,
      rating: 4.8,
      type: "PDF"
    },
    {
      title: "Project Cost Estimator",
      description: "Tool for accurate project cost estimation and budgeting",
      category: "Engineering Tool",
      downloads: 1350,
      rating: 4.5,
      type: "Tool"
    }
  ];

  const stats = [
    { label: "Total Downloads", value: "50K+", icon: Download },
    { label: "Active Users", value: "5K+", icon: Users },
    { label: "Expert Reviews", value: "4.7/5", icon: Award },
    { label: "Monthly Growth", value: "+25%", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-orange-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Engineering <span className="text-orange-400">Resources</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 opacity-90">
              Access comprehensive guides, tools, and resources for construction and engineering excellence
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Search resources, guides, tools..." 
                className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
              <Button className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <IconComponent className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Resource Categories</h2>
            <p className="text-xl text-gray-600">Explore our comprehensive collection of engineering resources</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <IconComponent className={`w-12 h-12 mx-auto mb-4 ${category.color}`} />
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <Badge variant="outline">{category.count} Resources</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Resources</h2>
            <p className="text-xl text-gray-600">Most popular and highly-rated resources from our collection</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{resource.category}</Badge>
                    <Badge variant="secondary">{resource.type}</Badge>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {resource.downloads}
                      </span>
                      <span className="flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        {resource.rating}
                      </span>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resource
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">
            Get notified when we add new resources and tools to our collection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
            />
            <Button className="bg-orange-500 hover:bg-orange-600">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
