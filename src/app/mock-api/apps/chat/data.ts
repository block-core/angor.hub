/* eslint-disable */
import { DateTime } from 'luxon';

/* Get the current instant */
const now = DateTime.now();

/**
 * Attachments are common and will be filled from here
 * to keep the demo data maintainable.
 */
const _attachments = {
    media: [
        'images/cards/01-320x200.jpg',
        'images/cards/02-320x200.jpg',
        'images/cards/03-320x200.jpg',
        'images/cards/04-320x200.jpg',
        'images/cards/05-320x200.jpg',
        'images/cards/06-320x200.jpg',
        'images/cards/07-320x200.jpg',
        'images/cards/08-320x200.jpg',
    ],
    docs: [],
    links: [],
};

/**
 *  If a message belongs to our user, it's marked by setting it as
 *  'me'. If it belongs to the user we are chatting with, then it
 *  left empty. We will be using this same conversation for each chat
 *  to keep things more maintainable for the demo.
 */
export const messages = [
    {
        id: 'e6b2b82f-b199-4a60-9696-5f3e40d2715d',
        contactId: 'me',
        value: 'Hi!',
        createdAt: now.minus({ week: 1 }).set({ hour: 18, minute: 56 }).toISO(),
    },
    {
        id: 'eb82cf4b-fa93-4bf4-a88a-99e987ddb7ea',
        contactId: '',
        value: 'Hey, dude!',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 4 }).toISO(),
    },
    {
        id: '3cf9b2a6-ae54-47db-97b2-ee139a8f84e5',
        contactId: '',
        value: 'Long time no see.',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 4 }).toISO(),
    },
    {
        id: '2ab91b0f-fafb-45f3-88df-7efaff29134b',
        contactId: 'me',
        value: 'Yeah, man... Things were quite busy for me and my family.',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 6 }).toISO(),
    },
    {
        id: '10e81481-378f-49ac-b06b-7c59dcc639ae',
        contactId: '',
        value: "What's up? Anything I can help with?",
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 6 }).toISO(),
    },
    {
        id: '3b334e72-6605-4ebd-a4f6-3850067048de',
        contactId: 'me',
        value: "We've been on the move, changed 3 places over 4 months.",
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 7 }).toISO(),
    },
    {
        id: '25998113-3a96-4dd0-a7b9-4d2bb58db3f3',
        contactId: '',
        value: "Wow! That's crazy! 🤯 What happened?",
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 7 }).toISO(),
    },
    {
        id: '30adb3da-0e4f-487e-aec2-6d9f31e097f6',
        contactId: 'me',
        value: 'You know I got a job in that big software company. First move was because of that.',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 8 }).toISO(),
    },
    {
        id: 'c0d6fd6e-d294-4845-8751-e84b8f2c4d3b',
        contactId: 'me',
        value: 'Then they decided to re-locate me after a month.',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 8 }).toISO(),
    },
    {
        id: '8d3c442b-62fa-496f-bffa-210ff5c1866b',
        contactId: 'me',
        value: 'It was a pain since we just settled in, house, kids’ school, etc.',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 8 }).toISO(),
    },
    {
        id: '3cf26ef0-e81f-4698-ac39-487454413332',
        contactId: 'me',
        value: 'So we moved again.',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 9 }).toISO(),
    },
    {
        id: '415151b9-9ee9-40a4-a4ad-2d88146bc71b',
        contactId: '',
        value: "It's crazy!",
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 9 }).toISO(),
    },
    {
        id: 'd6f29648-c85c-4dfb-a6ff-6b7ebc40c993',
        contactId: 'me',
        value: 'Then the virus happened, and we went remote after moving again.',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 10 }).toISO(),
    },
    {
        id: '5329c20d-6754-47ec-af8c-660c72be3528',
        contactId: 'me',
        value: "So we moved back to the first location, the third time!",
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 10 }).toISO(),
    },
    {
        id: '26f2ccbf-aef7-4b49-88df-f6b59381110a',
        contactId: '',
        value: "Ohh dude, that's tough in such a short period.",
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 11 }).toISO(),
    },
    {
        id: 'ea7662d5-7b72-4c19-ad6c-f80320541001',
        contactId: '',
        value: '😕',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 11 }).toISO(),
    },
    {
        id: '3a2d3a0e-839b-46e7-86ae-ca0826ecda7c',
        contactId: 'me',
        value: 'Thanks! It was great catching up.',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 11 }).toISO(),
    },
    {
        id: '562e3524-15b7-464a-bbf6-9b2582e5e0ee',
        contactId: '',
        value: 'Yeah! Let’s grab a coffee next week, remotely!',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 12 }).toISO(),
    },
    {
        id: '9269c775-bad5-46e1-b33b-2de8704ec1d6',
        contactId: 'me',
        value: 'Sure! See you next week!',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 12 }).toISO(),
    },
    {
        id: '779a27f2-bece-41c6-b9ca-c422570aee68',
        contactId: '',
        value: 'See you!',
        createdAt: now.minus({ week: 1 }).set({ hour: 19, minute: 12 }).toISO(),
    },
    {
        id: 'bab8ca0e-b8e5-4375-807b-1c91fca25a5d',
        contactId: 'me',
        value: 'Hey! Available now? Let’s grab that coffee, remotely! :)',
        createdAt: now.set({ hour: 12, minute: 45 }).toISO(),
    },
    {
        id: '8445a84d-599d-4e2d-a31c-5f4f29ad2b4c',
        contactId: '',
        value: 'Hi!',
        createdAt: now.set({ hour: 12, minute: 56 }).toISO(),
    },
    {
        id: '9f506742-50da-4350-af9d-61e53392fa08',
        contactId: '',
        value: "Sure! I'll call you in 5, okay?",
        createdAt: now.set({ hour: 12, minute: 56 }).toISO(),
    },
    {
        id: 'ca8523d8-faed-45f7-af09-f6bd5c3f3875',
        contactId: 'me',
        value: 'Awesome! Call me in 5 minutes.',
        createdAt: now.set({ hour: 12, minute: 58 }).toISO(),
    },
    {
        id: '39944b00-1ffe-4ffb-8ca6-13c292812e06',
        contactId: '',
        value: '👍🏻',
        createdAt: now.set({ hour: 13, minute: 0 }).toISO(),
    },
];
export const chats = [
    {
        id: 'ff6bc7f1-449a-4419-af62-b89ce6cae0aa',
        contactId: '9d3f0e7f-dcbd-4e56-a5e8-87b8154e9edf',
        unreadCount: 2,
        muted: false,
        lastMessage: 'See you tomorrow!',
        lastMessageAt: '26/04/2021',
    },
    {
        id: '4459a3f0-b65e-4df2-8c37-6ec72fcc4b31',
        contactId: '16b9e696-ea95-4dd8-86c4-3caf705a1dc6',
        unreadCount: 0,
        muted: false,
        lastMessage: 'See you tomorrow!',
        lastMessageAt: '26/04/2021',
    }
];
export const contacts = [
    {
        id: '16b9e696-ea95-4dd8-86c4-3caf705a1dc6',
        avatar: 'images/avatars/avatar-placeholder.png',
        name: 'Sali',
        about: "Hi there! I'm using AngorChat.",
        details: {
            emails: [
                {
                    email: 'nunezfaulkner@mail.tv',
                    label: 'Personal',
                },
            ],
            phoneNumbers: [
                {
                    country: 'xk',
                    phoneNumber: '909 552 3327',
                    label: 'Mobile',
                },
            ],
            title: 'Hotel Manager',
            company: 'Buzzopia',
            birthday: '1982-01-23T12:00:00.000Z',
            address: '614 Herkimer Court, Darrtown, Nebraska, PO9308',
        },
        attachments: _attachments,
    },
    {
        id: '9d3f0e7f-dcbd-4e56-a5e8-87b8154e9edf',
        avatar: 'images/avatars/avatar-placeholder.png',
        name: 'John',
        about: "Hi there! I'm using AngorChat.",
        details: {
            emails: [
                {
                    email: 'bernardlangley@mail.com',
                    label: 'Personal',
                },
                {
                    email: 'langley.bernard@boilcat.name',
                    label: 'Work',
                },
            ],
            phoneNumbers: [
                {
                    country: 'md',
                    phoneNumber: '893 548 2862',
                    label: 'Mobile',
                },
            ],
            title: 'Electromedical Equipment Technician',
            company: 'Boilcat',
            birthday: '1988-05-26T12:00:00.000Z',
            address: '943 Adler Place, Hamilton, South Dakota, PO5592',
        },
        attachments: _attachments,
    }
];
export const profile: any = {
    id: 'cfaad35d-07a3-4447-a6c3-d8c3d54fd5df',
    name: 'Username',
    email: 'username@angor.io',
    avatar: 'images/avatars/avatar-placeholder.png',
    about: "Hi there! I'm using AngorChat.",
};
