export interface Profile {
    id?: string;
    name?: string;
    username?: string;
    picture?: string;
    about?: string;
    displayName?: string;
    website?: string;
    banner?: string;
    lud06?: string;
    lud16?: string;
    nip05?: string;
}

export interface Contact {
    pubKey?: string;
    name?: string;
    username?: string;
    picture?: string;
    about?: string;
    displayName?: string;
    website?: string;
    banner?: string;
    lud06?: string;
    lud16?: string;
    nip05?: string;
}

export interface Chat {
    id?: string;
    contactId?: string;
    contact?: Contact;
    unreadCount?: number;
    muted?: boolean;
    lastMessage?: string;
    lastMessageAt?: string;
    messages?: {
        id?: string;
        chatId?: string;
        contactId?: string;
        isMine?: boolean;
        value?: string;
        createdAt?: string;
    }[];
}
