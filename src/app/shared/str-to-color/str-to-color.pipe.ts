import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'strToColor'
})
export class StrToColorPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
