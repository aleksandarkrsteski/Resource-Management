import { Component, OnInit } from '@angular/core';
import {UserModel} from '../../models/user.model';
import {AuthenticationService} from '../../services/auth.service';
import {DialogService} from 'primeng/dynamicdialog';
import {CreateUserComponent} from '../create-user/create-user.component';
import {ConfirmationService, Message, PrimeNGConfig} from 'primeng/api';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css']
})
export class ListUsersComponent implements OnInit {
  users: UserModel[] = [];
  msgs: Message[] = [];
  user: UserModel;


  constructor(private authService: AuthenticationService,
              private confirmationService: ConfirmationService,
              private primengConfig: PrimeNGConfig,
              private dialogService: DialogService) { }

  ngOnInit() {
    this.authService.loginUser.subscribe(response => {
      this.user = response;
    });
    this.loadUsers();
  }

  registerUserForm() {
    const ref = this.dialogService.open(CreateUserComponent, {
      header: 'Register user',
      width: '500px'
    });

    ref.onClose.subscribe((item: UserModel) => {
      if (item) {
        this.loadUsers();
      }
    });
  }

  editUser(user: UserModel) {
    const ref = this.dialogService.open(CreateUserComponent, {
      data: {
        user
      },
      header: 'Update user',
      width: '500px'
    });

    ref.onClose.subscribe((item: UserModel) => {
      if (item) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: UserModel) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this user?',
      header: 'Delete user',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.authService.deleteUser(user.id).subscribe(_ => {
          this.loadUsers();
          this.msgs = [{severity: 'success', summary: 'Deleted', detail: 'User deleted!'}];
        });
      }
    });
  }

  private loadUsers() {
    this.authService.listUsers().subscribe((res: UserModel[]) => {
      this.users = res.filter(user => user.id !== this.user.id);
    });
  }
}
