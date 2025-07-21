import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Target, 
  Award, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Heart,
  Shield,
  Lightbulb,
  Handshake
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Company = () => {
  const leadership = [
    {
      name: 'Sarah Johnson',
      role: 'Chief Executive Officer',
      bio: 'Sarah has over 15 years of experience in project management and business operations. She founded the company with a vision to revolutionize how businesses manage their projects.',
      image: '/api/placeholder/300/300',
      linkedin: '#',
      email: 'sarah.johnson@company.com'
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      bio: 'Michael is a technology visionary with expertise in scalable software architecture and AI-driven automation. He leads our technical innovation.',
      image: '/api/placeholder/300/300',
      linkedin: '#',
      email: 'michael.chen@company.com'
    },
    {
      name: 'Emily Davis',
      role: 'Chief Operating Officer',
      bio: 'Emily oversees all operational aspects of the business, ensuring our clients receive exceptional service and support at every touchpoint.',
      image: '/api/placeholder/300/300',
      linkedin: '#',
      email: 'emily.davis@company.com'
    },
    {
      name: 'David Rodriguez',
      role: 'Chief Financial Officer',
      bio: 'David brings deep financial expertise and strategic planning experience, helping guide our growth and investment decisions.',
      image: '/api/placeholder/300/300',
      linkedin: '#',
      email: 'david.rodriguez@company.com'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the center of everything we do, ensuring their success is our success.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We maintain the highest standards of security and data protection for our clients\' sensitive information.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously innovate and improve our platform to stay ahead of industry trends and client needs.'
    },
    {
      icon: Handshake,
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and collaboration, both internally and with our clients.'
    }
  ];

  const milestones = [
    {
      year: '2018',
      title: 'Company Founded',
      description: 'Started with a simple vision to make project management more efficient and accessible.'
    },
    {
      year: '2019',
      title: 'First 100 Customers',
      description: 'Reached our first major milestone with 100 satisfied customers across various industries.'
    },
    {
      year: '2020',
      title: 'Series A Funding',
      description: 'Secured $5M in Series A funding to accelerate product development and team expansion.'
    },
    {
      year: '2021',
      title: 'AI-Powered Features',
      description: 'Launched our first AI-powered automation features, revolutionizing workflow management.'
    },
    {
      year: '2022',
      title: 'Global Expansion',
      description: 'Expanded to serve customers in over 50 countries with localized support.'
    },
    {
      year: '2023',
      title: '10,000+ Projects',
      description: 'Successfully managed over 10,000 projects for clients worldwide.'
    },
    {
      year: '2024',
      title: 'Industry Recognition',
      description: 'Received multiple industry awards for innovation and customer satisfaction.'
    }
  ];

  const stats = [
    { label: 'Years in Business', value: '6+' },
    { label: 'Satisfied Clients', value: '2,500+' },
    { label: 'Projects Completed', value: '15,000+' },
    { label: 'Team Members', value: '150+' }
  ];

  return (
    <>
      <Helmet>
        <title>About Our Company - Project Management Solutions</title>
        <meta name="description" content="Learn about our company, leadership team, values, and mission to revolutionize project management for businesses worldwide." />
        <meta name="keywords" content="about us, company, leadership, team, project management, business solutions" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                About Our Company
              </h1>
              <p className="text-xl mb-8 opacity-90">
                We're passionate about helping businesses succeed through innovative project management solutions. 
                Our mission is to make project management simple, efficient, and accessible to organizations of all sizes.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" variant="secondary">
                  <Users className="h-5 w-5 mr-2" />
                  Meet Our Team
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                  <Building2 className="h-5 w-5 mr-2" />
                  Our Story
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Mission & Vision</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  We believe that great project management should be simple, powerful, and accessible to everyone.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6 text-blue-600" />
                      Our Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      To empower businesses with intelligent project management tools that streamline workflows, 
                      enhance collaboration, and drive successful project outcomes. We strive to eliminate the 
                      complexity and overhead traditionally associated with project management.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-6 w-6 text-blue-600" />
                      Our Vision
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      To be the world's leading project management platform, recognized for innovation, 
                      reliability, and exceptional customer success. We envision a future where every team 
                      can achieve their goals efficiently and effectively.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                <p className="text-gray-600">
                  These values guide everything we do and shape how we serve our customers.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                        <value.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                      <p className="text-gray-600 text-sm">{value.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
                <p className="text-gray-600">
                  From a small startup to a leading project management solution - here's our story.
                </p>
              </div>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {milestone.year.slice(-2)}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{milestone.title}</h3>
                        <Badge variant="outline">{milestone.year}</Badge>
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leadership Team Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
                <p className="text-gray-600">
                  Meet the experienced leaders driving our vision and strategy.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {leadership.map((leader, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                        <img 
                          src={leader.image} 
                          alt={leader.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{leader.name}</h3>
                      <p className="text-blue-600 font-medium mb-3">{leader.role}</p>
                      <p className="text-gray-600 text-sm mb-4">{leader.bio}</p>
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Linkedin className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                <p className="text-gray-600">
                  Have questions about our company or want to learn more? We'd love to hear from you.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Headquarters</h3>
                    <p className="text-gray-600 text-sm">
                      123 Business District<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Phone className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Phone & Email</h3>
                    <p className="text-gray-600 text-sm">
                      +1 (555) 123-4567<br />
                      info@company.com<br />
                      support@company.com
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Globe className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Follow Us</h3>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Github className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Awards & Recognition</h2>
                <p className="text-gray-600">
                  We're honored to be recognized by industry leaders and our peers.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { title: 'Best Project Management Software', year: '2024', org: 'TechCrunch' },
                  { title: 'Innovation Award', year: '2023', org: 'PM Institute' },
                  { title: 'Customer Choice Award', year: '2023', org: 'Software Reviews' },
                  { title: 'Rising Star Company', year: '2022', org: 'Business Weekly' }
                ].map((award, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <Award className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-1">{award.title}</h3>
                      <p className="text-blue-600 text-sm">{award.org}</p>
                      <p className="text-gray-500 text-xs">{award.year}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Company;