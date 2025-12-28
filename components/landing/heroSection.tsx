'use client'
import { Button } from "@/components/ui/button"
import { SignInButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
// import heroImage from "@/assets/hero-testing-platform.jpg"

export const HeroSection = () => {
  const { isSignedIn } = useAuth()

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/heroImage.jpg" 
          fill
          alt="Professional Testing Platform" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
            Professional <span className="bg-blue-400 bg-clip-text text-transparent">Testing Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Create, manage, and deploy professional assessments for educational institutions, 
            enterprises, and individual creators. AI-powered question generation, 
            multi-tenant architecture, and comprehensive analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {isSignedIn ? (
              <Button variant="hero" size="xl" asChild>
                <Link href="/test-admin">Go to Dashboard</Link>
              </Button>
            ) : (
              <SignInButton mode="modal" fallbackRedirectUrl="/test-admin" forceRedirectUrl="/test-admin">
                <Button variant="hero" size="xl">
                  Start Creating Tests
                </Button>
              </SignInButton>
            )}
            
            <Button variant="outline" size="xl" asChild>
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="text-sm font-medium">AI Question Generation</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
                <span className="text-white text-sm font-bold">MT</span>
              </div>
              <span className="text-sm font-medium">Multi-Tenant Architecture</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
                <span className="text-white text-sm font-bold">RT</span>
              </div>
              <span className="text-sm font-medium">Real-time Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}