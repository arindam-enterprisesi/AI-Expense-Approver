/**
 * Gmail OAuth Callback Handler
 * Handles the redirect from Google OAuth after user authorization
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gmailService } from '@/services/gmail.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, CheckCircle2, AlertCircle } from 'lucide-react';

export function GmailCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        return;
      }

      // Handle authorization code
      if (code) {
        try {
          const success = await gmailService.exchangeCodeForToken(code);
          if (success) {
            // Redirect to dashboard after 2 seconds to show success
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } catch (err) {
          console.error('Failed to exchange code for token:', err);
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const code = searchParams.get('code');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Gmail Account Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Authorization failed: {error}
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600">
                Redirecting you back to the dashboard...
              </p>
            </>
          ) : code ? (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Authorization successful! Your Gmail account is now connected.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600">
                Redirecting you to the dashboard...
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Processing authorization...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
