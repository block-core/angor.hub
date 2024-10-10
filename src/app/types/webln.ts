interface SendPaymentResponse {
    paymentHash?: string;
    preimage: string;
    route?: {
        total_amt: number;
        total_fees: number;
    };
}

interface RequestInvoiceArgs {
    amount?: string | number;
    defaultAmount?: string | number;
    minimumAmount?: string | number;
    maximumAmount?: string | number;
    defaultMemo?: string;
}

interface RequestInvoiceResponse {
    paymentRequest: string;
}

interface GetInfoResponse {
    node: {
        alias: string;
        pubkey: string;
        color?: string;
    };
}

interface SignMessageResponse {
    message: string;
    signature: string;
}

export interface WebLN {
    enabled: boolean;
    getInfo(): Promise<GetInfoResponse>;
    enable(): Promise<void>;
    makeInvoice(args: RequestInvoiceArgs): Promise<RequestInvoiceResponse>;
    signMessage(message: string): Promise<SignMessageResponse>;
    verifyMessage(signature: string, message: string): Promise<void>;
    sendPayment: (pr: string) => Promise<SendPaymentResponse>;
}

// export interface WalletInvoice {
//     pr: string;
//     paymentHash: string;
//     memo: string;
//     amount: MilliSats;
//     fees: number;
//     timestamp: number;
//     preimage?: string;
//     state: WalletInvoiceState;
//   }
