import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Explorer } from './explorer/explorer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Explorer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
