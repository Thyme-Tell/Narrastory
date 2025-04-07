
import React, { forwardRef, useState } from "react";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ScheduleFormData {
  name: string;
  email: string;
  phone: string;
  facility: string;
  message: string;
}

const FinalCTASection = forwardRef<HTMLElement>((props, ref) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    email: '',
    phone: '',
    facility: '',
    message: ''
  });
  const [downloadEmail, setDownloadEmail] = useState('');
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleDemo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real implementation, this would submit the form data to a backend
    console.log('Schedule demo form data:', formData);
    setIsDialogOpen(false);
    setIsSuccessDialogOpen(true);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      facility: '',
      message: ''
    });
  };

  const handleDownloadStories = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real implementation, this would trigger a download or send an email
    console.log('Download requested for:', downloadEmail);
    setIsDownloadDialogOpen(false);
    toast({
      title: "Success!",
      description: "Success stories have been sent to your email.",
    });
    // Reset email
    setDownloadEmail('');
  };

  return (
    <section ref={ref} className="py-16 max-w-6xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-caslon font-thin text-[#242F3F] mb-6">
        Ready to Transform Your Activity Programming?
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#A33D29] hover:bg-[#A33D29]/90 text-white rounded-full px-8 py-6 text-lg"
        >
          Schedule Your Free Demo
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        <Button 
          onClick={() => setIsDownloadDialogOpen(true)}
          variant="outline"
          className="border-[#242F3F] text-[#242F3F] hover:bg-[#242F3F]/10 rounded-full px-8 py-6 text-lg"
        >
          Download Success Stories
          <Download className="ml-2 h-5 w-5" />
        </Button>
      </div>
      
      {/* Schedule Demo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-caslon">Schedule Your Free Demo</DialogTitle>
            <DialogDescription>
              Fill out the form below and one of our team members will contact you shortly.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleScheduleDemo} className="space-y-4 mt-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="name" className="text-left text-sm font-medium">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="email" className="text-left text-sm font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="phone" className="text-left text-sm font-medium">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="facility" className="text-left text-sm font-medium">Facility Name</label>
              <input
                type="text"
                id="facility"
                name="facility"
                value={formData.facility}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="message" className="text-left text-sm font-medium">Additional Information</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <Button type="submit" className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white">
              Submit Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-caslon">Thank You!</DialogTitle>
            <DialogDescription>
              Your demo request has been received. A member of our team will contact you within 24 hours to schedule your personalized demonstration.
            </DialogDescription>
          </DialogHeader>
          
          <Button 
            onClick={() => setIsSuccessDialogOpen(false)} 
            className="mt-4 bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Download Stories Dialog */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-caslon">Download Success Stories</DialogTitle>
            <DialogDescription>
              Enter your email to receive our collection of success stories from senior living communities.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleDownloadStories} className="space-y-4 mt-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="download-email" className="text-left text-sm font-medium">Email</label>
              <input
                type="email"
                id="download-email"
                value={downloadEmail}
                onChange={(e) => setDownloadEmail(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <Button type="submit" className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white">
              Send Me the Stories
              <Download className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
});

FinalCTASection.displayName = "FinalCTASection";

export default FinalCTASection;
