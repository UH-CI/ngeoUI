import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueGraphComponent } from './value-graph.component';

describe('ValueGraphComponent', () => {
  let component: ValueGraphComponent;
  let fixture: ComponentFixture<ValueGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
