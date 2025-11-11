import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArrayUtilsService {
  removeDuplicatesByName(images: any[]): any[] {
    console.log('removeDuplicates().');

    return images.filter(
      (item, index, array) => item.src && index === array.findIndex(item2 => item2.src === item.src)
    );
  }
}
