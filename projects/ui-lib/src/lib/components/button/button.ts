import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** Estilos visuales disponibles para el botón. */
export type ButtonVariant = 'primary' | 'secondary' | 'danger';

/** Tamaños disponibles para el botón. */
export type ButtonSize = 'sm' | 'md' | 'lg';

// Las clases van completas (no concatenadas) para que Tailwind las detecte al escanear el código.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-lime-400 text-slate-900 enabled:hover:bg-lime-300 focus-visible:ring-lime-400',
  secondary: 'bg-slate-700 text-slate-100 enabled:hover:bg-slate-600 focus-visible:ring-slate-400',
  danger: 'bg-red-600 text-white enabled:hover:bg-red-500 focus-visible:ring-red-500',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Botón reutilizable con variantes, tamaños y estado de carga.
 *
 * @example
 * <ui-button label="Guardar" variant="primary" (clicked)="save()" />
 */
@Component({
  selector: 'ui-button',
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  /** Texto visible del botón. */
  readonly label = input<string>('');

  /** Estilo visual del botón. */
  readonly variant = input<ButtonVariant>('primary');

  /** Tamaño del botón. */
  readonly size = input<ButtonSize>('md');

  /** Bloquea la interacción cuando es `true`. */
  readonly disabled = input<boolean>(false);

  /** Muestra un spinner y bloquea el click cuando es `true`. */
  readonly loading = input<boolean>(false);

  /** Se emite al hacer click, solo si el botón no está `disabled` ni `loading`. */
  readonly clicked = output<void>();

  /** `true` si el botón no debe responder a clicks. */
  protected readonly isBlocked = computed(() => this.disabled() || this.loading());

  /** Clases de Tailwind según la variante y el tamaño actuales. */
  protected readonly classes = computed(
    () => `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]} ${SIZE_CLASSES[this.size()]}`,
  );

  /** Maneja el click nativo y emite `clicked` solo si el botón está habilitado. */
  protected onClick(): void {
    if (this.isBlocked()) {
      return;
    }
    this.clicked.emit();
  }
}
