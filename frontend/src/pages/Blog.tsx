
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Calendar, User, Search, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Sustainable Construction Practices in Kenya: A Complete Guide",
      excerpt: "Explore the latest sustainable construction methods and their impact on Kenya's building industry. Learn about eco-friendly materials, energy efficiency, and green building certifications.",
      author: "John Mwangi",
      date: "2024-01-10",
      category: "Sustainability",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=300&fit=crop",
      readTime: "8 min read"
    },
    {
      id: 2,
      title: "The Future of Smart Buildings in East Africa",
      excerpt: "Discover how IoT technology and smart building systems are revolutionizing construction in East Africa. From automated systems to energy management solutions.",
      author: "Sarah Njeri",
      date: "2024-01-08",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop",
      readTime: "6 min read"
    },
    {
      id: 3,
      title: "Cost-Effective Building Materials for Residential Projects",
      excerpt: "A comprehensive analysis of building materials that offer the best value for money in residential construction projects across Kenya.",
      author: "Peter Kamau",
      date: "2024-01-05",
      category: "Materials",
      image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=500&h=300&fit=crop",
      readTime: "10 min read"
    },
    {
      id: 4,
      title: "Project Management Best Practices in Construction",
      excerpt: "Learn essential project management techniques that ensure successful completion of construction projects on time and within budget.",
      author: "Mary Wanjiku",
      date: "2024-01-03",
      category: "Management",
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500&h=300&fit=crop",
      readTime: "7 min read"
    },
    {
      id: 5,
      title: "Understanding Building Codes and Regulations in Kenya",
      excerpt: "Navigate the complex landscape of building codes, permits, and regulations in Kenya. Essential knowledge for property developers and contractors.",
      author: "David Ochieng",
      date: "2024-01-01",
      category: "Regulations",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=300&fit=crop",
      readTime: "12 min read"
    },
    {
      id: 6,
      title: "Innovative Construction Techniques Transforming Kenya",
      excerpt: "Explore cutting-edge construction methods and technologies that are changing the face of building in Kenya and across East Africa.",
      author: "Grace Mutua",
      date: "2023-12-28",
      category: "Innovation",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop",
      readTime: "9 min read"
    }
  ];

  const categories = ["All", "Sustainability", "Technology", "Materials", "Management", "Regulations", "Innovation"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SEOHead 
        title="AKIBEKS Blog - Construction Industry Insights & News"
        description="Stay updated with the latest construction industry news, insights, and expert advice from AKIBEKS Engineering Solutions."
      />
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-blue-600 to-sky-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AKIBEKS Blog
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Expert insights, industry trends, and construction knowledge from Kenya's leading engineering company
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10 h-12"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-100 transition-colors px-4 py-2"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white">{post.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {post.author}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                    <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors" asChild>
                      <Link to={`/blog/${post.id}`}>
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-sky-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-blue-100 mb-8">
            Subscribe to our newsletter for the latest construction insights and industry news
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="h-12 bg-white text-gray-900 border-0"
            />
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
