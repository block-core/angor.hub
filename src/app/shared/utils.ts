 import { User } from 'app/types/user';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export function range(start: number, end: number) {
    return [...Array(1 + end - start).keys()].map((v) => start + v);
}

export function ellipsis(value: string): string {
     if (value.length < 40) return value;
    let third: number = value.length / 8;
    let finalThird: number = value.length - third;
    return value.substring(0, third) + ':' + value.substring(finalThird);
}

export function humantime(value: number): string {
    let date = new Date(value * 1000);
    return dayjs(date).fromNow();
}

export class Paginator {
    previousUntil: number | null;
    previousSince: number | null;
    until: number = 0;
    since: number = 0;
    baseTimeDiff: number;
    originalBaseTimeDiff: number;
    constructor(
        until: number = 0,
        since: number = 0,
        baseTimeDiff: number = 15
    ) {
        this.until = until;
        this.setDefaultUntil();
        this.baseTimeDiff = baseTimeDiff;
        this.originalBaseTimeDiff = this.baseTimeDiff;
        if (since === 0) {
            this.setDefaultSince();
        } else {
            this.setDefaultSince(since);
        }
        this.previousSince = since;
        this.previousUntil = until;
    }



    incrementUserTimes(users: User[]): void {
        const oldestPost = users.at(-1);
        if (oldestPost) {
            this.revertBackToOriginalBaseTimeDiff();
            this.setUntil(oldestPost.createdAt);
            this.setSince(oldestPost.createdAt);
        } else {

            this.updateBaseTimeToFindPosts();
            this.setDefaultUntil();

            this.setDefaultSince();
        }
    }

    resetFilterTimes(newBaseTimeDiff: number = 0): void {
        this.setDefaultSince();
        this.setDefaultUntil();
        if (newBaseTimeDiff !== 0) {
            this.baseTimeDiff = newBaseTimeDiff;
        }
    }

    updateBaseTimeToFindPosts() {
        this.baseTimeDiff = this.baseTimeDiff * 10;
    }

    revertBackToOriginalBaseTimeDiff() {

        this.baseTimeDiff = this.originalBaseTimeDiff;
    }

    getSinceAsDate(): Date {
        return new Date(this.since * 1000);
    }

    getUntilAsDate(): Date {
        return new Date(this.until * 1000);
    }

    getSinceFromNow(): string {
        const sinceDate = this.getSinceAsDate();
        return dayjs(sinceDate).fromNow();
    }

    getUntilFromNow(): string {
        const untilDate = this.getSinceAsDate();
        return dayjs(untilDate).fromNow();
    }

    printTimes(): void {
        const diff =
            this.getUntilAsDate().getTime() - this.getSinceAsDate().getTime();
        console.log(
            `Until: ${this.getUntilFromNow()} | Since: ${this.getSinceFromNow()}`
        );
        console.log(`Diff: ${diff}`);
    }

    printVars(): void {
        console.log(`Until: ${this.until}`);
        console.log(`Since: ${this.since}`);
        console.log(`baseTimeDiff: ${this.baseTimeDiff}`);
    }

    private setDefaultSince(addedMinutes: number = 0): void {

        let now = new Date();
        const sinceDate = Math.floor(
            now.setMinutes(
                now.getMinutes() - this.baseTimeDiff - addedMinutes
            ) / 1000
        );
        this.since = sinceDate;
    }

    private setDefaultUntil(): void {
        this.until = Math.floor(Date.now() / 1000);
    }

    private getNewSince(createdAt: number, addedMinutes: number = 0): number {
        const now = new Date(createdAt * 1000);
        return Math.floor(
            now.setMinutes(
                now.getMinutes() - this.baseTimeDiff - addedMinutes
            ) / 1000
        );
    }

    private setUntil(createdAt: number): void {
        this.previousUntil = this.until - 2 * 1000;
        this.until = createdAt;
    }

    private setSince(createdAt: number, addedMinutes: number = 0): void {
        this.previousSince = this.since;
        this.since = this.getNewSince(createdAt, addedMinutes);
    }
}
