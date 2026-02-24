import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Receipt, FileText, Mail } from 'lucide-react';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-6 h-6 text-[#5ABA47]" />
              <span className="font-semibold text-gray-900">AI Travel Expense Manager</span>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: February 24, 2026</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#5ABA47]" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              By accessing and using AI Travel Expense Manager ("the Service"), you agree to be bound 
              by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              AI Travel Expense Manager is a web application that helps users manage their travel 
              expenses by:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Integrating with Gmail to automatically detect receipt attachments</li>
              <li>Using OCR technology to extract data from receipt images</li>
              <li>Providing AI-powered expense policy compliance checking</li>
              <li>Organizing and tracking travel expense proposals</li>
              <li>Generating expense reports</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              By creating an account and using the Service, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Continued use of the Service 
              after changes constitutes acceptance of the modified terms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. User Accounts and Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              To use the Service, you must:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Sign in using your Google account</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 13 years of age</li>
            </ul>
            <p className="text-gray-700">
              You are responsible for all activities that occur under your account. Notify us 
              immediately of any unauthorized use.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Gmail Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              The Gmail integration feature is optional. By connecting your Gmail account, you:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Grant the Service permission to read emails and attachments</li>
              <li>Understand that only receipt-related emails and attachments are processed</li>
              <li>Can disconnect your Gmail account at any time</li>
              <li>Acknowledge that Gmail access is subject to Google's Terms of Service</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">You agree to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Use the Service only for lawful purposes</li>
              <li>Ensure the accuracy of expense data you submit</li>
              <li>Comply with your organization's expense policies</li>
              <li>Not use the Service to submit fraudulent expense claims</li>
              <li>Not attempt to bypass or interfere with the Service's security features</li>
              <li>Not use the Service to upload malicious content</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Data and Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              Your use of the Service is governed by our Privacy Policy. Key points include:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Your data is stored locally in your browser</li>
              <li>We do not sell or share your personal information</li>
              <li>You are responsible for backing up your important data</li>
              <li>You can delete your data at any time</li>
            </ul>
            <p className="text-gray-700">
              Please read our{' '}
              <Link to="/privacy-policy" className="text-[#5ABA47] hover:underline">
                Privacy Policy
              </Link>{' '}
              for complete details.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              The Service, including its design, features, and functionality, is owned by 
              AI Travel Expense Manager and is protected by copyright and other intellectual 
              property laws.
            </p>
            <p className="text-gray-700">
              You retain all rights to the data and content you upload to the Service. By using 
              the Service, you grant us a license to process your data solely for providing the 
              Service's functionality.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Disclaimer of Warranties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 font-semibold">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p className="text-gray-700">
              We do not warrant that:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>OCR extraction will be 100% accurate</li>
              <li>AI analysis will catch all policy violations</li>
              <li>The Service will meet all your specific requirements</li>
            </ul>
            <p className="text-gray-700">
              You are responsible for verifying all expense data before submission to your organization.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              To the maximum extent permitted by law, AI Travel Expense Manager shall not be liable for:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of data, revenue, or business opportunities</li>
              <li>Errors in OCR extraction or AI analysis</li>
              <li>Actions taken based on information provided by the Service</li>
              <li>Unauthorized access to your account or data</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. AI-Powered Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              The Service uses AI technology for:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>OCR text extraction from receipts</li>
              <li>Expense policy compliance checking</li>
              <li>Data categorization and analysis</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              AI results should be reviewed and verified by users. We are not responsible for 
              errors or inaccuracies in AI-generated outputs.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>11. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              The Service integrates with third-party services including:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Google OAuth and Gmail API</li>
              <li>Google Gemini AI</li>
              <li>Tesseract.js for OCR</li>
            </ul>
            <p className="text-gray-700">
              Your use of these third-party services is subject to their respective terms and policies. 
              We are not responsible for the availability or functionality of third-party services.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>12. Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              You may stop using the Service at any time by:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
              <li>Disconnecting your Gmail account</li>
              <li>Revoking OAuth access through Google Account settings</li>
              <li>Clearing your browser's local storage</li>
            </ul>
            <p className="text-gray-700">
              We reserve the right to suspend or terminate access to the Service for violations of 
              these Terms of Service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>13. Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless AI Travel Expense Manager from any claims, 
              damages, losses, or expenses arising from your use of the Service or violation of these terms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>14. Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              These Terms of Service shall be governed by and construed in accordance with applicable 
              laws, without regard to conflict of law principles.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>15. Changes to Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) 
              at any time without prior notice. We will not be liable to you or any third party for any 
              such modification, suspension, or discontinuation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#5ABA47]" />
              16. Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">
              If you have questions about these Terms of Service, please contact us:
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

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-gray-700">
            <strong>By using AI Travel Expense Manager, you acknowledge that you have read, 
            understood, and agree to these Terms of Service.</strong>
          </p>
        </div>

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
          <p>© 2026 AI Travel Expense Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
