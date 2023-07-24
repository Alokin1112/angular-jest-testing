import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { SignUpComponent } from 'src/app/sign-up/sign-up.component';
import { HomeComponent } from 'src/app/home/home.component';
import { Router } from '@angular/router';
import { routes } from 'src/app/router/app-router.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from 'src/app/login/login.component';
import { UserComponent } from 'src/app/user/user.component';
import { ActivateComponent } from 'src/app/activate/activate.component';
import { UserListComponent } from 'src/app/home/user-list/user-list.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        SignUpComponent,
        HomeComponent,
        LoginComponent,
        UserComponent,
        ActivateComponent,
        UserListComponent
      ],
      imports: [
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule,
        SharedModule,
        ReactiveFormsModule
      ],
    }).compileComponents();
  });

  let appComponent: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
    appComponent = fixture.nativeElement
  })

  describe('Routing', () => {
    const routingTests = [
      { path: '/', pageId: 'home-page' },
      { path: '/signup', pageId: 'signup-page' },
      { path: '/login', pageId: 'login-page' },
      { path: '/user/2', pageId: 'user-page' },
      { path: '/user/1', pageId: 'user-page' },
      { path: '/activate/123', pageId: 'activation-page' },
      { path: '/activate/123', pageId: 'activation-page' },
    ];
    routingTests.forEach(({ path, pageId }) => {
      it(`it displays ${pageId} at ${path}`, async () => {
        await router.navigate([path]);
        fixture.detectChanges();
        const page = appComponent.querySelector(`[data-testid="${pageId}"]`)
        expect(page).toBeTruthy();
      })
    })

    const linkTests = [
      { path: '/', title: 'Home' },
      { path: '/signup', title: 'Sign Up' },
      { path: '/login', title: 'Login' },
    ];

    linkTests.forEach(({ path, title }) => {
      it(`has link with title ${title} to ${path}`, () => {
        const linkElement = appComponent.querySelector(`a[title="${title}"]`) as HTMLAnchorElement;
        expect(linkElement.pathname).toEqual(path)
      })
    })

    const navigationTests = [
      {
        initialPath: '/',
        clickingTo: 'Sign Up',
        visiblePage: 'signup-page'
      },
      {
        initialPath: '/signup',
        clickingTo: 'Home',
        visiblePage: 'home-page'
      },
      {
        initialPath: '/',
        clickingTo: 'Login',
        visiblePage: 'login-page'
      }
    ];

    navigationTests.forEach(({ clickingTo, initialPath, visiblePage }) => {
      it(`displays ${visiblePage} after clicking ${clickingTo} from ${initialPath}`, fakeAsync(async () => {
        await router.navigate([initialPath]);
        const linkElement = appComponent.querySelector(`a[title="${clickingTo}"]`) as HTMLAnchorElement;
        linkElement.click();
        tick();
        fixture.detectChanges();
        const page = appComponent.querySelector(`[data-testid="${visiblePage}"]`)
        expect(page).toBeTruthy();
      }))
    })
  })
});
