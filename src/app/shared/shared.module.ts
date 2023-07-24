import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AlertComponent } from 'src/app/shared/alert/alert.component';
import { ButtonComponent } from 'src/app/shared/button/button.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AlertComponent,
    ButtonComponent,
    NavbarComponent,
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    AlertComponent,
    ButtonComponent,
    NavbarComponent
  ]
})
export class SharedModule { }
