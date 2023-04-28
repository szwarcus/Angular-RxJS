import { BehaviorSubject, Observable, Subject, catchError, combineLatest, map, merge, scan, shareReplay, tap, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

import { Injectable } from "@angular/core";
import { Product } from "./product";
import { ProductCategoryService } from "../product-categories/product-category.service";
import { SupplierService } from '../suppliers/supplier.service';

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private productsUrl = "api/products";
  private suppliersUrl = "api/suppliers";
  private productSelectedSubject = new BehaviorSubject<number>(0);
  private productCreatedSubject = new Subject<Product>()

  productCreatedSubject$ = this.productCreatedSubject.asObservable();

  productSelectedSubject$ = this.productSelectedSubject.asObservable();

  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap((data) => console.log("Products: ", JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCategories$ = combineLatest([this.products$, this.productCategoryService.categories$]).pipe(
    map(([products, categories]) =>
      products.map(
        (product) =>
          ({
            ...product,
            price: product.price ? product.price * 1.5 : 0,
            category: categories.find((c) => product.categoryId === c.id)?.name,
            searchKey: [product.productName],
          } as Product)
      )
    ),
    shareReplay(1)
  );

  selectedProduct$ = combineLatest([this.productsWithCategories$, this.productSelectedSubject$]).pipe(
    map(([products, selectedProductId])=>products.find(product=>product.id===selectedProductId)));

    productsWithAdd$ = merge(
      this.productsWithCategories$,
      this.productCreatedSubject$
    ).pipe(
      scan((acc,value)=>
      (value instanceof Array)? [...value] : [...acc, value], [] as Product[])
    );
    
  constructor(private http: HttpClient,
     private productCategoryService: ProductCategoryService, 
     private supplierService : SupplierService) {}
     
  changeSelectedProduct(productId:number){
    this.productSelectedSubject.next(productId);
  }

  onAdd(){
    this.productCreatedSubject.next(this.fakeProduct());
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: "Another One",
      productCode: "TBX-0042",
      description: "Our new product",
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30,
    };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }
}
