import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { UserService } from '../shared/service/user_service';
import { User } from '../shared/utilitarios/user';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BuildingService } from '../shared/service/buildings_service';
import { Building } from '../shared/utilitarios/buildings';

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
  buildings: Building[] = [];

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private toastr: ToastrService,
              private router: Router,
              private buildingService: BuildingService
  ) {}

  ngOnInit(): void {
    this.buildingService.getAllBuildings().subscribe(
      (buildings: Building[]) => {
        this.buildings = buildings; // Set the value inside the subscription
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
      passwordGroup: this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      }, { validator: ConfirmValidator('password', 'confirmPassword') }),
      data_nasc: ['', Validators.required],
      telefone: ['', Validators.required],
      apt_name: ['', Validators.required], // Novo campo "apt_name" adicionado ao formulário
      building_id: [null, Validators.required], // Use `null` as the initial value
      role: ['', Validators.required], // Adicionando a validação para o campo role
      credito: [10]
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
      this.user.building_id = Number(this.user.building_id);
      this.user.data_nasc = new Date(this.user.data_nasc!);
      
      this.userService.addUser(this.user).subscribe(
        (res) => {
          this.toastr.success("Cadastrado com sucesso!")
          this.router.navigate(['/login']);
          this.resetForm();
        },
        (err) => {
          console.log(err)
          this.toastr.error(err);
        }
      );
    } else {
          // Mostra quais campos estão inválidos e seus respectivos estados de validação
    for (const controlName in this.registerForm.controls) {
      const control = this.registerForm.get(controlName);

      if (control && control.invalid) {
        console.log(`Campo ${controlName} inválido. Estado de validação:`, control.errors);
      }
    }
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
      building_id: null,
      role:'',
      credito: 10,
    });
  }
}



