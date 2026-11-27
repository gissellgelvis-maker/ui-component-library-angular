import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiResponse, ResourceItem, ResourceType, StatusFilter } from '../models/resource.models';

const API_URL = 'https://rickandmortyapi.com/api';

/**
 * Concentra el estado del explorador (recurso activo, filtro, filas, loading y error)
 * y es el único lugar que hace llamadas HTTP. Los componentes solo leen signals y
 * llaman a sus métodos.
 */
@Injectable({ providedIn: 'root' })
export class ResourceExplorerService {
  private readonly http = inject(HttpClient);

  /** Petición en curso; se cancela cuando empieza una nueva. */
  private request: Subscription | null = null;

  private readonly _resource = signal<ResourceType>('character');
  private readonly _status = signal<StatusFilter | null>(null);
  private readonly _rows = signal<ResourceItem[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  /** Recurso activo. */
  readonly resource = this._resource.asReadonly();

  /** Filtro de status activo (`null` si no hay ninguno). */
  readonly status = this._status.asReadonly();

  /** Registros del recurso activo. */
  readonly rows = this._rows.asReadonly();

  /** `true` mientras hay una petición en curso. */
  readonly loading = this._loading.asReadonly();

  /** Mensaje de error de la última petición, o `null`. */
  readonly error = this._error.asReadonly();

  /** El filtro por status solo existe en la API para personajes. */
  readonly statusFilterEnabled = computed(() => this._resource() === 'character');

  /** Cambia el recurso activo, reinicia el filtro y carga los datos. */
  setResource(resource: ResourceType): void {
    this._resource.set(resource);
    this._status.set(null);
    this.load();
  }

  /** Cambia el filtro de status y recarga. Se ignora si el recurso no lo soporta. */
  setStatus(status: StatusFilter | null): void {
    if (!this.statusFilterEnabled()) {
      return;
    }
    this._status.set(status);
    this.load();
  }

  removeRow(row: ResourceItem): void {
    this._rows.update((rows) => rows.filter((r) => r !== row));
  }

  /** Pide a la API la primera página del recurso activo con el filtro aplicado. */
  load(): void {
    this.request?.unsubscribe();
    this._loading.set(true);
    this._error.set(null);

    let params = new HttpParams();
    const status = this._status();
    if (status) {
      params = params.set('status', status);
    }

    this.request = this.http
      .get<ApiResponse<ResourceItem>>(`${API_URL}/${this._resource()}`, { params })
      .subscribe({
        next: (response) => {
          this._rows.set(response.results);
          this._loading.set(false);
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  /** La API responde 404 cuando no hay resultados: eso es un estado vacío, no un error. */
  private handleError(error: HttpErrorResponse): void {
    this._rows.set([]);
    this._loading.set(false);

    if (error.status === 404) {
      this._error.set(null);
      return;
    }
    this._error.set(
      error.status === 0
        ? 'No se pudo conectar con la API. Revisa tu conexión.'
        : `La API respondió con un error (${error.status}). Intenta de nuevo.`,
    );
  }
}