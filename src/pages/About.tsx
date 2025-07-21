
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Award, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  ArrowRight,
  Target,
  Eye,
  Heart,
  Shield,
  Star,
  Trophy,
  Building2,
  Hammer,
  Wrench,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  Zap,
  Clock
} from "lucide-react";
import { Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOWrapper from "@/components/SEOWrapper";
import { formatDisplayAmount } from "@/lib/currency-utils";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    projectsCompleted: 0,
    clientsSatisfied: 0,
    yearsExperience: 0,
    teamMembers: 0,
    certifications: 0,
    revenueGenerated: 0
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Animate statistics
    const animateStats = () => {
      const targetStats = {
        projectsCompleted: 200,
        clientsSatisfied: 150,
        yearsExperience: 15,
        teamMembers: 45,
        certifications: 8,
        revenueGenerated: 2500000000 // 2.5B KES
      };
      
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setStats({
          projectsCompleted: Math.floor(targetStats.projectsCompleted * progress),
          clientsSatisfied: Math.floor(targetStats.clientsSatisfied * progress),
          yearsExperience: Math.floor(targetStats.yearsExperience * progress),
          teamMembers: Math.floor(targetStats.teamMembers * progress),
          certifications: Math.floor(targetStats.certifications * progress),
          revenueGenerated: Math.floor(targetStats.revenueGenerated * progress)
        });
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, stepTime);
    };
    
    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  const teamMembers = [
    {
      name: "Samuel Kipkirui",
      position: "Managing Director & Chief Engineer",
      experience: "15+ years",
      specialization: "Civil Engineering & Project Management",
      education: "MSc Civil Engineering, University of Nairobi",
      achievements: ["NCA Class 1 Registered", "PMI Certified", "ICEA Certified"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Grace Wanjiku",
      position: "Head of Architecture",
      experience: "12+ years",
      specialization: "Architectural Design & Planning",
      education: "Bachelor Architecture, Jomo Kenyatta University",
      achievements: ["BORAQS Registered", "Green Building Certified", "Design Awards Winner"],
      image: "https://images.unsplash.com/photo-1494790108755-2616b6fc9b2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "David Mwangi",
      position: "Construction Manager",
      experience: "10+ years",
      specialization: "Construction Management & Quality Control",
      education: "BSc Construction Management, Technical University",
      achievements: ["NCA Class 2 Registered", "OSHA Certified", "Lean Construction Expert"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Mary Njeri",
      position: "Project Coordinator",
      experience: "8+ years",
      specialization: "Project Planning & Client Relations",
      education: "MSc Project Management, University of Nairobi",
      achievements: ["PMP Certified", "Client Excellence Award", "Women in Construction Leader"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  const milestones = [
    {
      year: "2009",
      title: "Company Founded",
      description: "AKIBEKS Engineering Solutions established in Nairobi with a vision to transform Kenya's construction landscape."
    },
    {
      year: "2012",
      title: "NCA Registration",
      description: "Achieved National Construction Authority registration, enabling us to undertake major government and private projects."
    },
    {
      year: "2015",
      title: "50 Projects Milestone",
      description: "Successfully completed our 50th project, establishing our reputation for quality and reliability."
    },
    {
      year: "2018",
      title: "ISO Certification",
      description: "Obtained ISO 9001:2015 certification, demonstrating our commitment to quality management systems."
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description: "Implemented advanced project management systems and digital construction technologies."
    },
    {
      year: "2022",
      title: "Regional Expansion",
      description: "Expanded operations to Mombasa and Kisumu, serving clients across major Kenyan cities."
    },
    {
      year: "2024",
      title: "200+ Projects",
      description: "Reached the milestone of 200+ completed projects with over 150 satisfied clients across Kenya."
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Integrity",
      description: "We conduct business with honesty, transparency, and ethical practices in all our dealings.",
      color: "blue"
    },
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for the highest standards of quality in every project we undertake.",
      color: "green"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We believe in teamwork, both within our organization and with our clients and partners.",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We embrace new technologies and methodologies to deliver cutting-edge solutions.",
      color: "orange"
    },
    {
      icon: Heart,
      title: "Client Focus",
      description: "Our clients' success is our success. We prioritize their needs and satisfaction above all.",
      color: "red"
    },
    {
      icon: TrendingUp,
      title: "Continuous Growth",
      description: "We are committed to continuous learning and improvement in all aspects of our business.",
      color: "indigo"
    }
  ];

  return (
    <SEOWrapper
      config={{
        title: "About AKIBEKS Engineering Solutions - Leading Construction Company in Kenya",
        description: "Learn about AKIBEKS Engineering Solutions, Kenya's premier construction and engineering company. Over 15 years of experience, 200+ projects completed, NCA registered and ISO certified.",
        keywords: [
          "about AKIBEKS",
          "construction company Kenya",
          "engineering company Kenya",
          "NCA registered construction",
          "ISO certified construction",
          "construction company history",
          "Kenya construction experts",
          "building company Kenya"
        ],
        type: "website"
      }}
    >
      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
              alt="AKIBEKS team at construction site"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/60"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-6 text-blue-200 border-blue-300">
                  About Us
                </Badge>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Building Kenya's Future for Over 
                  <span className="block text-yellow-400">15 Years</span>
                </h1>
                
                <p className="text-xl text-blue-100 mb-8">
                  AKIBEKS Engineering Solutions is Kenya's premier construction and engineering company, 
                  dedicated to delivering exceptional infrastructure projects that transform communities 
                  and drive economic growth across the nation.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
                    <Link to="/portfolio">
                      View Our Work
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-900">
                    <Link to="/contact">
                      Get In Touch
                      <Phone className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Building2, label: "Projects", value: "200+", description: "Completed Successfully" },
                  { icon: Users, label: "Clients", value: "150+", description: "Satisfied Customers" },
                  { icon: Award, label: "Experience", value: "15+", description: "Years in Business" },
                  { icon: Trophy, label: "Certifications", value: "8+", description: "Professional Awards" }
                ].map((stat, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
                    <CardContent className="p-6">
                      <stat.icon className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                      <div className="text-blue-300 text-xs mt-1">{stat.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Our Foundation
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Mission, Vision & Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our core principles guide every decision we make and every project we undertake.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {/* Mission */}
              <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To deliver world-class construction and engineering solutions that exceed client expectations, 
                    contribute to Kenya's infrastructure development, and create lasting value for all stakeholders 
                    through innovation, quality, and integrity.
                  </p>
                </CardContent>
              </Card>

              {/* Vision */}
              <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <Eye className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To be East Africa's most trusted and innovative construction and engineering company, 
                    recognized for excellence in project delivery, sustainable practices, and positive 
                    community impact by 2030.
                  </p>
                </CardContent>
              </Card>

              {/* Core Values Preview */}
              <Card className="text-center hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Integrity, Excellence, Collaboration, Innovation, Client Focus, and Continuous Growth 
                    form the foundation of our corporate culture and guide our daily operations.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-full bg-${value.color}-100 flex items-center justify-center mb-4`}>
                      <value.icon className={`w-6 h-6 text-${value.color}-600`} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Company Statistics */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Our Impact
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Numbers That Tell Our Story
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Over 15 years of dedicated service, we've built a legacy of excellence 
                that speaks through our achievements and satisfied clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Building2,
                  value: stats.projectsCompleted,
                  suffix: "+",
                  label: "Projects Completed",
                  description: "Across residential, commercial, and civil engineering sectors",
                  color: "blue"
                },
                {
                  icon: Users,
                  value: stats.clientsSatisfied,
                  suffix: "+",
                  label: "Satisfied Clients",
                  description: "From individual homeowners to large corporations",
                  color: "green"
                },
                {
                  icon: Calendar,
                  value: stats.yearsExperience,
                  suffix: "+",
                  label: "Years of Experience",
                  description: "Building trust and expertise in the Kenyan market",
                  color: "purple"
                },
                {
                  icon: Award,
                  value: stats.teamMembers,
                  suffix: "+",
                  label: "Team Members",
                  description: "Skilled professionals dedicated to excellence",
                  color: "orange"
                },
                {
                  icon: Trophy,
                  value: stats.certifications,
                  suffix: "",
                  label: "Certifications",
                  description: "Industry recognition and professional qualifications",
                  color: "red"
                },
                {
                  icon: TrendingUp,
                  value: formatDisplayAmount(stats.revenueGenerated),
                  suffix: "",
                  label: "Revenue Generated",
                  description: "Contributing to Kenya's economic growth",
                  color: "indigo"
                }
              ].map((stat, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-full bg-${stat.color}-100 flex items-center justify-center mx-auto mb-6`}>
                      <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}{stat.suffix}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</h3>
                    <p className="text-gray-600 text-sm">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Company Timeline */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Our Journey
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                15 Years of Growth & Innovation
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From our humble beginnings to becoming one of Kenya's leading construction companies, 
                explore the key milestones that have shaped our journey.
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 hidden lg:block"></div>
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    {/* Content */}
                    <div className="flex-1 lg:text-right" style={{ textAlign: index % 2 === 0 ? 'right' : 'left' }}>
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <Badge className="mb-3 bg-blue-600">{milestone.year}</Badge>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                          <p className="text-gray-600">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Timeline Node */}
                    <div className="hidden lg:block w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                    
                    {/* Empty space for alternating layout */}
                    <div className="flex-1 hidden lg:block"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Leadership Team
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Meet Our Expert Leaders
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our experienced leadership team brings together decades of expertise in construction, 
                engineering, and project management to guide AKIBEKS to new heights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className="relative mb-6">
                      <img 
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-100"
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {member.experience}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                    <p className="text-sm text-gray-600 mb-4">{member.specialization}</p>
                    
                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500 mb-3">{member.education}</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {member.achievements.map((achievement, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications & Awards */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Recognition & Certifications
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Industry Recognition & Standards
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our commitment to excellence is recognized through various industry certifications, 
                awards, and professional memberships.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "NCA Registration",
                  description: "National Construction Authority Class 1 Registration",
                  icon: Shield,
                  color: "blue"
                },
                {
                  title: "ISO 9001:2015",
                  description: "Quality Management System Certification",
                  icon: Award,
                  color: "green"
                },
                {
                  title: "OSHA Compliance",
                  description: "Occupational Safety and Health Administration Certified",
                  icon: CheckCircle,
                  color: "orange"
                },
                {
                  title: "PMI Membership",
                  description: "Project Management Institute Professional Standards",
                  icon: Trophy,
                  color: "purple"
                }
              ].map((cert, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-full bg-${cert.color}-100 flex items-center justify-center mx-auto mb-6`}>
                      <cert.icon className={`w-8 h-8 text-${cert.color}-600`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{cert.title}</h3>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join over 150 satisfied clients who have trusted AKIBEKS Engineering Solutions 
              to bring their construction dreams to life. Let's build something amazing together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8">
                <Link to="/request-quote">
                  Start Your Project
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8">
                <Link to="/portfolio">
                  View Our Work
                  <Building2 className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-5 h-5 text-blue-300" />
                <div className="text-left">
                  <div className="text-blue-100 text-sm">Call Us</div>
                  <div className="text-white font-medium">+254 710 245 118</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-blue-300" />
                <div className="text-left">
                  <div className="text-blue-100 text-sm">Email Us</div>
                  <div className="text-white font-medium">info@akibeks.co.ke</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-300" />
                <div className="text-left">
                  <div className="text-blue-100 text-sm">Visit Us</div>
                  <div className="text-white font-medium">Westlands, Nairobi</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </SEOWrapper>
  );
};

export default About;
