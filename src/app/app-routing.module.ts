import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './shared/service/authGuard';


import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LandingComponent } from './landing/landing.component';
import { ContentComponent } from './content/content.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { QrCodeScannerComponent } from './content/qr-code-scanner/qr-code-scanner.component';
import { LiberacaoMaquinasComponent } from './content/liberacao-maquinas/liberacao-maquinas.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent},
  { path: 'landing', component: LandingComponent,canActivate: [AuthGuardService]  },
  { path: 'content', component: ContentComponent, canActivate: [AuthGuardService] },
  { path: 'qrCode', component: QrCodeScannerComponent, canActivate: [AuthGuardService] },
  { path: 'maquinas/:id', component: LiberacaoMaquinasComponent,canActivate: [AuthGuardService] }

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