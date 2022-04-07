import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelloComponent } from "./hello.component";
import { CameraComponent } from "./camera.component";
const routes: Routes = [
  { path: 'welcome', component: HelloComponent },
  { path: 'camera', component: CameraComponent },
  { path: '',   redirectTo: '/welcome', pathMatch: 'full' }



];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }