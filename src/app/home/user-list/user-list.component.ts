import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/core/user/user.service';
import { UserPage } from 'src/app/shared/types';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  page$: Observable<UserPage>;

  userService = inject(UserService)

  ngOnInit(): void {
    this.page$ = this.userService.loadUsers();
  }
}