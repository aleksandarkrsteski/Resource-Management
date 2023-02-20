import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEntityPopupComponent } from './add-entity-popup.component';

describe('AddEntityPopupComponent', () => {
  let component: AddEntityPopupComponent;
  let fixture: ComponentFixture<AddEntityPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEntityPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEntityPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
