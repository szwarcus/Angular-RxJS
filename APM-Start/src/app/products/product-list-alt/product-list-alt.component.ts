import { Component, OnInit, OnDestroy } from '@angular/core';

import { BehaviorSubject, EMPTY, Subject, Subscription, catchError } from 'rxjs';

import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  selectedProductId = 0;
  private errorMessage = new Subject<string>();

  errorMessage$ = this.errorMessage.asObservable();

  products$ = this.productService.productsWithCategories$
    .pipe(
      catchError(err => {
        this.errorMessage.next(err);
        return EMPTY;
      })
    )

    selectedProduct$ = this.productService.productSelectedSubject$.pipe(
      catchError(err => {
        this.errorMessage.next(err);
        return EMPTY;
      })
    )

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.changeSelectedProduct(productId);
  }
}
