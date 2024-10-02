interface WebLN {
    enable(): Promise<void>;
    isEnabled(): boolean;
    sendPayment(paymentRequest: string): Promise<any>;
  }

  interface Window {
    webln?: WebLN;
  }
