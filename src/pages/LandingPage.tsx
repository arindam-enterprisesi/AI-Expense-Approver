import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Zap, Shield } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/ai-expense-approver logo.ico" alt="Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-900">AI Expense Approver</h1>
          </div>
          <Link to="/dashboard">
            <Button className="bg-[#5ABA47] hover:bg-[#4a9c3a] text-white">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Streamline Your Travel Expenses with AI
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Automatically extract receipt data, sync with Gmail, and get instant AI-powered 
          policy compliance checks for your travel reimbursements.
        </p>
        <Link to="/dashboard">
          <Button size="lg" className="bg-[#5ABA47] hover:bg-[#4a9c3a] text-white text-lg px-8 py-6">
            Start Managing Expenses
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="w-12 h-12 text-[#5ABA47] mb-4" />
              <CardTitle>Gmail Integration</CardTitle>
              <CardDescription>
                Automatically sync receipts from your Gmail inbox with one click
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect your Gmail account and let AI find all your receipt attachments automatically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-[#5ABA47] mb-4" />
              <CardTitle>Smart OCR Extraction</CardTitle>
              <CardDescription>
                Extract amounts, dates, and vendor info from receipts instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced OCR technology reads your receipts and auto-fills expense forms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 text-[#5ABA47] mb-4" />
              <CardTitle>AI Policy Compliance</CardTitle>
              <CardDescription>
                Get instant feedback on expense policy compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI analyzes each expense against company policies and flags any issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#5ABA47] text-white py-16 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to simplify expense management?</h3>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of professionals managing their travel expenses smarter
          </p>
          <Link to="/dashboard">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/ai-expense-approver logo.ico" alt="Logo" className="w-6 h-6" />
              <span className="text-gray-600">© 2026 AI Expense Approver</span>
            </div>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="text-gray-600 hover:text-[#5ABA47] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-600 hover:text-[#5ABA47] transition-colors">
                Terms of Service
              </Link>
              <a 
                href="mailto:arindamchakraborty6.10@gmail.com" 
                className="text-gray-600 hover:text-[#5ABA47] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
