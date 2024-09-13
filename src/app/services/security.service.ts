import { Injectable } from '@angular/core';
import { base64 } from '@scure/base';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  private async getPasswordKey(password: string): Promise<CryptoKey> {
    return window.crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
  }

  private async deriveKey(
    passwordKey: CryptoKey,
    salt: Uint8Array,
    keyUsage: KeyUsage[]
  ): Promise<CryptoKey> {
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 250000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      keyUsage
    );
  }

  async encryptData(secretData: string, password: string): Promise<string> {
    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const passwordKey = await this.getPasswordKey(password);
      const aesKey = await this.deriveKey(passwordKey, salt, ['encrypt']);

      const encryptedContent = new Uint8Array(
        await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv },
          aesKey,
          this.encoder.encode(secretData)
        )
      );

      const encryptedData = new Uint8Array(salt.length + iv.length + encryptedContent.length);
      encryptedData.set(salt, 0);
      encryptedData.set(iv, salt.length);
      encryptedData.set(encryptedContent, salt.length + iv.length);

      return base64.encode(encryptedData);
    } catch (e) {
      console.error('Encryption failed:', e);
      throw new Error('Failed to encrypt data.');
    }
  }

  async decryptData(encryptedData: string, password: string): Promise<string> {
    try {
      const encryptedDataBuff = base64.decode(encryptedData);

      const salt = encryptedDataBuff.slice(0, 16);
      const iv = encryptedDataBuff.slice(16, 28);
      const data = encryptedDataBuff.slice(28);

      const passwordKey = await this.getPasswordKey(password);
      const aesKey = await this.deriveKey(passwordKey, salt, ['decrypt']);

      const decryptedContent = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        data
      );

      return this.decoder.decode(decryptedContent);
    } catch (e) {
      console.error('Decryption failed:', e);
      throw new Error('Failed to decrypt data.');
    }
  }
}
