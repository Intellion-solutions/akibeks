
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalendarIcon, CheckCircle, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

const BookVisit = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    location: "",
    preferredTime: "",
    description: "",
    urgency: ""
  });

  const projectTypes = [
    "House Construction",
    "Commercial Building",
    "Renovation",
    "Civil Works",
    "Electrical Works",
    "Plumbing",
    "Quantity Surveying",
    "Consultation Only"
  ];

  const timeSlots = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Site visit booked:", { ...formData, date });
    toast({
      title: "Site Visit Scheduled!",
      description: "We'll confirm your appointment within 2 hours.",
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      projectType: "",
      location: "",
      preferredTime: "",
      description: "",
      urgency: ""
    });
    setDate(undefined);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book a Site Visit</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Schedule a free consultation and site inspection with our expert team
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Visit Details</CardTitle>
                <CardDescription>
                  Please provide your project details and preferred visit time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectType">Project Type *</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="location">Site Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Karen, Nairobi or provide specific address"
                      required
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Preferred Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="preferredTime">Preferred Time *</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, preferredTime: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div>
                    <Label htmlFor="urgency">Project Urgency</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="How urgent is your project?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (within 1 month)</SelectItem>
                        <SelectItem value="soon">Soon (1-3 months)</SelectItem>
                        <SelectItem value="planning">Planning stage (3-6 months)</SelectItem>
                        <SelectItem value="future">Future project (6+ months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project Description */}
                  <div>
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell us about your project, any specific requirements, or questions you have..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Schedule Site Visit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Site Assessment</h4>
                    <p className="text-sm text-gray-600">Our expert will evaluate your site and project requirements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Technical Discussion</h4>
                    <p className="text-sm text-gray-600">Review plans, discuss options, and answer your questions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Preliminary Quote</h4>
                    <p className="text-sm text-gray-600">Receive an initial cost estimate and project timeline</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Duration: 45-60 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">We travel to your location</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Completely free consultation</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Immediate Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" asChild>
                  <a href="tel:+254710245118">Call +254 710 245 118</a>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <a href="https://wa.me/254710245118" target="_blank" rel="noopener noreferrer">
                    WhatsApp Chat
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookVisit;
