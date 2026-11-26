import { SelectOption, TableColumn } from 'ui-lib';
import { ResourceItem, ResourceType, StatusFilter } from '../models/resource.models';

/** Opciones del select de recurso. */
export const RESOURCE_OPTIONS: SelectOption[] = [
  { label: 'Characters', value: 'character' },
  { label: 'Episodes', value: 'episode' },
  { label: 'Locations', value: 'location' },
];

/** Opciones fijas del select de filtro (el value es lo que se envía a la API). */
export const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Alive', value: 'alive' },
  { label: 'Dead', value: 'dead' },
  { label: 'Unknown', value: 'unknown' },
];

/** Comprueba en tiempo de ejecución que un string es un recurso válido. */
export function isResourceType(value: string): value is ResourceType {
  return value === 'character' || value === 'episode' || value === 'location';
}

/** Comprueba en tiempo de ejecución que un string es un filtro de status válido. */
export function isStatusFilter(value: string): value is StatusFilter {
  return value === 'alive' || value === 'dead' || value === 'unknown';
}

const originName = (row: ResourceItem): string => ('origin' in row ? row.origin.name : '—');

/** Columnas que se muestran para cada recurso. */
export const RESOURCE_COLUMNS: Record<ResourceType, TableColumn<ResourceItem>[]> = {
  character: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nombre' },
    { key: 'status', header: 'Estado' },
    { key: 'species', header: 'Especie' },
    { key: 'origin', header: 'Origen', format: originName },
  ],
  episode: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nombre' },
    { key: 'episode', header: 'Código' },
    { key: 'air_date', header: 'Emisión' },
  ],
  location: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nombre' },
    { key: 'type', header: 'Tipo' },
    { key: 'dimension', header: 'Dimensión' },
  ],
};

/** Mensaje del estado vacío para cada recurso. */
export const EMPTY_MESSAGES: Record<ResourceType, string> = {
  character: 'No se encontraron personajes con ese filtro',
  episode: 'No se encontraron episodios',
  location: 'No se encontraron ubicaciones',
};