/* eslint-disable */
import { DateTime } from 'luxon';

/* Retrieve the current date and time */
const currentMoment = DateTime.now();

export const notifications = [
    {
        id: '493190c9-5b61-4912-afe5-78c21f1044d7',
        icon: 'heroicons_mini:star',
        title: 'Daily Challenges',
        description: 'Your submission has been approved',
        time: currentMoment.minus({ minute: 25 }).toISO(), // 25 minutes ago
        read: false,
    },
    {
        id: '6e3e97e5-effc-4fb7-b730-52a151f0b641',
        image: 'images/avatars/avatar-placeholder.png',
        description:
            '<strong>Leo Gill</strong> has added you to the <em>Top Secret Project</em> group and assigned you as the <em>Project Manager</em>',
        time: currentMoment.minus({ minute: 50 }).toISO(), // 50 minutes ago
        read: true,
        link: '/dashboards/project',
        useRouter: true,
    },
    {
        id: 'b91ccb58-b06c-413b-b389-87010e03a120',
        icon: 'heroicons_mini:envelope',
        title: 'Mailbox',
        description: 'You have 15 unread emails across 3 mailboxes',
        time: currentMoment.minus({ hour: 3 }).toISO(), // 3 hours ago
        read: false,
        link: '/dashboards/project',
        useRouter: true,
    },
    {
        id: '541416c9-84a7-408a-8d74-27a43c38d797',
        icon: 'heroicons_mini:arrow-path',
        title: 'Cron Jobs',
        description: 'Your <em>Docker container</em> is ready for publishing',
        time: currentMoment.minus({ hour: 5 }).toISO(), // 5 hours ago
        read: false,
        link: '/dashboards/project',
        useRouter: true,
    },
    {
        id: 'ef7b95a7-8e8b-4616-9619-130d9533add9',
        image: 'images/avatars/avatar-placeholder.png',
        description:
            '<strong>Roger Murray</strong> has accepted your friend request',
        time: currentMoment.minus({ hour: 7 }).toISO(), // 7 hours ago
        read: true,
        link: '/dashboards/project',
        useRouter: true,
    },
    {
        id: 'eb8aa470-635e-461d-88e1-23d9ea2a5665',
        image: 'images/avatars/avatar-placeholder.png',
        description: '<strong>Sophie Stone</strong> sent you a direct message',
        time: currentMoment.minus({ hour: 9 }).toISO(), // 9 hours ago
        read: true,
        link: '/dashboards/project',
        useRouter: true,
    },
    {
        id: 'b85c2338-cc98-4140-bbf8-c226ce4e395e',
        icon: 'heroicons_mini:envelope',
        title: 'Mailbox',
        description: 'You have 3 new unread emails',
        time: currentMoment.minus({ day: 1 }).toISO(), // 1 day ago
        read: true,
        link: '/dashboards/project',
        useRouter: true,
    },
    {
        id: '8f8e1bf9-4661-4939-9e43-390957b60f42',
        icon: 'heroicons_mini:star',
        title: 'Daily Challenges',
        description:
            'Your submission has been accepted, and you can now sign up for the final assignment, which will be available in 2 days',
        time: currentMoment.minus({ day: 3 }).toISO(), // 3 days ago
        read: true,
        link: '/dashboards/project',
        useRouter: true,
    },
    {
        id: '30af917b-7a6a-45d1-822f-9e7ad7f8bf69',
        icon: 'heroicons_mini:arrow-path',
        title: 'Cron Jobs',
        description: 'Your Vagrant container is ready for download',
        time: currentMoment.minus({ day: 4 }).toISO(), // 4 days ago
        read: true,
        link: '/dashboards/project',
        useRouter: true,
    },
];
