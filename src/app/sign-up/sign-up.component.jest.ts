import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SharedModule } from 'src/app/shared/shared.module';
import "whatwg-fetch";
import { SignUpComponent } from './sign-up.component';

interface UniqueEmailCheck {
  email: string,
}

const setup = async () => {
  await render(SignUpComponent, {
    declarations: [
      SignUpComponent,
    ],
    imports: [
      HttpClientModule,
      SharedModule,
      ReactiveFormsModule
    ],
  });
}
let requestBody: any;
let counter = 0;
const server = setupServer(
  rest.post("/api/1.0/users", async (req, res, ctx) => {
    requestBody = req.body;
    counter += 1;
    if (requestBody?.email === "not-unique-email@mail.com")
      return res(ctx.status(400), ctx.json({
        validationErrors: { email: 'Email in use' }
      },))
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.post("/api/1.0/user/email", async (req, res, ctx) => {
    requestBody = req.body as UniqueEmailCheck;
    if (requestBody?.email === 'not-unique@gmail.com')
      return res(ctx.status(200), ctx.json({}))
    return res(ctx.status(404))
  })
);
beforeAll(() => server.listen())
afterAll(() => server.close)
beforeEach(() => {
  counter = 0;
  server.resetHandlers();
})

describe('SignUpComponent', () => {

  describe('Layout', () => {
    it('has Sign Up header', async () => {
      await setup();
      const header = screen.getByRole('heading', { name: 'Sign Up' })
      expect(header).toBeInTheDocument();
    })

    it('has username input', async () => {
      await setup();
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument()
    })

    it('has email input', async () => {
      await setup();
      const input = screen.getByLabelText('E-mail');
      expect(input).toBeInTheDocument()
    })

    it('has password input', async () => {
      await setup();
      const input = screen.getByLabelText('Password');
      expect(input).toBeInTheDocument()
    })

    it('has repeat password input', async () => {
      await setup();
      const input = screen.getByLabelText('Repeat password');
      expect(input).toBeInTheDocument()
    })

    it('has password type for password input', async () => {
      await setup();
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password')
    })

    it('has password repeat type for password input', async () => {
      await setup();
      const input = screen.getByLabelText('Repeat password');
      expect(input).toHaveAttribute('type', 'password')
    })

    it('has Sign Up button', async () => {
      await setup();
      const button = screen.getByRole('button', { name: 'Sign Up' })
      expect(button).toBeInTheDocument();
    })

    it('Sign Up button disabled at start', async () => {
      await setup();
      const button = screen.getByRole('button', { name: 'Sign Up' })
      expect(button).toBeDisabled();
    })
  })

  describe('Interactions', () => {

    let button: HTMLElement;

    const setupForm = async (data?: { email: string }) => {
      const passwordInput = screen.getByLabelText('Password');
      const passwordRepeatInput = screen.getByLabelText('Repeat password');
      const usernameInput = screen.getByLabelText('Username');
      const emailInput = screen.getByLabelText('E-mail');

      await userEvent.type(usernameInput, "UserName");
      await userEvent.type(emailInput, data?.email || 'default-mail@gmail.pl');
      await userEvent.type(passwordInput, "Dawid123");
      await userEvent.type(passwordRepeatInput, "Dawid123");

      button = screen.getByRole('button', { name: 'Sign Up' })
    }

    it('Enables button when all fields have valid inputs', async () => {
      await setup();
      await setupForm();
      expect(button).toBeEnabled();
    })

    it('sends username, email, password and repeat password to backend after clicking the button', async () => {
      await setup();
      await setupForm();
      await userEvent.click(button);

      await waitFor(() => {
        expect(requestBody).toEqual({
          username: "UserName",
          email: 'default-mail@gmail.pl',
          password: "Dawid123"
        })
      })
    })

    it('Disables button after Api request click', async () => {
      await setup();
      await setupForm();
      expect(button).toBeEnabled();
      await userEvent.click(button);
      expect(button).toBeDisabled();
    })

    it('Disables button after Api request click', async () => {
      await setup();
      await setupForm();
      expect(button).toBeEnabled();
      await userEvent.click(button);
      await userEvent.click(button);
      expect(button).toBeDisabled();
    })

    it('Displays spinner after Api request click', async () => {
      await setup();
      await setupForm();
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
      await userEvent.click(button);
      expect(screen.queryByRole('status', { hidden: true })).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      })
    })

    it('displays account activation success notification after successful registration', async () => {
      await setup();
      await setupForm();
      expect(screen.queryByText('Please check your e-mail to activate your account')).not.toBeInTheDocument();
      await userEvent.click(button);
      const text = await screen.findByText('Please check your e-mail to activate your account')
      expect(text).toBeInTheDocument();
    })
    it('hides register form after succesfull registration', async () => {
      await setup();
      await setupForm();
      const form = screen.queryByTestId('form-signup')
      expect(form).toBeInTheDocument();
      await userEvent.click(button);
      await waitFor(() => {
        expect(form).not.toBeInTheDocument();
      })
    })
    it('displays validation error coming from backend after submit failure', async () => {
      await setup();
      await setupForm({ email: 'not-unique-email@mail.com' });
      await userEvent.click(button);
      const errorMessage = await screen.findByText(
        'Email in use'
      )
      expect(errorMessage).toBeInTheDocument();
    })

    it('hides spinner after sign up request fails', async () => {
      await setup();
      await setupForm({ email: 'not-unique-email@mail.com' });
      await userEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      })
    })
  })

  describe('Validation', () => {

    const testCases = [
      { field: 'username', value: '', error: 'Username is required' },
      { field: 'username', value: '123', error: 'Username must be at least 4 chars long' },
    ];
    it.each`
    label                 | inputValue  | message
    ${'Username'}         | ${'{space}{backspace}'}       | ${'Username is required'}
    ${'Username'}         | ${'123'}                      | ${'Username must be at least 4 chars long'}
    ${'E-mail'}           | ${'{space}{backspace}'}       | ${'Email is required'}
    ${'E-mail'}           | ${'wrong-format'}             | ${'Invalid e-mail format'}
    ${'E-mail'}           | ${'not-unique@gmail.com'}     | ${'E-mail in use'}
    ${'Password'}         | ${'{space}{backspace}'}       | ${'Password is required'}
    ${'Password'}         | ${'wrong-pattern'}            | ${'Password should fit pattern'}
    ${'Repeat password'}  | ${'wrong'}                    | ${'Passwords missmatched'}
    `('displays $message when $label has the $inputValue', async ({ label, inputValue, message }) => {
      await setup();
      expect(screen.queryByText(message)).not.toBeInTheDocument();
      const input = screen.getByLabelText(label);
      await userEvent.type(input, inputValue);
      await userEvent.tab();
      const errorMessage = await screen.findByText(message);
      expect(errorMessage).toBeInTheDocument();
    })
  })
})
