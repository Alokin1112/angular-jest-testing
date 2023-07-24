import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignUpComponent],
      imports: [
        HttpClientTestingModule,
        SharedModule,
        ReactiveFormsModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('has Sign Up header', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const h1 = signUp?.querySelector('h1');
      expect(h1?.textContent).toBe('Sign Up')
    })

    it('has username input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const label = signUp.querySelector('label[for="username"]');
      const input = signUp?.querySelector('input[id="username"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toBe("Username");
    })

    it('has email input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const label = signUp.querySelector('label[for="email"]');
      const input = signUp?.querySelector('input[id="email"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toBe("E-mail");
    })

    it('has password input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const label = signUp.querySelector('label[for="password"]');
      const input = signUp?.querySelector('input[id="password"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toBe("Password");
    })

    it('has password type for password input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const input = signUp?.querySelector('input[id="password"]') as HTMLInputElement;
      expect(input?.type).toBe('password')
    })

    it('has password repeat input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const label = signUp.querySelector('label[for="passwordRepeat"]');
      const input = signUp?.querySelector('input[id="passwordRepeat"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toBe("Repeat password");
    })

    it('has password type for password input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const input = signUp?.querySelector('input[id="passwordRepeat"]') as HTMLInputElement;
      expect(input?.type).toBe('password')
    })

    it('has Sign Up buttun', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const button = signUp?.querySelector('button') as HTMLButtonElement;
      expect(button?.textContent).toContain('Sign Up')
      expect(button?.type).toBe('submit')
    })

    it('disables buttun on init', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const button = signUp?.querySelector('button') as HTMLButtonElement;
      expect(button?.disabled).toBeTruthy()
    })
  })

  describe('Interactions', () => {

    let button: HTMLButtonElement;
    let http: HttpTestingController;
    let signUp: HTMLElement;

    const setupForm = async () => {
      http = TestBed.inject(HttpTestingController)
      signUp = fixture.nativeElement as HTMLElement;

      await fixture.whenStable();
      const passwordInput = signUp?.querySelector('input[id="password"]') as HTMLInputElement;
      const passwordRepeatInput = signUp?.querySelector('input[id="passwordRepeat"]') as HTMLInputElement;
      const username = signUp?.querySelector('input[id="username"]') as HTMLInputElement;
      const email = signUp?.querySelector('input[id="email"]') as HTMLInputElement;

      passwordInput.value = "Dawid123";
      passwordInput.dispatchEvent(new Event('input'))
      passwordRepeatInput.value = "Dawid123";
      passwordRepeatInput.dispatchEvent(new Event('input'))
      username.value = "UserName";
      username.dispatchEvent(new Event('input'))
      email.value = "email@test.pl";
      email.dispatchEvent(new Event('input'))
      email.dispatchEvent(new Event('blur'))
      fixture.detectChanges();
      button = signUp?.querySelector('button') as HTMLButtonElement;
    }

    it('Enables button when all fields are valid', async () => {
      await setupForm();
      fixture.detectChanges();
      const button = signUp?.querySelector('button') as HTMLButtonElement;
      expect(button?.disabled).toBeFalsy()
    })


    it('sends username, email, password and repeat password to backend after clicking the button', async () => {
      await setupForm();
      button?.click();
      const req = http.expectOne("/api/1.0/users")
      expect(req.request.body).toEqual({
        username: "UserName",
        email: "email@test.pl",
        password: "Dawid123"
      })
    })

    it('Disables button when there is an ongoing API call', async () => {
      await setupForm();
      button?.click();
      fixture.detectChanges();
      button.click();
      http.expectOne("/api/1.0/users");
      expect(button.disabled).toBeTruthy();
    })

    it("Displays spinner when api request is in progress", async () => {
      await setupForm();
      button?.click();
      fixture.detectChanges();
      expect(signUp.querySelector('span[role="status"]')).toBeTruthy()
    })

    it("Don't display spinner when api request is not in progress", async () => {
      await setupForm();
      fixture.detectChanges();
      expect(signUp.querySelector('span[role="status"]')).toBeFalsy()
    })

    it('displays account activation success notification after successful registration', async () => {
      await setupForm();
      expect(signUp.querySelector('.alert')).toBeFalsy();
      fixture.detectChanges();
      button.click();
      const req = http.expectOne("/api/1.0/users")
      req.flush({});
      fixture.detectChanges();
      const message = signUp.querySelector('.alert') as HTMLElement;
      expect(message?.textContent).toContain('Please check your e-mail to activate your account')
    })

    it('hides register form after succesfull registration', async () => {
      await setupForm();
      expect(signUp.querySelector('div[data-testid="form-signup"]')).toBeTruthy()
      fixture.detectChanges();
      button.click();
      const req = http.expectOne("/api/1.0/users")
      req.flush({});
      fixture.detectChanges();
      expect(signUp.querySelector('div[data-testid="form-signup"]')).toBeFalsy()
    })

    it('displays validation error coming from backend after submit failure', async () => {
      await setupForm();
      expect(signUp.querySelector('div[data-testid="form-signup"]')).toBeTruthy()
      fixture.detectChanges();
      button.click();
      const req = http.expectOne("/api/1.0/users")
      req.flush(
        {
          validationErrors: { email: 'Email in use' }
        },
        {
          status: 400, statusText: 'Bad Request'
        }
      );
      fixture.detectChanges();
      const validationElement = signUp.querySelector(`div[data-testid="email-validation"]`) as HTMLElement;
      expect(validationElement).toBeTruthy();
      expect(validationElement.textContent).toContain("Email in use");
    })
    it('hides spinner after sign up request fails', async () => {

      await setupForm();
      expect(signUp.querySelector('div[data-testid="form-signup"]')).toBeTruthy()
      fixture.detectChanges();
      button.click();
      const req = http.expectOne("/api/1.0/users")
      req.flush(
        {
          validationErrors: { email: 'Email in use' }
        },
        {
          status: 400, statusText: 'Bad Request'
        }
      );
      fixture.detectChanges();
      expect(signUp.querySelector('span[role="status"]')).toBeFalsy()
    })
  })
  describe('Validation', () => {

    const testCases = [
      { field: 'username', value: '', error: 'Username is required' },
      { field: 'username', value: '123', error: 'Username must be at least 4 chars long' },
      { field: 'email', value: '', error: 'Email is required' },
      { field: 'email', value: 'wrong-format', error: 'Invalid e-mail format' },
      { field: 'password', value: '', error: 'Password is required' },
      { field: 'password', value: 'wrong-pattern', error: 'Password should fit pattern' },
      { field: 'passwordRepeat', value: 'pass', error: 'Passwords missmatched' },
    ];

    testCases.forEach(({ field, value, error }) => {
      it(`displays '${error}' on field ${field} when value is ${value}`, () => {
        const signUp = fixture.nativeElement as HTMLElement;
        expect(signUp.querySelector(`div[data-testid="${field}-validation"]`)).toBeNull();
        const input = signUp?.querySelector(`input[id="${field}"]`) as HTMLInputElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        const validationElement = signUp.querySelector(`div[data-testid="${field}-validation"]`) as HTMLElement;
        expect(validationElement).toBeTruthy();
        expect(validationElement.textContent).toContain(error);
      })
    })

    it(`displays 'E-mail in use' when email is not unique`, () => {
      const http = TestBed.inject(HttpTestingController)
      const signUp = fixture.nativeElement as HTMLElement;
      expect(signUp.querySelector(`div[data-testid="email-validation"]`)).toBeNull();
      const input = signUp?.querySelector(`input[id="email"]`) as HTMLInputElement;
      input.value = 'non-unique-email@gmail.com';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      const req = http.expectOne(({ url, method, body }) => {
        return url === '/api/1.0/user/email' && method === "POST" ? body?.email === 'non-unique-email@gmail.com' : false;
      })
      req.flush({});
      fixture.detectChanges();
      const validationElement = signUp.querySelector(`div[data-testid="email-validation"]`) as HTMLElement;
      expect(validationElement).toBeTruthy();
      expect(validationElement.textContent).toContain("E-mail in use");
    })
  })
});
