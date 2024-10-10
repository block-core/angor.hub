import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImageServiceService {
    constructor(private http: HttpClient) {}

    uploadImage(file: File | Blob): Observable<JSON> {
        // nostrimg
        // returns url of uploaded image
        let url = 'https://nostrimg.com/api/upload';
        const fd = new FormData();
        fd.append('image', file);
        // fd.append("submit", "Upload Image");
        return this.http.post<JSON>(url, fd);
    }

    // this is broken cuz something changed on server
    // not allowed accept from other clients not this
    uploadImageNostrBuild(file: File | Blob): Observable<string> {
        // returns url of uploaded image
        let url = 'https://nostrimg.com/api/upload';
        const fd = new FormData();
        fd.append('fileToUpload', file);
        // fd.append("submit", "Upload Image");
        return this.http.post<string>(url, fd);
    }
}
