import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateComponent } from './activate.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscribable, Subscriber, of } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';
import { AlertComponent } from 'src/app/shared/alert/alert.component';

type RouteParams = {
  id: string,
}


describe('ActivateComponent', () => {
  let component: ActivateComponent;
  let fixture: ComponentFixture<ActivateComponent>;
  let http: HttpTestingController
  let subscriber!: Subscriber<RouteParams>
  const observable = new Observable<RouteParams>(sub => subscriber = sub)

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivateComponent, AlertComponent],
      imports: [HttpClientTestingModule, SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: observable
          }
        }
      ]
    })
      .compileComponents();
    http = TestBed.inject(HttpTestingController)
    fixture = TestBed.createComponent(ActivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sends account activation request', () => {
    subscriber.next({ id: '123' });
    const request = http.match('/api/1.0/users/token/123');
    expect(request.length).toBe(1);
  })

  it('displays activation success message when token is valid', () => {
    subscriber.next({ id: '123' });
    const request = http.expectOne('/api/1.0/users/token/123');
    request.flush({});
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('.alert');
    expect(alert.textContent).toContain('Account is activated');
  })

  it('displays activation faikure message when token is invalid', () => {
    subscriber.next({ id: '456' });
    const request = http.expectOne('/api/1.0/users/token/456');
    request.flush({}, { status: 400, statusText: 'Bad request' });
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('.alert');
    expect(alert.textContent).toContain('Activation failure');
  })
  it('displays spinner during activation request', () => {
    subscriber.next({ id: '123' });
    const request = http.expectOne('/api/1.0/users/token/123');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span[role="status"]')).toBeTruthy()
    request.flush({});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span[role="status"]')).toBeFalsy()
  })
});
