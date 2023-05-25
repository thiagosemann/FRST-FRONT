import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LogGastosComponent } from './log-gastos.component';

const routes: Routes = [
  {
    path: '',
    component: LogGastosComponent
  }
];

@NgModule({
  declarations: [
    LogGastosComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LogGastosModule {}