import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from "./app.component";
import { HelloComponent } from "./hello.component";
import { CameraComponent } from "./camera.component";
import { FormComponent } from "./form.component";
import { ErrorComponent } from "./error.component";
import { WebcamSnapshotModule } from "./webcam-snapshot/webcam-snapshot.module";


@NgModule({
  imports: [BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    WebcamSnapshotModule],
  declarations: [AppComponent, HelloComponent, CameraComponent, FormComponent, ErrorComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
