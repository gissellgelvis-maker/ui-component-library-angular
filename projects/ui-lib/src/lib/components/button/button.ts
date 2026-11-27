import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonAppearance = 'solid' | 'outline';

const OUTLINE_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border border-primary text-primary enabled:hover:bg-primary/15 focus-visible:ring-primary',
  secondary: 'border border-accent/60 text-accent-light enabled:hover:bg-accent/20 focus-visible:ring-accent',
  danger: 'border border-red-400/60 text-red-300 enabled:hover:bg-red-600 enabled:hover:text-white focus-visible:ring-red-500',
};


const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-space enabled:hover:bg-primary-light focus-visible:ring-primary',
  secondary: 'bg-line text-zinc-100 enabled:hover:bg-line-strong focus-visible:ring-zinc-400',
  danger: 'bg-red-600 text-white enabled:hover:bg-red-500 focus-visible:ring-red-500',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-space ' +
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

  /** Apariencia del botón: `solid` (relleno, por defecto) u `outline` (solo borde). */
  readonly appearance = input<ButtonAppearance>('solid');

  /** `true` si el botón no debe responder a clicks. */
  protected readonly isBlocked = computed(() => this.disabled() || this.loading());

  /** Clases de Tailwind según la apariencia, la variante y el tamaño actuales. */
  protected readonly classes = computed(() => {
    const palette = this.appearance() === 'outline' ? OUTLINE_CLASSES : VARIANT_CLASSES;
    return `${BASE_CLASSES} ${palette[this.variant()]} ${SIZE_CLASSES[this.size()]}`;
  });

  /** Maneja el click nativo y emite `clicked` solo si el botón está habilitado. */
  protected onClick(): void {
    if (this.isBlocked()) {
      return;
    }
    this.clicked.emit();
  }
}