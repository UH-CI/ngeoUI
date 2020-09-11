import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeafletGraphComponent } from './leaflet-graph.component';

describe('LeafletGraphComponent', () => {
  let component: LeafletGraphComponent;
  let fixture: ComponentFixture<LeafletGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeafletGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeafletGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
