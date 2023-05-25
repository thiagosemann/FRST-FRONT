import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './shared/service/authGuard';


import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LandingComponent } from './landing/landing.component';
import { ContentComponent } from './content/content.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent},
  { path: 'landing', component: LandingComponent,canActivate: [AuthGuardService]  },


  {
    path: 'content',
    component: ContentComponent,
    canActivate: [AuthGuardService],
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'profile',
        canActivate: [AuthGuardService],

        loadChildren: () =>
          import('./content/profile/profile.module').then((m) => m.ProfileModule)
      },
      {
        path: 'logGastos',
        canActivate: [AuthGuardService],

        loadChildren: () =>
          import('./content/log-gastos/log-gastos.module').then((m) => m.LogGastosModule)
      },
      // Adicione mais rotas e componentes filhos aqui
    ]
  }

  // Outras rotas do seu aplicativo
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }