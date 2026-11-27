import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button, Card } from 'ui-lib';
import { Modal } from '../../shared/modal/modal';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [Button, Card, Modal],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {

  readonly title = input.required<string>();

  readonly message = input.required<string>();

  readonly confirmLabel = input<string>('Eliminar');

  readonly confirmed = output<void>();

  readonly cancelled = output<void>();
}