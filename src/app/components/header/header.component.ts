import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Indicator } from '../../models/indicator.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input({ required: true }) title = '';
  @Input() indicators: readonly Indicator[] = [];
}
