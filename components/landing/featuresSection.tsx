import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Brain, 
  Users, 
  Shield, 
  BarChart3, 
  FileText, 
  Settings, 
  Zap, 
  Globe,
  Lock,
  Upload,
  MessageSquare,
  CheckCircle
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Question Generation",
    description: "Upload documents (PDF, DOCX, PPT) and let AI automatically generate relevant questions with multiple choice, true/false, and open-ended formats."
  },
  {
    icon: Users,
    title: "Multi-Tenant Architecture", 
    description: "Secure isolation between organizations with role-based access control, ensuring data privacy and customized experiences for each tenant."
  },
  {
    icon: Shield,
    title: "Flexible Authentication",
    description: "Support for public tests, user registration-required tests, or exclusive participant lists with bulk upload capabilities."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time performance tracking, detailed reporting, and insights into participant behavior and test effectiveness."
  },
  {
    icon: FileText,
    title: "Multiple Question Types",
    description: "Create diverse assessments with multiple choice, select all that apply, free text responses, true/false, and custom question formats."
  },
  {
    icon: Settings,
    title: "Comprehensive Test Settings",
    description: "Configure time limits, result visibility, retake policies, question shuffling, and participant management options."
  },
  {
    icon: Zap,
    title: "Real-Time Test Taking",
    description: "Smooth, responsive test interface with auto-save, progress tracking, and seamless user experience across devices."
  },
  {
    icon: Globe,
    title: "Enterprise-Ready",
    description: "Scalable infrastructure supporting thousands of concurrent users with 99.9% uptime and global CDN distribution."
  },
  {
    icon: Lock,
    title: "Data Security & Privacy",
    description: "End-to-end encryption, GDPR compliance, secure data storage, and comprehensive audit trails for enterprise security."
  },
  {
    icon: Upload,
    title: "Bulk Operations",
    description: "Upload participant lists via Excel, batch question creation, and bulk test management for efficient administration."
  },
  {
    icon: MessageSquare,
    title: "Communication Tools",
    description: "Automated email notifications, test invitations, result distribution, and participant communication management."
  },
  {
    icon: CheckCircle,
    title: "Result Management",
    description: "Flexible result sharing options - immediate display, admin-only access, or hybrid approaches based on your requirements."
  }
]

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful <span className="bg-blue-400 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create, manage, and analyze professional assessments. 
            Built for scale, designed for simplicity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="feature"
              className="h-full animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-400 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}