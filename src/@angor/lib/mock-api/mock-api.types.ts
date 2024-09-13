import { HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AngorMockApiReplyCallback =
    | ((data: {
          request: HttpRequest<any>;
          urlParams: { [key: string]: string };
      }) => [number, string | any] | Observable<any>)
    | undefined;

export type AngorMockApiMethods =
    | 'get'
    | 'post'
    | 'patch'
    | 'delete'
    | 'put'
    | 'head'
    | 'jsonp'
    | 'options';
