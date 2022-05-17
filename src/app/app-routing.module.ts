import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelloComponent } from "./hello.component";
import { CameraComponent } from "./camera.component";
import { FormComponent } from "./form.component";
import { ErrorComponent } from "./error.component";
const routes: Routes = [
  { path: 'welcome', component: HelloComponent },
  { path: 'form', component: FormComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'camera', component: CameraComponent },
  { path: '',   redirectTo: '/welcome', pathMatch: 'full' }



];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
