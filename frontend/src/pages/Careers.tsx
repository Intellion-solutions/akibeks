
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Careers = () => {
  const jobOpenings = [
    {
      id: 1,
      title: "Senior Civil Engineer",
      department: "Engineering",
      location: "Nairobi, Kenya",
      type: "Full-time",
      experience: "5+ years",
      description: "Lead major construction projects and manage engineering teams.",
      requirements: ["Bachelor's degree in Civil Engineering", "Professional Engineer license", "Project management experience"],
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Project Manager",
      department: "Project Management",
      location: "Mombasa, Kenya",
      type: "Full-time",
      experience: "3+ years",
      description: "Oversee construction projects from planning to completion.",
      requirements: ["PMP certification preferred", "Construction industry experience", "Strong leadership skills"],
      posted: "1 week ago"
    },
    {
      id: 3,
      title: "Quantity Surveyor",
      department: "Finance",
      location: "Nairobi, Kenya",
      type: "Full-time",
      experience: "2+ years",
      description: "Manage project costs and ensure budget compliance.",
      requirements: ["Degree in Quantity Surveying", "Cost estimation experience", "Knowledge of construction contracts"],
      posted: "3 days ago"
    },
    {
      id: 4,
      title: "Site Supervisor",
      department: "Operations",
      location: "Kisumu, Kenya",
      type: "Full-time",
      experience: "4+ years",
      description: "Supervise daily construction activities and ensure quality standards.",
      requirements: ["Construction supervision experience", "Safety certification", "Team management skills"],
      posted: "5 days ago"
    }
  ];

  const benefits = [
    "Competitive salary and performance bonuses",
    "Comprehensive health insurance",
    "Professional development opportunities",
    "Flexible working arrangements",
    "Retirement savings plan",
    "Annual leave and sick days",
    "Training and certification support",
    "Career advancement paths"
  ];

  const values = [
    {
      title: "Excellence",
      description: "We strive for excellence in everything we do",
      icon: "🎯"
    },
    {
      title: "Innovation",
      description: "We embrace new technologies and methodologies",
      icon: "💡"
    },
    {
      title: "Integrity",
      description: "We conduct business with honesty and transparency",
      icon: "🤝"
    },
    {
      title: "Teamwork",
      description: "We believe in collaborative success",
      icon: "👥"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SEOHead 
        title="Careers - Join AKIBEKS Engineering Solutions"
        description="Join our team of professionals and build your career with AKIBEKS Engineering Solutions. Explore exciting opportunities in construction and engineering."
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-green-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build Your Career With Us
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
            Join a team of passionate professionals dedicated to shaping Kenya's infrastructure and building a better future
          </p>
          <Button size="lg" className="bg-white text-green-900 hover:bg-gray-100">
            View Open Positions
          </Button>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">What drives us every day</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Current Openings</h2>
            <p className="text-xl text-gray-600">Find your next opportunity with us</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {jobOpenings.map((job) => (
              <Card key={job.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <Badge variant="outline">{job.posted}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {job.department}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {job.experience}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full" asChild>
                    <Link to={`/careers/apply/${job.id}`}>
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Work With Us?</h2>
              <p className="text-lg text-gray-600 mb-8">
                We believe in investing in our people. When you join AKIBEKS, you're not just getting a job – you're joining a family that cares about your growth and success.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                alt="Team collaboration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our Team?</h2>
          <p className="text-xl mb-8 opacity-90">
            Don't see a position that fits? We're always looking for talented individuals to join our growing team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/contact">Contact HR Team</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link to="/careers/internships">Internship Programs</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
