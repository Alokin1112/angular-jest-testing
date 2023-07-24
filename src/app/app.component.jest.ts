import { HttpClientModule } from '@angular/common/http'
import { ReactiveFormsModule } from '@angular/forms'
import { render, screen } from '@testing-library/angular'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { ActivateComponent } from 'src/app/activate/activate.component'
import { AppComponent } from 'src/app/app.component'
import { HomeComponent } from 'src/app/home/home.component'
import { UserListComponent } from 'src/app/home/user-list/user-list.component'
import { LoginComponent } from 'src/app/login/login.component'
import { routes } from 'src/app/router/app-router.module'
import { SharedModule } from 'src/app/shared/shared.module'
import { SignUpComponent } from 'src/app/sign-up/sign-up.component'
import { UserComponent } from 'src/app/user/user.component'

let counter = 0;
const server = setupServer(
  rest.post('/api/1.0/users/token/:token', (req, res, ctx) => {
    counter += 1;
    if (req.params['token'] === '456') {
      return res(ctx.status(400), ctx.json({}));
    }
    return res(ctx.status(200))
  }),
  rest.get('/api/1.0/users', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
      "content": [
        { "id": 1, "username": "user1", "email": "user1@mail.com" },
        { "id": 2, "username": "user2", "email": "user2@mail.com" },
        { "id": 3, "username": "user3", "email": "user3@mail.com" },
      ],
      "page": 0,
      "size": 3,
      "totalPages": 5
    }))
  })
);
beforeAll(() => server.listen())
afterAll(() => server.close)
beforeEach(() => {
  counter = 0;
  server.resetHandlers();
})

const setup = async (path: string) => {
  const { navigate } = await render(AppComponent, {
    declarations: [HomeComponent, SignUpComponent, LoginComponent,
      UserComponent, ActivateComponent, UserListComponent],
    imports: [HttpClientModule, SharedModule, ReactiveFormsModule],
    routes: routes
  })
  await navigate(path)
}

describe('Routing', () => {

  it.each`
    path         | page
    ${'/'}       | ${"home-page"}
    ${'/signup'} | ${'signup-page'}
    ${'/login'}  | ${'login-page'}
    ${'/user/1'}  | ${'user-page'}
    ${'/user/2'}  | ${'user-page'}
    ${'/activate/1'}  | ${'activation-page'}
    ${'/activate/2'}  | ${'activation-page'}
  `('displays $page when path is $path', async ({ path, page }) => {
    await setup(path);
    const pageRender = screen.queryByTestId(page);
    expect(pageRender).toBeInTheDocument();
  })

  it.each`
    path  | title
    ${'/'}| ${'Home'}
    ${'/signup'}| ${'Sign Up'}
    ${'/login'}| ${'Login'}
  `('has link with title $title to path $path', async ({ path, title }) => {
    await setup(path);
    const link = screen.queryByRole('link', { name: title });
    expect(link).toBeInTheDocument();
  })

  it.each`
    visiblePage | clickingTo  | initialPath
    ${'signup-page'} | ${'Sign Up'} | ${'/'}
    ${'home-page'} | ${'Home'} | ${'/signup'}
    ${'login-page'} | ${'Login'} | ${'/'}
  `(`displays $visiblePage after clicking $clickingTo from $initialPath`, async ({ visiblePage, clickingTo, initialPath }) => {
    await setup(initialPath);
    const link = screen.getByRole('link', { name: clickingTo });
    await userEvent.click(link);
    const page = await screen.findByTestId(visiblePage);
    expect(page).toBeInTheDocument();
  })

})