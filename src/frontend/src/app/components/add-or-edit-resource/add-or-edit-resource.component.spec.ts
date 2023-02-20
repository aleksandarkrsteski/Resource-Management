import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditResourceComponent } from './add-or-edit-resource.component';

describe('AddResourceComponent', () => {
  let component: AddOrEditResourceComponent;
  let fixture: ComponentFixture<AddOrEditResourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOrEditResourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrEditResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
