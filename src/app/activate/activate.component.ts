import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { UserService } from 'src/app/core/user/user.service';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styles: [
  ]
})
export class ActivateComponent implements OnInit {

  activationStatus!: 'success' | 'failure';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      map((params) => params['id']),
      switchMap((id) => this.userService.activate(id))
    ).subscribe({
      next: () => {
        this.activationStatus = 'success';
      },
      error: () => {
        this.activationStatus = 'failure';
      }
    })
  }
}
