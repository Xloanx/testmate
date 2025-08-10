import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton , SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import Logo from "@/components/logo"

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="#features" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/demo" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </Link>
            <a 
              href="#contact" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal" fallbackRedirectUrl="/test-admin" forceRedirectUrl="/test-admin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/test-admin" forceRedirectUrl="/test-admin">
                <Button size="sm">
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>
            
            <SignedIn>
              <Button variant="outline" size="sm" asChild>
                <Link href="/test-admin">Dashboard</Link>
              </Button>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  )
}