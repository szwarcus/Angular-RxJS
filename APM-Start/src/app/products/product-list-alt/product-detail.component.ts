import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Supplier } from '../../suppliers/supplier';

import { ProductService } from '../product.service';
import { EMPTY, Subject, catchError } from 'rxjs';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private errorMessage = new Subject<string>();
  pageTitle = 'Product Detail';
  productSuppliers: Supplier[] | null = null;

  errorMessage$ = this.errorMessage.asObservable();

  product$ = this.productService.selectedProduct$.pipe(
    catchError(err => {
      this.errorMessage.next(err);

      return EMPTY;
    })
  )
  constructor(private productService: ProductService) { }

}
