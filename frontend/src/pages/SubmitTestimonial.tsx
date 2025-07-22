import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star, MessageSquare, ThumbsUp, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/db-client";
import { useToast } from "@/hooks/use-toast";

const testimonialSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters"),
  clientRole: z.string().min(2, "Role/position is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  rating: z.number().min(1, "Please provide a rating").max(5, "Rating cannot exceed 5 stars"),
  content: z.string().min(50, "Testimonial must be at least 50 characters long").max(1000, "Testimonial cannot exceed 1000 characters"),
  projectDetails: z.string().optional(),
  location: z.string().optional(),
  wouldRecommend: z.boolean().default(true)
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

const SubmitTestimonial = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      rating: 5,
      wouldRecommend: true
    }
  });

  const onSubmit = async (data: TestimonialFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          client_name: data.clientName,
          client_role: data.clientRole,
          client_email: data.email,
          client_phone: data.phone,
          project_type: data.projectType,
          content: data.content,
          rating: data.rating,
          project_details: data.projectDetails,
          location: data.location,
          would_recommend: data.wouldRecommend,
          is_approved: false,
          is_featured: false
        });

      if (error) throw error;

      toast({
        title: "Thank you for your testimonial!",
        description: "Your testimonial has been submitted and is pending approval. We appreciate your feedback!",
      });

      setIsSubmitted(true);
      form.reset();
      setSelectedRating(0);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your testimonial. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-8 h-8 cursor-pointer transition-colors ${
          i < (interactive ? (hoveredRating || selectedRating) : rating)
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
        onClick={interactive ? () => {
          setSelectedRating(i + 1);
          form.setValue('rating', i + 1);
        } : undefined}
        onMouseEnter={interactive ? () => setHoveredRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
      />
    ));
  };

  const projectTypes = [
    "Residential Construction",
    "Commercial Building", 
    "Infrastructure Development",
    "Renovation & Remodeling",
    "Engineering Consultation",
    "Project Management",
    "Structural Design",
    "Plumbing Services",
    "Electrical Services",
    "Interior Design",
    "Landscaping",
    "Other"
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <SEOHead 
          title="Thank You - Testimonial Submitted"
          description="Thank you for submitting your testimonial to AKIBEKS Engineering Solutions. Your feedback is valuable to us."
        />
        <Navbar />
        
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your testimonial has been successfully submitted and is now pending review. 
              We appreciate you taking the time to share your experience with AKIBEKS Engineering Solutions.
            </p>
            <div className="space-y-4 text-left bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-900">What happens next?</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Our team will review your testimonial for authenticity and content quality
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Once approved, it will be published on our website and testimonials page
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You may receive a follow-up email thanking you for your feedback
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                Submit Another Testimonial
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Return to Homepage
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Submit Your Testimonial - Share Your Experience"
        description="Share your experience with AKIBEKS Engineering Solutions. Help others discover our exceptional construction and engineering services by submitting your testimonial."
        keywords="AKIBEKS testimonial, construction review, engineering services review, customer feedback, client testimonial, construction company review Kenya"
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-6 text-orange-400" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Share Your <span className="text-orange-400">Experience</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Help others discover our exceptional construction and engineering services by sharing your project experience
          </p>
        </div>
      </section>

      {/* Testimonial Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Submit Your Testimonial</CardTitle>
                  <CardDescription>
                    Your feedback is valuable to us and helps other clients make informed decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="clientName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="clientRole"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role/Position *</FormLabel>
                              <FormControl>
                                <Input placeholder="CEO, Homeowner, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+254 700 000 000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="projectType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select the type of project we worked on" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {projectTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overall Rating *</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                {renderStars(field.value, true)}
                                <span className="ml-4 text-lg font-medium">
                                  {selectedRating || field.value}/5 stars
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Click the stars to rate your overall experience
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Testimonial *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please share your experience working with AKIBEKS Engineering Solutions. What aspects of our service stood out to you? How did we exceed your expectations? Your detailed feedback helps us improve and helps other clients understand our value."
                                className="min-h-[150px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {field.value?.length || 0}/1000 characters (minimum 50 required)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Details (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of the project we completed for you..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Help provide context about the work we did
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Location (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Nairobi, Mombasa, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting Testimonial...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Submit Testimonial
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ThumbsUp className="w-5 h-5 mr-2 text-green-600" />
                    Why Share Your Experience?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-sm">Help other clients make informed decisions</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-sm">Share your success story with our community</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-sm">Help us improve our services</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-sm">Contribute to our growing reputation</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Review Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <p className="text-sm">Submit your testimonial</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <p className="text-sm">Our team reviews for authenticity</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <p className="text-sm">Published on our website</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    If you need assistance with submitting your testimonial, feel free to contact us.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> info@akibeks.co.ke</p>
                    <p><strong>Phone:</strong> +254 710 245 118</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubmitTestimonial;
