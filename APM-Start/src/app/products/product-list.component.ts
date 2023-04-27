import { ProductCategoryService } from "./../product-categories/product-category.service";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { BehaviorSubject, catchError, combineLatest, EMPTY, filter, map, Subject } from "rxjs";
import { ProductService } from "./product.service";

@Component({
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = "Product List";
  private errorMessage = new Subject<string>();
  private categorySelectedSubject = new BehaviorSubject<number>(0);

  errorMessage$ = this.errorMessage.asObservable();
  categorySelectedSubject$ = this.categorySelectedSubject.asObservable();

  categories$ = this.productCategoryService.$categories.pipe(
    catchError((err) => {
      this.errorMessage.next(err);

      return EMPTY;
    })
  );

  products$ = combineLatest([
    this.productService.productsWithAdd$, 
    this.categorySelectedSubject$])
    .pipe(
      map(([products, selectedCategoryId]) => 
      products.filter(product => 
      (selectedCategoryId ? product.categoryId === selectedCategoryId : true))),

    catchError((err) => {
      this.errorMessage.next(err);

      return EMPTY;
    })
  );

  constructor(private productService: ProductService, private productCategoryService: ProductCategoryService) {}

  onAdd(): void {
    this.productService.onAdd();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
