import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { SignInButton } from "@clerk/nextjs"

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for hobbyists and individual creators",
    features: [
      "Up to 3 tests per month",
      "Maximum 10 questions per test",
      "Basic question types",
      "50 participants per test",
      "Basic analytics",
      "Community support"
    ],
    limitations: [
      "No AI question generation",
      "No document upload",
      "Basic participant management"
    ],
    buttonText: "Get Started Free",
    popular: false
  },
  {
    name: "Educational",
    price: "$29",
    period: "per month",
    description: "Ideal for schools, universities, and training centers",
    features: [
      "Unlimited tests",
      "Up to 50 questions per test",
      "All question types",
      "500 participants per test",
      "AI question generation (100 questions/month)",
      "Document upload support",
      "Advanced analytics",
      "Bulk participant upload",
      "Email support",
      "Custom branding"
    ],
    buttonText: "Start Educational Plan",
    popular: true
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "Complete solution for large organizations",
    features: [
      "Unlimited everything",
      "Unlimited questions per test",
      "All premium features",
      "Unlimited participants",
      "Unlimited AI question generation",
      "Advanced document processing",
      "White-label solution",
      "Priority support",
      "Custom integrations",
      "SSO authentication",
      "Advanced reporting",
      "API access"
    ],
    buttonText: "Contact Sales",
    popular: false
  }
]

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="bg-gradient-brand bg-clip-text text-transparent">Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scalable pricing that grows with your needs. Start free and upgrade when you're ready.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={plan.name} 
              variant="pricing" 
              className={`relative ${plan.popular ? 'border-primary shadow-brand scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-brand text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-success">✓ Included Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {plan.limitations && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm mb-3 text-muted-foreground">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-4 h-4 text-center mt-0.5 flex-shrink-0">•</span>
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                {plan.name === "Enterprise" ? (
                  <Button className="w-full" variant={plan.popular ? "hero" : "default"}>
                    {plan.buttonText}
                  </Button>
                ) : (
                  <SignInButton mode="modal" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
                    <Button className="w-full" variant={plan.popular ? "hero" : "default"}>
                      {plan.buttonText}
                    </Button>
                  </SignInButton>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required for the free tier.
          </p>
        </div>
      </div>
    </section>
  )
}