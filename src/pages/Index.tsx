
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Building, 
  TrendingUp, 
  Clock, 
  Shield, 
  Zap, 
  Target, 
  Award, 
  Layers, 
  Smartphone, 
  Cloud, 
  Database, 
  Code, 
  Palette, 
  Monitor,
  FileText,
  Calculator,
  BarChart3,
  Calendar,
  MessageSquare,
  Settings,
  Lock,
  Globe,
  Rocket,
  Heart,
  ChevronRight,
  Play,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [stats, setStats] = useState({
    projects: 0,
    clients: 0,
    revenue: 0,
    satisfaction: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Animate stats
    const animateStats = () => {
      const targetStats = { projects: 150, clients: 85, revenue: 2.5, satisfaction: 98 };
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setStats({
          projects: Math.floor(targetStats.projects * progress),
          clients: Math.floor(targetStats.clients * progress),
          revenue: parseFloat((targetStats.revenue * progress).toFixed(1)),
          satisfaction: Math.floor(targetStats.satisfaction * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, stepTime);
    };

    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Project Management",
      description: "Comprehensive project tracking with milestones, deadlines, and team collaboration tools.",
      color: "text-blue-600"
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Smart Invoicing",
      description: "Automated invoice generation with customizable templates and payment tracking.",
      color: "text-green-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics Dashboard",
      description: "Real-time insights and reporting to track performance and make data-driven decisions.",
      color: "text-purple-600"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Time Tracking",
      description: "Accurate time logging with detailed reporting for better project cost management.",
      color: "text-orange-600"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Client Portal",
      description: "Dedicated client portals for seamless communication and project updates.",
      color: "text-indigo-600"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Workflow Automation",
      description: "Streamline repetitive tasks with intelligent automation and custom workflows.",
      color: "text-red-600"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Your Project",
      description: "Set up your project with detailed requirements, budget, and timeline.",
      icon: <Rocket className="h-6 w-6" />
    },
    {
      step: "02", 
      title: "Collaborate & Execute",
      description: "Work with your team using our powerful collaboration tools and tracking features.",
      icon: <Users className="h-6 w-6" />
    },
    {
      step: "03",
      title: "Track & Deliver",
      description: "Monitor progress, generate reports, and deliver exceptional results on time.",
      icon: <Target className="h-6 w-6" />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Project Manager",
      company: "TechCorp Solutions",
      content: "This platform has revolutionized how we manage our projects. The intuitive interface and powerful features have increased our productivity by 40%.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b6fc9b2d?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "CEO",
      company: "Innovation Labs",
      content: "The best project management solution we've used. Real-time collaboration and detailed analytics help us stay ahead of deadlines.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Emma Davis",
      role: "Operations Director", 
      company: "Global Ventures",
      content: "Outstanding customer support and robust features. The invoicing system alone has saved us countless hours every month.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "29",
      period: "month",
      description: "Perfect for small teams just getting started",
      features: [
        "Up to 5 projects",
        "3 team members",
        "Basic reporting",
        "Email support",
        "5GB storage"
      ],
      popular: false,
      buttonText: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "79",
      period: "month", 
      description: "Ideal for growing businesses and teams",
      features: [
        "Unlimited projects",
        "15 team members",
        "Advanced analytics",
        "Priority support",
        "50GB storage",
        "Custom integrations",
        "API access"
      ],
      popular: true,
      buttonText: "Get Started"
    },
    {
      name: "Enterprise",
      price: "199",
      period: "month",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited everything",
        "Unlimited team members",
        "White-label solution",
        "24/7 phone support",
        "500GB storage",
        "Custom development",
        "SLA guarantee",
        "Advanced security"
      ],
      popular: false,
      buttonText: "Contact Sales"
    }
  ];

  const technologies = [
    { name: "React", icon: <Code className="h-6 w-6" />, description: "Modern UI framework" },
    { name: "TypeScript", icon: <Code className="h-6 w-6" />, description: "Type-safe development" },
    { name: "PostgreSQL", icon: <Database className="h-6 w-6" />, description: "Reliable database" },
    { name: "Node.js", icon: <Globe className="h-6 w-6" />, description: "Scalable backend" },
    { name: "Cloud Native", icon: <Cloud className="h-6 w-6" />, description: "Always available" },
    { name: "Mobile Ready", icon: <Smartphone className="h-6 w-6" />, description: "Works everywhere" }
  ];

  return (
    <>
      <Helmet>
        <title>Professional Project Management Platform | Streamline Your Workflow</title>
        <meta name="description" content="Transform your project management with our comprehensive platform. Features include project tracking, invoicing, time management, analytics, and team collaboration tools." />
        <meta name="keywords" content="project management, invoicing, time tracking, team collaboration, business analytics, workflow automation" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium">
                🚀 New: Advanced Analytics Dashboard Available
              </Badge>
              
              <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Transform Your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Project Management
                </span>
              </h1>
              
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
                Streamline your workflow with our comprehensive platform. From project tracking to invoicing, 
                we provide everything you need to manage projects efficiently and deliver outstanding results.
              </p>
              
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link to="/project-dashboard">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                No credit card required • 14-day free trial • Setup in minutes
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 sm:text-4xl">{stats.projects}+</div>
                <div className="mt-2 text-sm font-medium text-gray-600">Projects Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 sm:text-4xl">{stats.clients}+</div>
                <div className="mt-2 text-sm font-medium text-gray-600">Happy Clients</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 sm:text-4xl">${stats.revenue}M+</div>
                <div className="mt-2 text-sm font-medium text-gray-600">Revenue Managed</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 sm:text-4xl">{stats.satisfaction}%</div>
                <div className="mt-2 text-sm font-medium text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Powerful features designed to streamline your project management workflow
              </p>
            </div>
            
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={feature.title}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color === 'text-blue-600' ? 'from-blue-500 to-blue-600' : 
                        feature.color === 'text-green-600' ? 'from-green-500 to-green-600' :
                        feature.color === 'text-purple-600' ? 'from-purple-500 to-purple-600' :
                        feature.color === 'text-orange-600' ? 'from-orange-500 to-orange-600' :
                        feature.color === 'text-indigo-600' ? 'from-indigo-500 to-indigo-600' :
                        'from-red-500 to-red-600'} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Get started in minutes with our simple three-step process
              </p>
            </div>
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {howItWorks.map((step, index) => (
                <div
                  key={step.step}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl mb-6">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 max-w-sm">{step.description}</p>
                  </div>
                  
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full">
                      <div className="flex items-center">
                        <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                        <ChevronRight className="h-6 w-6 text-gray-400 mx-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Loved by Teams Worldwide
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                See what our customers have to say about their experience
              </p>
            </div>
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.name}>
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      <Quote className="h-8 w-8 text-gray-300 mb-4" />
                      
                      <blockquote className="text-gray-600 mb-6">
                        "{testimonial.content}"
                      </blockquote>
                      
                      <div className="flex items-center">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="font-semibold text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-600">{testimonial.role}</div>
                          <div className="text-sm text-gray-500">{testimonial.company}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Choose the perfect plan for your team's needs
              </p>
            </div>
            
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <div key={plan.name}>
                  <Card className={`h-full relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border shadow-lg'}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-8">
                      <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}>
                        {plan.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600">
                All plans include a 14-day free trial. No setup fees. Cancel anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Built with Modern Technology
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Powered by cutting-edge tools for reliability and performance
              </p>
            </div>
            
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {technologies.map((tech, index) => (
                <div
                  key={tech.name}
                  className="flex items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm">
                    {tech.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Transform Your Project Management?
              </h2>
              <p className="mt-4 text-xl text-blue-100">
                Join thousands of teams who trust our platform to deliver exceptional results.
              </p>
              
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-base">
                  <Link to="/project-dashboard">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base border-white text-white hover:bg-white hover:text-gray-900">
                  <Link to="/contact">
                    Contact Sales
                  </Link>
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center space-x-8 text-blue-100">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="text-sm">Enterprise Security</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="text-sm">24/7 Support</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  <span className="text-sm">99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
