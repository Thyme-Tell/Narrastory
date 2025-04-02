
import React, { useState, useEffect } from "react";
import { testSlackConnection, sendTestMessage } from "@/utils/testSlackNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";

const SlackTest = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [configStatus, setConfigStatus] = useState<{
    checking: boolean;
    hasBotToken: boolean;
    error: string | null;
  }>({
    checking: true,
    hasBotToken: false,
    error: null
  });
  const { toast } = useToast();

  // Check if the SLACK_BOT_TOKEN environment variable is configured
  useEffect(() => {
    const checkConfig = async () => {
      try {
        setConfigStatus(prev => ({ ...prev, checking: true }));
        const response = await testSlackConnection();
        
        setConfigStatus({
          checking: false,
          hasBotToken: response?.slack_bot_token_present === true,
          error: null
        });
      } catch (error) {
        console.error("Error checking Slack configuration:", error);
        setConfigStatus({
          checking: false,
          hasBotToken: false,
          error: error instanceof Error ? error.message : "Unknown error checking configuration"
        });
      }
    };

    checkConfig();
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setResult(null);
    try {
      const response = await testSlackConnection();
      setResult(response);
      toast({
        title: response.success ? "Success" : "Error",
        description: response.message || "Connection test completed",
        variant: response.success ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error("Error testing connection:", error);
      setResult({ success: false, error: error.message });
      toast({
        title: "Error",
        description: `Failed to test connection: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    setIsSendingMessage(true);
    setResult(null);
    try {
      const response = await sendTestMessage(testMessage);
      setResult(response);
      toast({
        title: response.success ? "Success" : "Error",
        description: response.success 
          ? "Message sent successfully" 
          : "Failed to send message",
        variant: response.success ? "default" : "destructive",
      });
      if (response.success) {
        setTestMessage("");
      }
    } catch (error: any) {
      console.error("Error sending test message:", error);
      setResult({ success: false, error: error.message });
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Slack Notification Test</h1>
      
      {/* Configuration Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
          <CardDescription>
            Check if your Slack integration is correctly configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configStatus.checking ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <InfoIcon className="h-5 w-5" />
              <span>Checking configuration...</span>
            </div>
          ) : configStatus.error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                {configStatus.error}
                <div className="mt-2 text-sm">
                  This could indicate that the Edge Function is not properly deployed or accessible.
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Edge Function:</span>
                <span className="text-sm px-2 py-1 bg-slate-100 rounded-md">slack-notification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">SLACK_BOT_TOKEN:</span>
                {configStatus.hasBotToken ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircleIcon className="h-4 w-4" />
                    Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertCircleIcon className="h-4 w-4" />
                    Not configured
                  </span>
                )}
              </div>
              
              {!configStatus.hasBotToken && (
                <Alert className="mt-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Missing Slack Bot Token</AlertTitle>
                  <AlertDescription>
                    The SLACK_BOT_TOKEN environment variable is not configured. Please add it to your Supabase project secrets.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Connection</CardTitle>
          <CardDescription>
            Verify that your Slack bot token is correctly configured and the edge function is working.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleTestConnection} 
            disabled={isTestingConnection}
            className="w-full md:w-auto"
          >
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Send Test Message</CardTitle>
          <CardDescription>
            Send a test message to your configured Slack channel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter test message"
              className="flex-1"
            />
            <Button 
              onClick={handleSendTestMessage} 
              disabled={isSendingMessage || !testMessage.trim()}
              className="w-full md:w-auto"
            >
              {isSendingMessage ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SlackTest;
