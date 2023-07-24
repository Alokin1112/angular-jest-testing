import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  @Input() text: string;
  @Input() type: 'success' | 'danger' | 'info' = 'success'

  get alertClass() {
    const classList = ['alert'];
    classList.push('alert-' + this.type);
    return classList.join(' ');
  }
}
