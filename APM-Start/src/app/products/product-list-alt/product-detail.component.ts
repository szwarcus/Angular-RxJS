import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Supplier } from '../../suppliers/supplier';

import { ProductService } from '../product.service';
import { EMPTY, Subject, catchError, combineLatest, filter, map } from 'rxjs';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private errorMessage = new Subject<string>();


  errorMessage$ = this.errorMessage.asObservable();

  product$ = this.productService.selectedProduct$.pipe(
    catchError(err => {
      this.errorMessage.next(err);

      return EMPTY;
    })
  );

  pageTitle$ = this.product$
  .pipe(
    map(product => product ? `Product Detail for: ${product.productName} `: null)
  );

  productSuppliers$ =  this.productService.selectedProductWithSuppliers$.pipe(
    catchError(err => {
      this.errorMessage.next(err);
      return EMPTY;
    })
  );

  vm$ = combineLatest([this.product$, this.productSuppliers$, this.pageTitle$]).pipe(
    filter(([product]) => Boolean(product)),
    map(([product, productSuppliers, pageTitle]) =>
    ({product, productSuppliers, pageTitle})
    )
  );
  
  constructor(private productService: ProductService) { }
}
