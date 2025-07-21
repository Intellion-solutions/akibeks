
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Briefcase, Heart, Trophy, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const Career = () => {
  const jobOpenings = [
    {
      title: "Senior Civil Engineer",
      department: "Engineering",
      location: "Nairobi",
      type: "Full-time",
      level: "Senior",
      description: "Lead complex infrastructure projects and mentor junior engineers. Minimum 5 years experience required.",
      requirements: ["Bachelor's degree in Civil Engineering", "5+ years experience", "Project management skills", "Professional registration"]
    },
    {
      title: "Construction Supervisor",
      department: "Operations",
      location: "Nairobi",
      type: "Full-time",
      level: "Mid-level",
      description: "Oversee construction sites, ensure safety compliance, and coordinate with project teams.",
      requirements: ["Diploma in Construction", "3+ years experience", "Safety certification", "Leadership skills"]
    },
    {
      title: "Architect",
      department: "Design",
      location: "Nairobi",
      type: "Full-time",
      level: "Mid-level",
      description: "Design residential and commercial buildings, work with clients on architectural solutions.",
      requirements: ["Bachelor's in Architecture", "3+ years experience", "AutoCAD proficiency", "Creative thinking"]
    },
    {
      title: "Electrical Engineer",
      department: "Engineering",
      location: "Nairobi",
      type: "Full-time",
      level: "Junior",
      description: "Design and implement electrical systems for construction projects.",
      requirements: ["Bachelor's in Electrical Engineering", "1-3 years experience", "Circuit design skills", "Safety knowledge"]
    },
    {
      title: "Project Manager",
      department: "Management",
      location: "Nairobi",
      type: "Full-time",
      level: "Senior",
      description: "Manage multiple construction projects from initiation to completion.",
      requirements: ["Bachelor's degree", "PMP certification preferred", "5+ years experience", "Communication skills"]
    },
    {
      title: "Quantity Surveyor",
      department: "Finance",
      location: "Nairobi",
      type: "Full-time",
      level: "Mid-level",
      description: "Cost estimation, budget management, and financial analysis for construction projects.",
      requirements: ["Bachelor's in Quantity Surveying", "3+ years experience", "Cost analysis skills", "Attention to detail"]
    }
  ];

  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      title: "Competitive Salary",
      description: "Market-leading compensation packages with performance bonuses"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Health Insurance",
      description: "Comprehensive medical, dental, and vision coverage for you and family"
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Professional Growth",
      description: "Training programs, certifications, and career advancement opportunities"
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-500" />,
      title: "Work-Life Balance",
      description: "Flexible working hours and generous vacation time"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Team Environment",
      description: "Collaborative culture with supportive colleagues and mentorship"
    },
    {
      icon: <Briefcase className="w-8 h-8 text-orange-500" />,
      title: "Modern Equipment",
      description: "Latest tools, software, and technology to do your best work"
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Senior":
        return "bg-red-100 text-red-800";
      case "Mid-level":
        return "bg-blue-100 text-blue-800";
      case "Junior":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-white rounded-full animate-ping"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">Join Our Team</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-fade-in">
              Build your career with Kenya's leading construction and engineering company
            </p>
          </div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Work at AKIBEKS?</h2>
            <p className="text-xl text-gray-600">We're building more than structures - we're building careers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2 text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4 animate-bounce" style={{ animationDelay: `${index * 200}ms` }}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Current Openings</h2>
            <p className="text-xl text-gray-600">Find your perfect role in our growing team</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {jobOpenings.map((job, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <Badge className={getLevelColor(job.level)}>
                      {job.level}
                    </Badge>
                  </div>
                  <CardDescription>{job.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {job.department}
                    </Badge>
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {job.type}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {job.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link to="/contact">
                      Apply Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Application Process</h2>
            <p className="text-xl text-gray-600">Simple steps to join our team</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Apply", description: "Submit your application through our contact form" },
              { step: "2", title: "Review", description: "Our HR team reviews your application and qualifications" },
              { step: "3", title: "Interview", description: "Phone/video interview followed by in-person meeting" },
              { step: "4", title: "Join Us", description: "Welcome to the AKIBEKS family!" }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold animate-pulse" style={{ animationDelay: `${index * 500}ms` }}>
                  {process.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{process.title}</h3>
                <p className="text-gray-600">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Future?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Don't see the perfect role? Send us your CV and we'll keep you in mind for future opportunities.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/contact">
              Send Your CV
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Career;
