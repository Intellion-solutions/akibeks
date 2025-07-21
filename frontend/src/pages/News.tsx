
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const News = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const newsArticles = [
    {
      id: 1,
      title: "AKIBEKS Wins National Construction Excellence Award 2024",
      excerpt: "Our commitment to quality and innovation has been recognized with the prestigious National Construction Excellence Award.",
      date: "December 15, 2024",
      author: "Editorial Team",
      category: "Awards",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop",
      readTime: "3 min read"
    },
    {
      id: 2,
      title: "Green Building Initiative: Our Sustainable Future",
      excerpt: "Learn about our new green building practices and how we're contributing to environmental sustainability in construction.",
      date: "December 10, 2024",
      author: "Sustainability Team",
      category: "Environment",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
      readTime: "5 min read"
    },
    {
      id: 3,
      title: "New Technology Integration in Construction Projects",
      excerpt: "Discover how we're incorporating cutting-edge technology to improve efficiency and quality in our construction projects.",
      date: "December 5, 2024",
      author: "Tech Team",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop",
      readTime: "4 min read"
    },
    {
      id: 4,
      title: "Community Outreach: Building Schools in Rural Kenya",
      excerpt: "Our latest community project focuses on building educational infrastructure in underserved rural communities.",
      date: "November 28, 2024",
      author: "Community Team",
      category: "Community",
      image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=400&fit=crop",
      readTime: "6 min read"
    },
    {
      id: 5,
      title: "Safety First: New Safety Protocols Implementation",
      excerpt: "We've implemented enhanced safety protocols across all our construction sites to ensure worker safety.",
      date: "November 20, 2024",
      author: "Safety Team",
      category: "Safety",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop",
      readTime: "4 min read"
    },
    {
      id: 6,
      title: "Partnership with Leading Material Suppliers",
      excerpt: "New strategic partnerships ensure access to high-quality materials and competitive pricing for our clients.",
      date: "November 15, 2024",
      author: "Procurement Team",
      category: "Business",
      image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=400&fit=crop",
      readTime: "3 min read"
    }
  ];

  const categories = ["All", "Awards", "Environment", "Technology", "Community", "Safety", "Business"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SEOHead 
        title="News & Updates - AKIBEKS Engineering Solutions"
        description="Stay updated with the latest news, achievements, and developments from AKIBEKS Engineering Solutions."
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            News & Updates
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Stay informed about our latest projects, achievements, and industry insights
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">{article.category}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {article.date}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {article.author}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{article.readTime}</span>
                    <Button variant="ghost" size="sm" className="group-hover:text-blue-600" asChild>
                      <Link to={`/news/${article.id}`}>
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
