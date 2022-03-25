import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeRefresher'
})
export class TimeRefresherPipe implements PipeTransform {
  // TODO: Add DateTime Pipe Here
  transform(time: string, _: any): string {
    return time;
  }
}
