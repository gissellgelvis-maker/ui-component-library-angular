import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Button, Select, SelectOption, Table, TableAction } from 'ui-lib';
import { ResourceItem } from '../models/resource.models';
import { ResourceExplorerService } from '../services/resource-explorer.service';
import { DetailModal } from './detail-modal/detail-modal';
import {
  EMPTY_MESSAGES,
  RESOURCE_COLUMNS,
  RESOURCE_OPTIONS,
  STATUS_OPTIONS,
  isResourceType,
  isStatusFilter,
} from './resource-config';


@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [Button, Select, Table, DetailModal],
  templateUrl: './explorer.html',
  styleUrl: './explorer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Explorer implements OnInit {
  protected readonly explorer = inject(ResourceExplorerService);

  protected readonly resourceOptions = RESOURCE_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly columns = computed(() => RESOURCE_COLUMNS[this.explorer.resource()]);
  protected readonly emptyMessage = computed(() => EMPTY_MESSAGES[this.explorer.resource()]);

  
  protected readonly selected = signal<ResourceItem | null>(null);

  ngOnInit(): void {
    this.explorer.load();
  }

  protected onResourceChange(option: SelectOption): void {
    if (isResourceType(option.value)) {
      this.explorer.setResource(option.value);
    }
  }

  protected onStatusChange(option: SelectOption): void {
    if (isStatusFilter(option.value)) {
      this.explorer.setStatus(option.value);
    }
  }

  
  protected onAction(event: TableAction<ResourceItem>): void {
    if (event.action === 'view') {
      this.selected.set(event.row);
    }
  }

  protected closeDetail(): void {
    this.selected.set(null);
  }
}