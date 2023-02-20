import {Component, ElementRef, OnInit} from '@angular/core';
import {DialogService} from 'primeng/dynamicdialog';
import {MenuItem, MessageService} from 'primeng/api';
import {ResourcesService} from '../../services/resources.service';
import {ResourceCalendarComponent} from '../resource-calendar/resource-calendar.component';
import {CreateCategoryComponent} from '../create-category/create-category.component';
import {CategoryService} from '../../services/category.service';
import {CategoryModel} from '../../models/category.model';
import * as R from 'ramda';
import {AddEntityPopupComponent} from '../add-entity-popup/add-entity-popup.component';
import {Resource} from '../../models/resource.model';
import {AddOrEditResourceComponent} from '../add-or-edit-resource/add-or-edit-resource.component';
import {AuthenticationService} from '../../services/auth.service';
import {UserModel} from '../../models/user.model';

@Component({
  selector: 'app-home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  resources: Resource[] = [];

  items: MenuItem[] = [];
  categoryList: CategoryModel[] = [];
  currentParent: number;
  currentParentProperties: any;
  private alreadyAddedListener = false;
  currentLeafCategories: CategoryModel[] = [];
  selectedLeafCategory: CategoryModel = null;
  filteredCurrentResources: Resource[] = [];

  currentResources: Resource[] = [];
  private filterApplied: number = null;

  user: UserModel;
  loading = false;

  constructor(public dialogService: DialogService,
              private elementRef: ElementRef,
              public messageService: MessageService,
              public authenticationService: AuthenticationService,
              public categoriesService: CategoryService,
              public resourcesService: ResourcesService) {
  }

  ngOnInit() {
    this.authenticationService.loginUser.subscribe(response => {
      this.user = response;
    });
    this.loadCategories();
    this.loadAllResources();
    this.loadPrimaryLeafCategories();
  }

  loadCategories() {
    this.loading = true;
    this.categoriesService.listCategories()
      .subscribe({
        next: (response: CategoryModel[]) => {
          this.items = [];
          this.categoryList = response;
          this.loading = false;
          this.buildCategoryTree(response);
        }
      });
  }

  openDialog(resourceId: number) {
    const ref = this.dialogService.open(ResourceCalendarComponent, {
      data: {
        resourceId
      },
      header: 'Resource Calendar',
      width: '70%',
      styleClass: 'custom'
    });

    ref.onClose.subscribe((item: any) => {
      if (item) {
        this.messageService.add({severity: 'success', summary: 'Reservation successful!', life: 3000});
      }
    });

  }

  getDetailsAndOpenAddCategoryDialog() {
    if (!this.currentParent) {
      const dummyCategory = new CategoryModel();
      dummyCategory.properties = null;
      this.openAddCategoryDialog(dummyCategory);
      return;
    }
    this.categoriesService.getCategory(this.currentParent).subscribe((res: CategoryModel) => {
      this.openAddCategoryDialog(res);
    });
  }

  openAddCategoryDialog(res?: CategoryModel) {
    const ref = this.dialogService.open(CreateCategoryComponent, {
      data: {
        categoryId: this.currentParent,
        parentProperties: res.properties
      },
      header: 'Create category',
      width: '500px'
    });

    ref.onClose.subscribe((category: any) => {
      if (category) {
        this.categoryList = R.concat(this.categoryList, [category]);
        const item: any = {id: category.id, label: category.name, parent_id: category.parent};
        item.command = () => {
          this.openAddSubCategoryOrResourceDialog(category);
          this.loadResourcesByCategory(item.id);
          this.listLeafCategoriesByCategory(item.id);
          this.currentParent = item.parent_id;
          this.currentParentProperties = JSON.parse(res.properties);
        };
        this.addItemToItemsArray(item.parent_id, item);
        this.items = R.concat(this.items, []);

        if (!this.currentParent) {
          this.loadPrimaryLeafCategories();
        } else {
          this.listLeafCategoriesByCategory(this.currentParent);
        }

        this.messageService.add({severity: 'success', summary: 'Category created!', life: 3000});
      }
    });
  }

  addItemToItemsArray(id: number, item: any, items = this.items) {
    if (!id) {
      this.items = R.concat(this.items, [item]);
      return;
    }
    for (const obj of items) {

      if (+obj.id === id) {
        if (!obj.items) {
          obj.items = [];
        }
        obj.items = R.concat(obj.items, [item]);
        return;
      } else if (obj.items) {
        this.addItemToItemsArray(id, item, obj.items);
      }
    }
  }

  openAddSubCategoryOrResourceDialog(category: CategoryModel) {
    if (this.user.role === 'USER') {
      return;
    }
    const ref = this.dialogService.open(AddEntityPopupComponent, {
      data: {
        categoryId: category.id,
        parentProperties: category.properties
      },
      header: 'Create',
      width: '500px'
    });

    ref.onClose.subscribe((entity: { category?: CategoryModel, resource?: any }) => {
      if (!entity) {
        return;
      }
      if (entity.category) {
        this.categoryList = R.concat(this.categoryList, [entity.category]);
        const item: any = {id: entity.category.id, label: entity.category.name, parent_id: entity.category.parent};
        item.command = () => {
          this.openAddSubCategoryOrResourceDialog(entity.category);
          this.loadResourcesByCategory(item.id);
          this.listLeafCategoriesByCategory(item.id);
          this.currentParent = item.id;
          this.currentParentProperties = JSON.parse(entity.category.properties);
        };
        this.addItemToItemsArray(item.parent_id, item);
        this.items = R.concat(this.items, []);
        const command = () => {
          this.loadResourcesByCategory(item.parent_id);
          this.listLeafCategoriesByCategory(item.parent_id);
          this.currentParent = item.parent_id;
          this.currentParentProperties = JSON.parse(category.properties);
          this.addListener();
        };
        this.addCommandById(item.parent_id, command);
      }
      if (entity) {
        if (this.currentParent) {
          this.loadResourcesByCategory(this.currentParent);
        } else {
          this.loadAllResources();
        }
        if (!this.currentParent) {
          this.loadPrimaryLeafCategories();
        } else {
          this.listLeafCategoriesByCategory(this.currentParent);
        }
      }
    });

  }

  buildCategoryTree(categories: CategoryModel[]): void {
    const categoryMap = new Map<number, any>();

    categories.forEach(cat => {
      categoryMap.set(cat.id, {id: cat.id, parent_id: cat.parent, label: cat.name});
    });

    categories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parent) {
        const parent = categoryMap.get(cat.parent);
        if (!parent.items) {
          parent.items = [];
        }
        parent.items.push(category);
      } else {
        this.items = R.concat(this.items, [category]);
      }
    });

    this.addCommandToLeafCategories(this.items);
  }

  addCommandToLeafCategories(items: any[]) {
    items.forEach((item) => {
      if (item.items && item.items.length) {
        item.command = () => {
          this.loadResourcesByCategory(item.id);
          this.listLeafCategoriesByCategory(item.id);
          this.currentParent = item.id;
          const category = this.categoryList.find(x => x.id === item.id);
          this.currentParentProperties = JSON.parse(category.properties);
          this.addListener();
        };
        this.addCommandToLeafCategories(item.items);
      } else {
        item.command = () => {
          const category = this.categoryList.find(x => x.id === item.id);
          this.openAddSubCategoryOrResourceDialog(category);
          this.currentParent = item.parent_id;
        };
      }
    });
  }

  private loadAllResources() {
    this.resourcesService.listResources().subscribe((res: Resource[]) => {
      this.currentResources = this.filteredCurrentResources = res;
      this.parseProperties();
      if (this.filterApplied) {
        this.filteredCurrentResources = this.currentResources.filter(cat => cat.category_id === this.filterApplied);
      }
    });
  }

  private loadResourcesByCategory(id: number) {
    this.resourcesService.listResourcesByCategory(id).subscribe((res: Resource[]) => {
      this.currentResources = this.filteredCurrentResources = res;
      this.parseProperties();
      if (this.filterApplied) {
        this.filteredCurrentResources = this.currentResources.filter(cat => cat.category_id === this.filterApplied);
      }
    });
  }

  private listLeafCategoriesByCategory(id: number) {
    this.categoriesService.listLeafCategoriesByCategory(id).subscribe((res: CategoryModel[]) => {
      this.currentLeafCategories = res;
      this.selectedLeafCategory = null;
    });
  }

  private parseProperties() {
    this.filteredCurrentResources.forEach(resource => {
      resource.properties = JSON.parse(resource.properties);
    });
  }

  addListener(): void {
    if (!this.alreadyAddedListener) {
      const slideMenuBackwardButton = this.elementRef.nativeElement.querySelector('.p-slidemenu-backward');

      if (slideMenuBackwardButton) {
        this.alreadyAddedListener = true;
        slideMenuBackwardButton.addEventListener('click', () => {
          this.categoriesService.getCategory(this.currentParent).subscribe((res: CategoryModel) => {
            this.currentParent = res.parent;
            this.currentParentProperties = JSON.parse(res.properties);
            this.selectedLeafCategory = null;
            this.filterApplied = null;
            this.filteredCurrentResources = this.currentResources;
            if (this.currentParent === null) {
              this.currentParentProperties = null;
              this.loadAllResources();
              this.currentLeafCategories = [];
              this.loadPrimaryLeafCategories();
            } else {
              this.listLeafCategoriesByCategory(res.parent);
            }
          });
        });
      }
    }
  }

  addCommandById(id: number, command: () => void, node: any[] = this.items) {
    for (const item of node) {
      if (item.id === id) {
        item.command = command;
        break;
      }
      if (item.items) {
        this.addCommandById(id, command, item.items);
      }
    }
  }

  getResourceCategoryName(categoryId: number) {
    const name = this.categoryList.find(cat => cat.id === categoryId);
    return name ? name.name : 'All resources';
  }

  selectLeafCategory(event: any) {
    const selectedCategory = this.categoryList.find(x => x.id === event.value);
    if (event.value) {
      this.filterApplied = event.value;
      this.loadResourcesByCategory(this.filterApplied);
      this.currentParentProperties = JSON.parse(selectedCategory.properties);
    } else {
      this.filterApplied = null;
      if (this.currentParent) {
        const selectedParentCategory = this.categoryList.find(x => x.id === this.currentParent);
        this.currentParentProperties = JSON.parse(selectedParentCategory.properties);
        this.loadResourcesByCategory(this.currentParent);
      } else  {
        this.loadAllResources();
        this.currentParentProperties = {};
      }
    }
  }

  editResource(resource: any) {
      const ref = this.dialogService.open(AddOrEditResourceComponent, {
        data: {
          resource,
          update: true,
          categoryId: this.currentParent
        },
        header: 'Update resource',
        width: '500px'
      });

      ref.onClose.subscribe((item: Resource) => {
        if (item) {
          if (this.currentParent) {
            this.loadResourcesByCategory(this.currentParent);
          } else {
            this.loadAllResources();
          }
          this.messageService.add({severity: 'success', summary: 'Resource updated/deleted!', life: 3000});
        }
      });
  }

  private loadPrimaryLeafCategories() {
    this.categoriesService.listPrimaryLeafCategories().subscribe((res: CategoryModel[]) => {
      this.currentLeafCategories = res;
    });
  }
}
