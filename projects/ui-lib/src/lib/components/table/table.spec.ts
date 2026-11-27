import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Table } from './table';

interface TestRow {
  id: number;
  name: string;
}

describe('Table', () => {
  let component: Table<TestRow>;
  let fixture: ComponentFixture<Table<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table],
    }).compileComponents();

    fixture = TestBed.createComponent(Table<TestRow>);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
