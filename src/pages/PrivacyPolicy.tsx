import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Mail } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/ai-expense-approver logo.ico" alt="Logo" className="w-6 h-6" />
              <span className="font-semibold text-gray-900">AI Expense Approver</span>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: February 24, 2026</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#5ABA47]" />
              Our Commitment to Your Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              AI Expense Approver is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, and safeguard your information when you use our application.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Google Sign-In Information</h3>
              <p className="text-gray-700">
                When you sign in with your Google account, we collect:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                <li>Your name</li>
                <li>Your email address</li>
                <li>Your Google profile picture (optional)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Gmail Integration</h3>
              <p className="text-gray-700">
                If you choose to connect your Gmail account, we access:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                <li>Email messages containing receipt attachments</li>
                <li>Attachment files (images and PDFs)</li>
                <li>Email metadata (date, subject, sender)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Expense Data</h3>
              <p className="text-gray-700">
                We store the following information you provide:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                <li>Travel expense details (dates, amounts, categories)</li>
                <li>Receipt images and documents you upload</li>
                <li>Expense proposals and reports you create</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">We use the collected information solely for:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>
                <strong>Authentication:</strong> Verifying your identity and providing secure access to your account
              </li>
              <li>
                <strong>Expense Tracking:</strong> Processing and managing your travel expense data
              </li>
              <li>
                <strong>OCR Processing:</strong> Extracting data from receipt images to auto-fill expense forms
              </li>
              <li>
                <strong>AI Analysis:</strong> Checking expense compliance with travel policies
              </li>
              <li>
                <strong>Gmail Sync:</strong> Automatically detecting and importing receipt attachments from your emails
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Data Storage and Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              Your data is stored securely using industry-standard practices:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>All data is stored in your browser's local storage</li>
              <li>Gmail OAuth tokens are encrypted and stored securely</li>
              <li>Receipt images and documents are processed locally in your browser</li>
              <li>We implement appropriate security measures to protect against unauthorized access</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 font-semibold">
              We do NOT sell, trade, or share your personal information with third parties.
            </p>
            <p className="text-gray-700">
              Your data is used exclusively for the functionality of this application. We may share 
              information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>With your explicit consent</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>
                <strong>Google OAuth:</strong> For secure authentication (subject to{' '}
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#5ABA47] hover:underline"
                >
                  Google's Privacy Policy
                </a>)
              </li>
              <li>
                <strong>Gmail API:</strong> For email and attachment access (subject to{' '}
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#5ABA47] hover:underline"
                >
                  Google's Privacy Policy
                </a>)
              </li>
              <li>
                <strong>Google Gemini AI:</strong> For expense analysis and policy compliance checking
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">You have the right to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Access, update, or delete your personal information</li>
              <li>Disconnect your Gmail account at any time</li>
              <li>Revoke Google OAuth access through your Google Account settings</li>
              <li>Delete all your expense data from the application</li>
              <li>Export your expense data</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              We retain your information for as long as your account is active or as needed to 
              provide you services. You can delete your data at any time by:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Clearing your browser's local storage</li>
              <li>Disconnecting your Gmail account</li>
              <li>Revoking OAuth access through Google Account settings</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              This application is not intended for use by children under the age of 13. We do not 
              knowingly collect personal information from children under 13.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#5ABA47]" />
              10. Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-900 font-semibold">Email:</p>
              <a 
                href="mailto:arindamchakraborty6.10@gmail.com"
                className="text-[#5ABA47] hover:underline text-lg"
              >
                arindamchakraborty6.10@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button className="bg-[#5ABA47] hover:bg-[#4a9c3a] text-white">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2026 AI Expense Approver. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
