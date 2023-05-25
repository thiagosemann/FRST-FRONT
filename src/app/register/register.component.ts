import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { UserService } from '../shared/service/user_service';
import { User } from '../shared/utilitarios/user';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';



export const ConfirmValidator = (controlName: string, matchingControlName: string): ValidatorFn => {
  return (control: AbstractControl): {[key: string]: boolean} | null => {
    const input = control.get(controlName);
    const matchingInput = control.get(matchingControlName);

    return (input && matchingInput && input.value !== matchingInput.value) ? {'mismatch': true} : null;
  };
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  user!: User;

  constructor(private formBuilder: FormBuilder, private userService: UserService, private toastr: ToastrService, private router:Router) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      cpf: ['', Validators.required],
      emailGroup: this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required, Validators.email]]
      }, { validator: ConfirmValidator('email', 'confirmEmail') }),
      passwordGroup: this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      }, { validator: ConfirmValidator('password', 'confirmPassword') }),
      data_nasc: ['', Validators.required],
      telefone: ['', Validators.required],
      predio: ['Capri'],
      credito: [10],
      token: ['10']
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { emailGroup, passwordGroup, ...rest } = this.registerForm.value;
      this.user = {
        ...rest,
        email: emailGroup.email,
        password: passwordGroup.password,
      };
  
      this.userService.addUser(this.user).subscribe(
        (res) => {
          this.toastr.success("Cadastrado com sucesso!")
          this.router.navigate(['/login']);
          this.resetForm();
        },
        (err) => {
          this.toastr.error(err.error.error);
        }
      );
    } else {
      this.toastr.error('Por favor, corrija os erros no formulário');
    }
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
      predio: 'Capri',
      credito: 10,
      token: '10'
    });
  }
}



