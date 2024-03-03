import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/service/authentication';
import { User } from 'src/app/shared/utilitarios/user';

@Component({
  selector: 'app-add-credit',
  templateUrl: './add-credit.component.html',
  styleUrls: ['./add-credit.component.css']
})
export class AddCreditComponent implements OnInit {
    totalCredits: number = 100;
    user!: User | null;
    products = [
        { credits: 10 },
        { credits: 20 },
        { credits: 30 },
        { credits: 40 }
    ];
    showInput: boolean = false;
    constructor( private authService: AuthenticationService){}
    showOtherValueInput() {
        this.showInput = true;
    }

    ngOnInit(): void {
      this.user = this.authService.getUser();
    }
}

