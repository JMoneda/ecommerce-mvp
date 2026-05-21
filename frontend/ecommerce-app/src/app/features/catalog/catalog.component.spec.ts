import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CatalogComponent } from './catalog.component';
import { environment } from '../../../environments/environment';

describe('CatalogComponent', () => {
  let fixture: ComponentFixture<CatalogComponent>;
  let component: CatalogComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    const mockProducts = [
      { id: '1', code: 'TST-001', name: 'Test Shoe', description: 'Desc',
        imageUrl: '/img.jpg', size: 9, color: 'White', price: 100000, stock: 10, isAvailable: true }
    ];

    fixture.detectChanges();
    const req = httpMock.expectOne(r => r.url.includes('/products'));
    req.flush(mockProducts);

    expect(component.products().length).toBe(1);
    expect(component.products()[0].name).toBe('Test Shoe');
  });

  it('should show loading state initially', () => {
    expect(component.loading()).toBeTrue();
  });

  it('should set loading to false after products load', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(r => r.url.includes('/products'));
    req.flush([]);
    expect(component.loading()).toBeFalse();
  });

  it('should clear filters and reload', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/products')).flush([]);

    component.filterForm.patchValue({ name: 'Nike' });
    httpMock.expectOne(r => r.url.includes('/products')).flush([]);

    component.clearFilters();
    httpMock.expectOne(r => r.url.includes('/products')).flush([]);

    expect(component.filterForm.value.name).toBeFalsy();
  });
});
