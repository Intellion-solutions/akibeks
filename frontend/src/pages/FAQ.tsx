
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      category: "General Services",
      icon: "🏗️",
      questions: [
        {
          q: "What types of construction services do you offer?",
          a: "We offer a comprehensive range of services including residential construction, commercial building, renovations, plumbing, electrical work, civil engineering, and project management."
        },
        {
          q: "Do you handle both residential and commercial projects?",
          a: "Yes, we handle both residential and commercial projects of all sizes, from small home renovations to large commercial developments."
        },
        {
          q: "What areas in Kenya do you serve?",
          a: "We primarily serve Nairobi and surrounding areas, but we also take on projects across Central Kenya and the Coast region. Contact us to confirm service availability in your area."
        }
      ]
    },
    {
      category: "Project Planning",
      icon: "📋",
      questions: [
        {
          q: "How do I get started with my construction project?",
          a: "Start by requesting a free consultation through our contact form or call us directly. We'll discuss your needs, schedule a site visit, and provide you with a detailed quote."
        },
        {
          q: "Do you provide architectural and design services?",
          a: "Yes, we have in-house architects and designers who can help bring your vision to life. We provide complete design-build services."
        },
        {
          q: "How long does the planning phase take?",
          a: "The planning phase typically takes 2-4 weeks depending on project complexity. This includes site surveys, design development, permit applications, and material sourcing."
        }
      ]
    },
    {
      category: "Costs & Pricing",
      icon: "💰",
      questions: [
        {
          q: "How do you determine project costs?",
          a: "Project costs are determined based on materials, labor, project complexity, timeline, and location. We provide detailed, transparent quotes with no hidden costs."
        },
        {
          q: "Do you offer financing options?",
          a: "We work with several financial partners to offer flexible payment plans. We can help you explore financing options that suit your budget."
        },
        {
          q: "When is payment due?",
          a: "We typically work on a milestone-based payment schedule: 20% deposit, 30% at foundation completion, 30% at roofing stage, and 20% at project completion."
        }
      ]
    },
    {
      category: "Quality & Timeline",
      icon: "⏰",
      questions: [
        {
          q: "How do you ensure quality in your work?",
          a: "We have strict quality control measures, use only certified materials, employ skilled craftsmen, and conduct regular inspections at every stage of construction."
        },
        {
          q: "What if the project takes longer than expected?",
          a: "We build realistic timelines and communicate any potential delays immediately. If delays are due to our fault, we absorb any additional costs."
        },
        {
          q: "Do you provide warranties on your work?",
          a: "Yes, we provide comprehensive warranties: 1 year on general construction, 2 years on electrical work, and 5 years on structural elements."
        }
      ]
    },
    {
      category: "Permits & Legal",
      icon: "📋",
      questions: [
        {
          q: "Do you handle building permits and approvals?",
          a: "Yes, we handle all necessary permits, approvals, and inspections required by local authorities. This is included in our comprehensive service."
        },
        {
          q: "Are you licensed and insured?",
          a: "Yes, we are fully licensed by the National Construction Authority (NCA) and carry comprehensive insurance including public liability and professional indemnity."
        },
        {
          q: "What happens if there are issues with local authorities?",
          a: "We have experienced teams who work closely with local authorities. We handle all compliance issues and ensure your project meets all regulatory requirements."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
           q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Find answers to common questions about our construction services
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No FAQs found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFAQs.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <span className="text-3xl mr-3">{category.icon}</span>
                      {category.category}
                    </CardTitle>
                    <CardDescription>
                      {category.questions.length} question{category.questions.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                          <AccordionTrigger className="text-left hover:text-orange-600 transition-colors">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 pt-4">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our team is here to help you directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Us
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500" asChild>
              <a href="https://wa.me/254710245118" target="_blank" rel="noopener noreferrer">
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
