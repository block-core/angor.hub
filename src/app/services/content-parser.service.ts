import { Injectable } from '@angular/core';
import { SignerService } from './signer.service';



@Injectable({
  providedIn: 'root'
})
export class ContentParserService {

    constructor(
        private signerService: SignerService
    ) { }

}
