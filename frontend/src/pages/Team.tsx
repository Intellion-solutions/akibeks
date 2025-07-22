
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Linkedin, Twitter } from "lucide-react";
import { secureDb } from "@/lib/database-secure";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url: string;
}

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await secureDb.getUsers({ isActive: true });

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      const membersData = Array.isArray(data) ? data : [];
      
      // Transform database User to TeamMember interface
      const transformedMembers = membersData.map((dbUser: any) => ({
        id: dbUser.id,
        full_name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || 'Unknown User',
        email: dbUser.email || '',
        phone: dbUser.phone || '',
        role: dbUser.role || 'viewer',
        avatar_url: dbUser.profileImage || ''
      }));
      
      setTeamMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'engineer':
        return 'bg-green-100 text-green-800';
      case 'supervisor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section with 3D Animation */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="animate-pulse absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="animate-bounce absolute top-32 right-20 w-16 h-16 bg-orange-500 rounded-full"></div>
          <div className="animate-ping absolute bottom-20 left-1/3 w-12 h-12 bg-white rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">Our Expert Team</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-fade-in">
              Meet the professionals who bring your construction dreams to life
            </p>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading team members...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={member.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 relative">
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                        {member.full_name.charAt(0)}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{member.full_name}</CardTitle>
                    <CardDescription>
                      <Badge className={getRoleColor(member.role)}>
                        {formatRole(member.role)}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {member.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-orange-500" />
                          <a href={`mailto:${member.email}`} className="hover:text-orange-500 transition-colors">
                            {member.email}
                          </a>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-orange-500" />
                          <a href={`tel:${member.phone}`} className="hover:text-orange-500 transition-colors">
                            {member.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex space-x-3 pt-3">
                        <Linkedin className="w-4 h-4 text-blue-600 hover:scale-125 transition-transform cursor-pointer" />
                        <Twitter className="w-4 h-4 text-blue-400 hover:scale-125 transition-transform cursor-pointer" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Team Excellence</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-orange-500 mb-2">150+</div>
              <div className="text-xl">Years Combined Experience</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-orange-500 mb-2">25+</div>
              <div className="text-xl">Certified Engineers</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-orange-500 mb-2">500+</div>
              <div className="text-xl">Projects Delivered</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-orange-500 mb-2">24/7</div>
              <div className="text-xl">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;
