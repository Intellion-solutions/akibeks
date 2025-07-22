
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectForm from "@/components/ProjectForm";

const CreateProject = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Create New Project - AKIBEKS Engineering Solutions</title>
        <meta name="description" content="Start your construction project with AKIBEKS. Fill out our detailed project form to get started with professional engineering and construction services." />
        <meta name="keywords" content="construction project, engineering services, Kenya construction, project planning" />
      </Helmet>
      
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your Construction Project
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to begin your construction journey? Fill out our comprehensive project form 
              and our expert team will get back to you with a detailed proposal.
            </p>
          </div>
          
          <ProjectForm />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateProject;
