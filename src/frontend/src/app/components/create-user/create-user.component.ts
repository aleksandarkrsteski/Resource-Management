import { Component, OnInit } from '@angular/core';
import {UserModel} from '../../models/user.model';
import {AuthenticationService} from '../../services/auth.service';
import {MessageService} from 'primeng/api';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  user: UserModel = new UserModel();
  update = false;

  roles: any[] = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'User', value: 'USER' }
  ];

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private authService: AuthenticationService,
              private messageService: MessageService) {
    if (this.config.data !== undefined && this.config.data.user) {
      this.user = JSON.parse(JSON.stringify(this.config.data.user));
      this.update = true;
    }
  }

  ngOnInit() {
  }

  register(): void {
    this.authService.registerUser(this.user).subscribe((res) => {
      this.messageService.add({severity: 'success', summary: 'User registered!', life: 3000});
      this.ref.close(res);
    }, _ => {
      this.messageService.add({severity: 'error', summary: 'User registration failed!', life: 3000});
    });
  }

  updateUser() {
    this.authService.updateUser(this.user).subscribe((res) => {
      this.messageService.add({severity: 'success', summary: 'User updated!', life: 3000});
      this.ref.close(res);
    }, _ => {
      this.messageService.add({severity: 'error', summary: 'User update failed!', life: 3000});
    });
  }
}
