import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkmessage', standalone: true 
})
export class CheckmessagePipe implements PipeTransform {

  transform(value: string): string {

    const imageRegex = /\.(jpeg|jpg|gif|png|bmp|svg|webp|tiff)$/i;
    const videoRegex = /\.(mp4|mov|avi|mkv|webm|flv|wmv|mpeg|3gp)$/i;
    const audioRegex = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;
    const pdfRegex = /\.pdf$/i;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const vimeoRegex = /https?:\/\/(www\.)?vimeo.com\/(\d+)/;
    const instagramRegex = /https?:\/\/(www\.)?instagram.com\/p\/[a-zA-Z0-9_-]+/;
    const twitterRegex = /https?:\/\/(www\.)?twitter.com\/[a-zA-Z0-9_]+\/status\/[0-9]+/;
    const urlRegex = /(https?:\/\/[^\s]+)/;

    if (imageRegex.test(value)) {
      return 'image';
    }
    if (videoRegex.test(value)) {
      return 'video';
    }
    if (audioRegex.test(value)) {
      return 'audio';
    }
    if (pdfRegex.test(value)) {
      return 'pdf';
    }
    if (youtubeRegex.test(value)) {
      return 'youtube';
    }
    if (vimeoRegex.test(value)) {
      return 'vimeo';
    }
    if (instagramRegex.test(value)) {
      return 'instagram';
    }
    if (twitterRegex.test(value)) {
      return 'twitter';
    }
    if (urlRegex.test(value)) {
      return 'url';
    }

     return value;
  }
}
