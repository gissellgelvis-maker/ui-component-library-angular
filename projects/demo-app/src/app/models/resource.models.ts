/** Recursos disponibles en la Rick and Morty API. */
export type ResourceType = 'character' | 'episode' | 'location';

/** Valores del filtro de status aceptados por la API (en minúsculas). */
export type StatusFilter = 'alive' | 'dead' | 'unknown';

/** Estado de un personaje tal como lo devuelve la API. */
export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';

/** Referencia a otro recurso (origen o ubicación de un personaje). */
export interface NamedResource {
  name: string;
  url: string;
}

/** Personaje de la serie. */
export interface Character {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: string;
  origin: NamedResource;
  location: NamedResource;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

/** Episodio de la serie. */
export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

/** Ubicación de la serie. */
export interface Location {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: string[];
  url: string;
  created: string;
}

/** Cualquiera de los tres tipos de registro. */
export type ResourceItem = Character | Episode | Location;

/** Información de paginación que acompaña a cada respuesta. */
export interface PageInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

/** Forma de la respuesta de los endpoints de listado. */
export interface ApiResponse<T> {
  info: PageInfo;
  results: T[];
}