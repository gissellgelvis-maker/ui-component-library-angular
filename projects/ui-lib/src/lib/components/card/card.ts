import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** Estilos visuales disponibles para el contenedor de la card. */
export type CardElevation = 'flat' | 'raised' | 'outlined';

// Clases completas (no concatenadas) para que Tailwind las detecte al escanear el código.
const ELEVATION_CLASSES: Record<CardElevation, string> = {
  flat: 'bg-surface',
  raised: 'bg-surface shadow-lg shadow-black/40',
  outlined: 'bg-transparent border-2 border-primary/60',
};

const BASE_CLASSES = 'block overflow-hidden rounded-xl text-zinc-100';

/**
 * Contenedor con header (título y subtítulo) y un body que proyecta contenido arbitrario.
 *
 * @example
 * <ui-card title="Rick Sanchez" subtitle="Alive" elevation="raised" (headerClicked)="open()">
 *   <p>Contenido del body</p>
 * </ui-card>
 */
@Component({
  selector: 'ui-card',
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Evita que el atributo `title="..."` del host muestre el tooltip nativo del navegador.
    '[attr.title]': 'null',
  },
})
export class Card {
  /** Título que se muestra en el header. */
  readonly title = input.required<string>();

  /** Subtítulo opcional bajo el título. */
  readonly subtitle = input<string | null>(null);

  /** Estilo visual del contenedor. */
  readonly elevation = input<CardElevation>('raised');

  /** Se emite al hacer clic en el header. */
  readonly headerClicked = output<void>();

  /** Clases de Tailwind según la elevación actual. */
  protected readonly classes = computed(() => `${BASE_CLASSES} ${ELEVATION_CLASSES[this.elevation()]}`);
}