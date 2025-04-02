
import React, { useState } from "react";
import { testSlackConnection, sendTestMessage } from "@/utils/testSlackNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SlackTest = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

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
    } catch (error) {
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
    } catch (error) {
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
      
      <div className="mb-8 p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Test Connection</h2>
        <p className="mb-4 text-muted-foreground">
          Verify that your Slack bot token is correctly configured and the edge function is working.
        </p>
        <Button 
          onClick={handleTestConnection} 
          disabled={isTestingConnection}
          className="w-full md:w-auto"
        >
          {isTestingConnection ? "Testing..." : "Test Connection"}
        </Button>
      </div>

      <div className="mb-8 p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
        <p className="mb-4 text-muted-foreground">
          Send a test message to your configured Slack channel.
        </p>
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
      </div>

      {result && (
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SlackTest;
