import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {CategoryService} from '../../services/category.service';
import {CategoryModel} from '../../models/category.model';

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss']
})
export class CreateCategoryComponent implements OnInit {

  categoryCreationModel: CategoryModel = new CategoryModel();
  currentProperty = '';
  parentId: number;
  parentProperties: any;

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private categoryService: CategoryService) {
    if (this.config.data !== undefined && this.config.data.categoryId) {
      this.parentId = this.config.data.categoryId;
    }
    if (this.config.data !== undefined && this.config.data.parentProperties) {
      this.parentProperties = this.config.data.parentProperties;
      this.categoryCreationModel.properties = JSON.parse(this.parentProperties);
    }
  }

  ngOnInit() {
  }

  createCategory() {
    this.categoryCreationModel.parent = this.parentId;
    this.categoryCreationModel.properties = JSON.stringify(this.categoryCreationModel.properties);
    this.categoryService.createCategory(this.categoryCreationModel).subscribe(res => {
      this.ref.close(res);
    });
  }

  addProperty() {
    if (!this.categoryCreationModel.properties) {
      this.categoryCreationModel.properties = {};
    }
    if (this.currentProperty.trim() !== '') {
      this.categoryCreationModel.properties[this.currentProperty] = '';
      this.currentProperty = '';
    }
  }

  deleteProperty(property: string) {
    delete this.categoryCreationModel.properties[property];
  }

  getProperties() {
    if (this.categoryCreationModel.properties) {
      return Object.keys(this.categoryCreationModel.properties);
    }
    return [];
  }
}
