import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button, Card } from 'ui-lib';
import { ResourceItem } from '../../models/resource.models';
import { Modal } from '../../shared/modal/modal';

interface DetailField {
  label: string;
  value: string;
}

const formatDate = (iso: string): string => new Date(iso).toLocaleDateString('es-CO');

@Component({
  selector: 'app-detail-modal',
  standalone: true,
  imports: [Button, Card, Modal],
  templateUrl: './detail-modal.html',
  styleUrl: './detail-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailModal {

  readonly item = input.required<ResourceItem>();

  readonly closed = output<void>();

  protected readonly character = computed(() => {
    const item = this.item();
    return 'species' in item ? item : null;
  });
  protected readonly episode = computed(() => {
    const item = this.item();
    return 'air_date' in item ? item : null;
  });
  protected readonly location = computed(() => {
    const item = this.item();
    return 'dimension' in item ? item : null;
  });

  protected readonly subtitle = computed(() => {
    const character = this.character();
    if (character) {
      return `${character.status} · ${character.species}`;
    }
    const episode = this.episode();
    if (episode) {
      return episode.episode;
    }
    return this.location()?.type ?? null;
  });

  protected readonly fields = computed<DetailField[]>(() => {
    const character = this.character();
    if (character) {
      return [
        { label: 'ID', value: String(character.id) },
        { label: 'Estado', value: character.status },
        { label: 'Especie', value: character.species },
        { label: 'Tipo', value: character.type || '—' },
        { label: 'Género', value: character.gender },
        { label: 'Origen', value: character.origin.name },
        { label: 'Ubicación', value: character.location.name },
        { label: 'Episodios', value: String(character.episode.length) },
        { label: 'Creado', value: formatDate(character.created) },
      ];
    }
    const episode = this.episode();
    if (episode) {
      return [
        { label: 'ID', value: String(episode.id) },
        { label: 'Código', value: episode.episode },
        { label: 'Emisión', value: episode.air_date },
        { label: 'Personajes', value: String(episode.characters.length) },
        { label: 'Creado', value: formatDate(episode.created) },
      ];
    }
    const location = this.location();
    if (location) {
      return [
        { label: 'ID', value: String(location.id) },
        { label: 'Tipo', value: location.type || '—' },
        { label: 'Dimensión', value: location.dimension || '—' },
        { label: 'Residentes', value: String(location.residents.length) },
        { label: 'Creado', value: formatDate(location.created) },
      ];
    }
    return [];
  });
}