import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '../button/button';

export type KeysOfUnion<T> = T extends unknown ? keyof T : never;
/** Definición de una columna de la tabla para filas de tipo `T`. */
export interface TableColumn<T> {
  /** Propiedad de la fila que se muestra en esta columna. */
  key: KeysOfUnion<T> & string;
  /** Texto del encabezado de la columna. */
  header: string;
  /** Formateador opcional para valores que no son texto simple (objetos, fechas, listas). */
  format?: (row: T) => string;
}

/** Acciones que la tabla puede emitir. */
export type TableActionType = 'view' | 'delete';

/** Evento emitido al pulsar un botón de acción de una fila. */
export interface TableAction<T> {
  /** Acción pulsada. */
  action: TableActionType;
  /** Fila sobre la que se pulsó. */
  row: T;
}

/**
 * Tabla genérica: no conoce el dominio de los datos, solo renderiza columnas y emite acciones.
 * El componente padre decide qué hacer con cada acción.
 *
 * @example
 * <ui-table
 *   [columns]="columns"
 *   [rows]="characters()"
 *   [loading]="isLoading()"
 *   [errorMessage]="error()"
 *   (actionTriggered)="onAction($event)"
 * />
 */
@Component({
  selector: 'ui-table',
  imports: [Button],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table<T extends object> {
  /** Definición de las columnas a mostrar. */
  readonly columns = input<TableColumn<T>[]>([]);

  /** Filas a renderizar. */
  readonly rows = input<T[]>([]);

  /** Muestra filas skeleton en lugar de los datos mientras es `true`. */
  readonly loading = input<boolean>(false);

  /** Mensaje que se muestra cuando no hay filas. */
  readonly emptyMessage = input<string>('No hay resultados para mostrar');

  /** Mensaje de error de red. Si no es `null`, reemplaza a los datos. */
  readonly errorMessage = input<string | null>(null);

  /** Se emite al pulsar "Ver" o "Eliminar" en una fila. */
  readonly actionTriggered = output<TableAction<T>>();

  /** Cantidad de filas skeleton mostradas durante la carga. */
  protected readonly skeletonRows = [0, 1, 2, 3, 4];

  /** Devuelve el texto de una celda: usa `format` si existe; si no, el valor como texto. */
  protected cellValue(row: T, column: TableColumn<T>): string {
    if (column.format) {
      return column.format(row);
    }
    const value = (row as Record<string, unknown>)[column.key];
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }

  /** Emite la acción pulsada junto con su fila. */
  protected trigger(action: TableActionType, row: T): void {
    this.actionTriggered.emit({ action, row });
  }
}
