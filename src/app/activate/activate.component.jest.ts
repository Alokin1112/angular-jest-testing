import { HttpClientModule } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { render, screen, waitFor } from '@testing-library/angular'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { Observable, Subscriber } from 'rxjs'
import { ActivateComponent } from 'src/app/activate/activate.component'
import { AlertComponent } from 'src/app/shared/alert/alert.component'
import { SharedModule } from 'src/app/shared/shared.module'

type RouteParams = {
  id: string,
}
let subscriber!: Subscriber<RouteParams>
const setup = async () => {
  const observable = new Observable<RouteParams>(sub => subscriber = sub)
  await render(ActivateComponent, {
    declarations: [ActivateComponent, AlertComponent],
    imports: [HttpClientModule, SharedModule],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          params: observable
        }
      }
    ]
  })
}
let counter = 0;
const server = setupServer(
  rest.post('/api/1.0/users/token/:token', (req, res, ctx) => {
    counter += 1;
    if (req.params['token'] === '456') {
      return res(ctx.status(400), ctx.json({}));
    }
    return res(ctx.status(200))
  })
);
beforeAll(() => server.listen())
afterAll(() => server.close)
beforeEach(() => {
  counter = 0;
  server.resetHandlers();
})


describe('Account activation Page', () => {
  it('sends account activation request', async () => {
    await setup();
    subscriber.next({ id: '123' });
    await waitFor(() => {
      expect(counter).toBe(1);
    })
  })

  it('displays activation success message when token is valid', async () => {
    await setup();
    subscriber.next({ id: '123' });
    const message = await screen.findByText('Account is activated');
    expect(message).toBeInTheDocument();
  })

  it('displays activation faikure message when token is invalid', async () => {
    await setup();
    subscriber.next({ id: '456' });
    const message = await screen.findByText('Activation failure');
    expect(message).toBeInTheDocument();
  })

  it('displays spinner during activation request', async () => {
    await setup();
    subscriber.next({ id: '456' });
    const spinner = await screen.findByTestId('spinner');
    await screen.findByText('Activation failure');
    expect(spinner).not.toBeInTheDocument();
  })
})