import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WebcamSnapshotComponent } from "./webcam-snapshot.component";
import { RouterModule } from '@angular/router';
@NgModule({
  imports: [CommonModule, RouterModule ],
  declarations: [WebcamSnapshotComponent],
  exports: [WebcamSnapshotComponent]
})
export class WebcamSnapshotModule { }
