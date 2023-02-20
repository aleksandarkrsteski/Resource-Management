import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {CategoryService} from '../../services/category.service';
import {Resource} from '../../models/resource.model';
import {ResourcesService} from '../../services/resources.service';
import {CategoryModel} from '../../models/category.model';
import {AuthenticationService} from '../../services/auth.service';
import {UserModel} from '../../models/user.model';

@Component({
  selector: 'app-add-resource',
  templateUrl: './add-or-edit-resource.component.html',
  styleUrls: ['./add-or-edit-resource.component.scss']
})
export class AddOrEditResourceComponent implements OnInit {

  parentId: number;
  properties: any;
  resourceCreationModel: Resource = new Resource();
  update = false;
  availableCategories: CategoryModel[] = [];
  user: UserModel;
  formDisabled = false;

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private resourceService: ResourcesService,
              private categoryService: CategoryService,
              private authenticationService: AuthenticationService) {
    if (this.config.data !== undefined && this.config.data.categoryId) {
      this.parentId = this.config.data.categoryId;
    }
    if (this.config.data !== undefined && this.config.data.parentProperties) {
      this.properties = JSON.parse(this.config.data.parentProperties);
    }
    if (this.config.data !== undefined && this.config.data.update) {
      this.resourceCreationModel = this.config.data.resource;
      this.properties = this.resourceCreationModel.properties;
      this.update = true;
    }
  }

  ngOnInit() {
    this.authenticationService.loginUser.subscribe(response => {
      this.user = response;
      this.formDisabled = this.user.role === 'USER';
    });
    if (this.update) {
      if (this.parentId) {
        this.loadOnlyCategoriesLeafCategories();
      } else {
        this.loadAllLeafCategories();
      }
    }
  }

  getProperties() {
    return Object.keys(this.properties);
  }

  createResource() {
    this.resourceCreationModel.properties = JSON.stringify(this.properties);
    this.resourceCreationModel.category_id = this.parentId;
    this.resourceService.createResource(this.resourceCreationModel).subscribe((res: Resource) => {
      res.properties = JSON.parse(res.properties);
      this.ref.close(res);
    });
  }

  updateResource() {
    this.resourceCreationModel.properties = JSON.stringify(this.properties);
    this.resourceService.updateResource(this.resourceCreationModel).subscribe((res: Resource) => {
      res.properties = JSON.parse(res.properties);
      this.ref.close(res);
    });
  }

  deleteResource() {
    this.resourceCreationModel.properties = JSON.stringify(this.properties);
    this.resourceService.deleteResource(this.resourceCreationModel.id).subscribe((res: Resource) => {
      res.properties = JSON.parse(res.properties);
      this.ref.close(res);
    });
  }

  loadAllLeafCategories() {
    this.categoryService.listAllLeafCategories().subscribe((res: CategoryModel[]) => {
      this.availableCategories = res;
    });
  }

  loadOnlyCategoriesLeafCategories() {
    this.categoryService.getCategory(this.resourceCreationModel.category_id).subscribe((res: CategoryModel) => {
      this.categoryService.listLeafCategoriesByCategory(res.parent).subscribe((categories: CategoryModel[]) => {
        this.availableCategories = categories;
      });
    });
  }
}
