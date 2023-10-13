import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { UserService } from '../../shared/service/user_service';
import { User } from '../../shared/utilitarios/user';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BuildingService } from '../../shared/service/buildings_service';
import { Building } from '../../shared/utilitarios/buildings';
import { AuthenticationService } from 'src/app/shared/service/authentication';


export const ConfirmValidator = (controlName: string, matchingControlName: string): ValidatorFn => {
  return (control: AbstractControl): {[key: string]: boolean} | null => {
    const input = control.get(controlName);
    const matchingInput = control.get(matchingControlName);

    return (input && matchingInput && input.value !== matchingInput.value) ? {'mismatch': true} : null;
  };
};

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent {
  registerForm!: FormGroup;
  user!: User;
  buildings: Building[] = [];
  userID: string = '';
  errorMessages: { [key: string]: string } = {
    first_name: 'Insira o primeiro nome',
    last_name: 'Insira o sobrenome',
    cpf: 'Insira o CPF',
    telefone: 'Insira o telefone',
    data_nasc: 'Insira a data de nascimento',
    apt_name: 'Insira o nome apartamento',
    emailGroup: 'Verifique os e-mails digitados',
    passwordGroup: 'Verifique as senhas digitadas'
  };

  
  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private authentication: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.userID = this.route.snapshot.paramMap.get('id') ?? '';
  
    const user = this.authentication.getUser();
   
    if (user && user.role.toLocaleUpperCase() != 'ADMIN' && user.role.toLocaleUpperCase() != 'SINDICO' ) {
      this.router.navigate(['/content']);
      return;
    }

    this.userService.getUser(Number(this.userID)).subscribe(
      (user: User) => {
        this.user = user;
        const formattedBirthDate = user.data_nasc ? this.formatDate(user.data_nasc.toString()) : '';
  
        this.registerForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          cpf: user.cpf,
          data_nasc: formattedBirthDate,
          telefone: user.telefone,
          apt_name: user.apt_name,
          emailGroup: {
            email: user.email,
            confirmEmail: user.email, // Preencha com o valor do usuário ou defina como quiser
          },
          role: user.role // Preencha o campo 'role' com o valor do usuário
        });
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );
  
    this.registerForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      cpf: ['', Validators.required],
      emailGroup: this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required, Validators.email]]
      }, { validator: ConfirmValidator('email', 'confirmEmail') }),
      data_nasc: ['', Validators.required],
      telefone: ['', Validators.required],
      apt_name: ['', Validators.required],
      credito: [10],
      role: [''] // Defina o campo 'role' no FormGroup
    });
  }

  onSubmit(): void {

  }

  cancelar(): void {
    this.router.navigate(["admin/userControl"]);
  }
  

  resetForm(): void {
    this.registerForm.reset({
      first_name: '',
      last_name: '',
      cpf: '',
      emailGroup: {
        email: '',
        confirmEmail: ''
      },
      passwordGroup: {
        password: '',
        confirmPassword: ''
      },
      data_nasc: '',
      telefone: '',
      building_id: null,
      role:'',
      credito: 10,
    });
  }
  
  formatDate(dateString: string | undefined): string {
    if (dateString) {
      const dateParts = dateString.split('T')[0].split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      const day = dateParts[2];
      return `${year}-${month}-${day}`;
    }
    return '';
  }
  
}
