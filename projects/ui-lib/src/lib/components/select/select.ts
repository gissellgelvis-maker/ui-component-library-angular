import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

/** Opción que se muestra y se emite en el select. */
export interface SelectOption {
  /** Texto visible de la opción. */
  label: string;
  /** Valor que se guarda al seleccionarla. */
  value: string;
}

/** Contador para generar un id único por instancia (une el label con el select). */
let nextId = 0;

/**
 * Select con etiqueta, placeholder, estado de carga y two-way binding del valor.
 *
 * @example
 * <ui-select
 *   label="Recurso"
 *   [options]="options"
 *   [(value)]="selected"
 *   (selectionChange)="onChange($event)"
 * />
 */
@Component({
  selector: 'ui-select',
  templateUrl: './select.html',
  styleUrl: './select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select {
  /** Lista de opciones disponibles. */
  readonly options = input<SelectOption[]>([]);

  /** Etiqueta visible sobre el select. */
  readonly label = input<string>('');

  /** Texto que se muestra cuando no hay selección. */
  readonly placeholder = input<string>('Selecciona una opción');

  /** Muestra un skeleton en lugar del select mientras se cargan las opciones. */
  readonly loading = input<boolean>(false);

  /** Bloquea la interacción cuando es `true`. */
  readonly disabled = input<boolean>(false);

  /** Valor seleccionado. Admite two-way binding con `[(value)]`; `null` significa sin selección. */
  readonly value = model<string | null>(null);

  /** Se emite con el objeto completo de la opción cada vez que el usuario cambia la selección. */
  readonly selectionChange = output<SelectOption>();

  /** Id único de esta instancia, usado para asociar el label con el select. */
  protected readonly selectId = `ui-select-${nextId++}`;

  /** Maneja el cambio nativo: actualiza el modelo y emite la opción completa. */
  protected onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const option = this.options().find((o) => o.value === target.value);
    if (!option) {
      return;
    }
    this.value.set(option.value);
    this.selectionChange.emit(option);
  }
}