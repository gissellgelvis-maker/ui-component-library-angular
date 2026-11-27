import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailModal } from './detail-modal';
import { ResourceItem } from '../../models/resource.models';

describe('DetailModal', () => {
  let component: DetailModal;
  let fixture: ComponentFixture<DetailModal>;

  const mockItem: ResourceItem = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: {
      name: 'Earth',
      url: '',
    },
    location: {
      name: 'Earth',
      url: '',
    },
    image: 'https://example.com/rick.png',
    episode: ['https://example.com/episode/1'],
    url: 'https://example.com/character/1',
    created: '2017-11-04T18:48:46.250Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailModal);
    fixture.componentRef.setInput('item', mockItem);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});