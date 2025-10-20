 import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Buildings, 
  TrendUp, 
  FileText, 
  Shield, 
  ArrowRight,
  Sparkle,
  Globe,
  CreditCard
} from '@phosphor-icons/react';

interface GetStartedPageProps {
  onGetStarted: () => void;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => (
  <div
    className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 animate-fade-in card-hover-glass"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="flex items-start space-x-4">
      <div className="p-3 rounded-xl bg-primary/20 text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold text-lg mb-2 font-montserrat">{title}</h3>
        <p className="text-white/70 text-sm leading-relaxed font-montserrat">{description}</p>
      </div>
    </div>
  </div>
);

const GetStartedPage: React.FC<GetStartedPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen auth-background flex flex-col">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/5 rounded-full blur-2xl animate-float"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {/* Logo and Brand */}
          <div className="text-center mb-12 animate-fade-in">
            {/* 3D-style logo container with enhanced effects */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-gradient-to-br from-primary via-blue-600 to-blue-800 p-1 shadow-2xl animate-logo-bounce">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <img 
                    src="https://i.ibb.co/6LY7bxR/rjb-logo.jpg" 
                    alt="RJB TRANZ Logo" 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover z-10 relative"
                  />
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent rounded-full"></div>
                </div>
              </div>
              {/* Multiple glow layers */}
              <div className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-blue-500/30 blur-xl animate-pulse"></div>
              <div className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-blue-400/20 blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
              
              {/* Floating sparkles */}
              <div className="absolute -top-2 -left-2 text-blue-300 animate-bounce" style={{animationDelay: '0.2s'}}>
                <Sparkle className="h-4 w-4" weight="fill" />
              </div>
              <div className="absolute -bottom-2 -right-2 text-blue-300 animate-bounce" style={{animationDelay: '0.8s'}}>
                <Sparkle className="h-4 w-4" weight="fill" />
              </div>
              <div className="absolute top-4 -right-4 text-blue-200 animate-bounce" style={{animationDelay: '1.2s'}}>
                <Sparkle className="h-3 w-3" weight="fill" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-montserrat tracking-tight animate-fade-in bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent"
                style={{ animationDelay: '0.3s' }}>
              RJB TRANZ
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-3 font-montserrat animate-fade-in font-light"
               style={{ animationDelay: '0.5s' }}>
              Advanced Remittance Management System
            </p>
            
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto font-montserrat leading-relaxed animate-fade-in"
               style={{ animationDelay: '0.7s' }}>
              Streamline your international money transfers with our cutting-edge admin CRM system. 
              Manage transactions, track exchange rates, and print receipts with enterprise-grade security.
            </p>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
            <FeatureCard
              icon={<TrendUp className="h-7 w-7" weight="duotone" />}
              title="Real-time Exchange Rates"
              description="Live currency conversion with instant updates across 70+ countries. Get accurate rates and track market trends in real-time."
              delay={0.9}
            />
            <FeatureCard
              icon={<FileText className="h-7 w-7" weight="duotone" />}
              title="Smart Invoice Management"
              description="Create, track and manage transaction records with automated receipt generation and thermal printer integration."
              delay={1.1}
            />
            <FeatureCard
              icon={<Shield className="h-7 w-7" weight="duotone" />}
              title="Enterprise Security"
              description="Bank-level security with encrypted transactions, secure authentication, and comprehensive audit trails."
              delay={1.3}
            />
            <FeatureCard
              icon={<Globe className="h-7 w-7" weight="duotone" />}
              title="Global Coverage"
              description="Support for international transfers across multiple continents with automated compliance and regulatory features."
              delay={1.5}
            />
          </div>

          {/* Enhanced CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: '1.7s' }}>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="group relative h-16 px-12 bg-gradient-to-r from-primary via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-semibold text-lg rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25 font-montserrat overflow-hidden"
            >
              {/* Button background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
              
              {/* Button content */}
              <div className="flex items-center justify-center relative z-10">
                <CreditCard className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" weight="duotone" />
                Get Started
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" weight="bold" />
              </div>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -inset-1"></div>
            </Button>
            
            {/* Additional info below button */}
            <p className="text-white/60 text-sm mt-4 font-montserrat">
              Secure • Fast • Professional
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-8 mt-16 text-center animate-fade-in" style={{ animationDelay: '1.9s' }}>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white font-montserrat">70+</div>
              <div className="text-white/70 text-sm font-montserrat">Countries</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white font-montserrat">24/7</div>
              <div className="text-white/70 text-sm font-montserrat">Support</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white font-montserrat">99.9%</div>
              <div className="text-white/70 text-sm font-montserrat">Uptime</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 animate-fade-in" style={{ animationDelay: '2.1s' }}>
          <p className="text-white/50 text-sm font-montserrat">
            © 2024 RJB TRANZ. All rights reserved. | Professional Remittance Services
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStartedPage;