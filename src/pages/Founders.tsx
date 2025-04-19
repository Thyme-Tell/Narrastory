import React from 'react';
import PurchaseSection from '@/components/founders/PurchaseSection';
import FAQSection from '@/components/founders/FAQSection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarDays, Clock, Users, BookOpen, Archive, MessageSquare, HeartHandshake } from 'lucide-react';

const Founders = () => {
  return (
    <div className="min-h-screen bg-[#FDF8F4]">
      {/* Hero Section */}
      <section className="relative py-32 md:py-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDF8F4] to-white/50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-caslon font-thin text-[#262626] tracking-tight">
              Welcome Back, Storytellers!
            </h1>
            <p className="text-xl md:text-2xl text-[#2F3546] max-w-3xl mx-auto">
              Thank you for joining us at the workshop. We're excited to continue this storytelling journey with you!
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                className="bg-[#A33D29] hover:bg-[#A33D29]/90 text-white text-lg px-8 py-6 rounded-full"
                onClick={() => document.getElementById('purchase')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Join the Program
              </Button>
              <Button 
                variant="outline"
                className="border-[#A33D29] text-[#A33D29] hover:bg-[#A33D29]/10 text-lg px-8 py-6 rounded-full"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Next Chapter Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-caslon font-thin text-[#262626] tracking-tight">
                Your Next Chapter with Narra
              </h2>
              <p className="text-xl text-[#2F3546] max-w-3xl mx-auto">
                After meeting you at the workshop and hearing snippets of your amazing stories, we're thrilled to invite you to join our 4-week intensive storytelling program. Together, we'll transform your memories into a beautiful family keepsake.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-24 bg-[#FDF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-16">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-caslon font-thin text-[#262626] tracking-tight">
                Your 4-Week Journey
              </h2>
              <p className="text-xl text-[#2F3546]">
                Meet with Richard and Mia twice a week to bring your stories to life
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <h3 className="text-2xl font-caslon font-thin text-[#262626]">Week 1</h3>
                  <p className="text-[#2F3546]">Deep dive into your core stories</p>
                </div>
              </Card>
              <Card className="p-8 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <h3 className="text-2xl font-caslon font-thin text-[#262626]">Week 2</h3>
                  <p className="text-[#2F3546]">Expand your narrative with photos and details</p>
                </div>
              </Card>
              <Card className="p-8 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <h3 className="text-2xl font-caslon font-thin text-[#262626]">Week 3</h3>
                  <p className="text-[#2F3546]">Refine and structure your story collection</p>
                </div>
              </Card>
              <Card className="p-8 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <h3 className="text-2xl font-caslon font-thin text-[#262626]">Week 4</h3>
                  <p className="text-[#2F3546]">Finalize your book design and digital archive</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-16">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-caslon font-thin text-[#262626] tracking-tight">
                  What's Included
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12">
                <div className="flex items-start space-x-6">
                  <CalendarDays className="w-8 h-8 text-[#A33D29] flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-caslon text-[#262626]">8 Personal Sessions</h3>
                    <p className="text-[#2F3546]">Two sessions per week with Richard and Mia</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <MessageSquare className="w-8 h-8 text-[#A33D29] flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-caslon text-[#262626]">Professional Story Capture</h3>
                    <p className="text-[#2F3546]">Expert guidance and organization</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <Archive className="w-8 h-8 text-[#A33D29] flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-caslon text-[#262626]">Digital Preservation</h3>
                    <p className="text-[#2F3546]">Secure storage of all your stories</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <Users className="w-8 h-8 text-[#A33D29] flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-caslon text-[#262626]">Family Collaboration</h3>
                    <p className="text-[#2F3546]">Platform access for shared storytelling</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <BookOpen className="w-8 h-8 text-[#A33D29] flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-caslon text-[#262626]">Custom Book Design</h3>
                    <p className="text-[#2F3546]">Beautiful hardcover keepsake</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <HeartHandshake className="w-8 h-8 text-[#A33D29] flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-caslon text-[#262626]">Priority Support</h3>
                    <p className="text-[#2F3546]">Dedicated assistance throughout</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Details Section */}
      <section className="py-24 bg-[#FDF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-16">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-caslon font-thin text-[#262626] tracking-tight">
                  Program Details
                </h2>
              </div>
              
              <Card className="p-12 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-6">
                  <Clock className="w-8 h-8 text-[#A33D29] flex-shrink-0" />
                  <div className="space-y-4">
                    <h3 className="text-2xl font-caslon text-[#262626]">Session Schedule</h3>
                    <ul className="space-y-3 text-[#2F3546] list-disc list-inside">
                      <li>Morning (10:00 AM - 11:30 AM) or evening (6:00 PM - 7:30 PM) slots</li>
                      <li>Tuesdays and Thursdays</li>
                      <li>Virtual or in-person options available</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Foundation Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-caslon font-thin text-[#262626] tracking-tight">
                Building on Our Workshop Foundation
              </h2>
              <p className="text-xl text-[#2F3546] max-w-3xl mx-auto">
                Remember those story prompts we explored together? We'll use them as stepping stones to dive deeper into your family's unique narrative. Your initial stories from the workshop will be seamlessly integrated into your final book.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Family Participation Section */}
      <section className="py-24 bg-[#FDF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-caslon font-thin text-[#262626] tracking-tight">
                Family Participation
              </h2>
              <p className="text-xl text-[#2F3546] max-w-3xl mx-auto">
                As discussed in the workshop, family members are welcome to join specific sessions. We'll help coordinate these collaborative moments to enrich your story collection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section id="purchase">
        <PurchaseSection />
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer id="contact" className="py-24 bg-[#FDF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <p className="text-xl text-[#2F3546]">
              Made with love for our workshop alumni
            </p>
            <div className="space-y-4">
              <p className="text-lg text-[#2F3546]">
                Ready to continue your story? Contact us at{" "}
                <a href="mailto:support@narrastory.com" className="text-[#A33D29] hover:underline">
                  support@narrastory.com
                </a>
              </p>
              <p className="text-sm text-[#2F3546]">
                © 2025 Narra. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Founders; 