import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/heroSection"
import { FeaturesSection } from "@/components/landing/featuresSection"
import { PricingSection } from "@/components/landing/pricingSection"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <footer className="bg-surface py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Testmate Pro. All rights reserved. Built for educational institutions, enterprises, and creators.
          </p>

        </div>
      </footer>
    </div>
  );
};

export default Index;
