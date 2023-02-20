import {Component, OnInit} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {CategoryService} from '../../services/category.service';
import {CreateCategoryComponent} from '../create-category/create-category.component';
import {MessageService} from 'primeng/api';
import {CategoryModel} from '../../models/category.model';
import {AddOrEditResourceComponent} from '../add-or-edit-resource/add-or-edit-resource.component';
import {Resource} from '../../models/resource.model';

@Component({
  selector: 'app-add-entity-popup',
  templateUrl: './add-entity-popup.component.html',
  styleUrls: ['./add-entity-popup.component.scss']
})
export class AddEntityPopupComponent implements OnInit {

  parentId: number;
  parentProperties: any;

  constructor(private ref: DynamicDialogRef,
              public dialogService: DialogService,
              public messageService: MessageService,
              private config: DynamicDialogConfig,
              private categoryService: CategoryService) {
    if (this.config.data !== undefined && this.config.data.categoryId) {
      this.parentId = this.config.data.categoryId;
    }
    if (this.config.data !== undefined && this.config.data.parentProperties) {
      this.parentProperties = this.config.data.parentProperties;
    }
  }

  ngOnInit() {
  }

  openAddCategoryDialog() {
    const ref = this.dialogService.open(CreateCategoryComponent, {
      data: {
        categoryId: this.parentId,
        parentProperties: this.parentProperties
      },
      header: 'Create category',
      width: '500px'
    });

    ref.onClose.subscribe((item: CategoryModel) => {
      if (item) {
        this.messageService.add({severity: 'success', summary: 'Category created!', life: 3000});
        this.ref.close({category: item});
      }
    });
  }

  openAddResourceDialog() {
    const ref = this.dialogService.open(AddOrEditResourceComponent, {
      data: {
        categoryId: this.parentId,
        parentProperties: this.parentProperties
      },
      header: 'Add resource',
      width: '500px'
    });

    ref.onClose.subscribe((item: Resource) => {
      if (item) {
        this.messageService.add({severity: 'success', summary: 'Resource added!', life: 3000});
        this.ref.close({resource: item});
      }
    });
  }
}
