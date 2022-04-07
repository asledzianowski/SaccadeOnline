import { Component} from '@angular/core';


@Component({
  selector: 'welcome',
  templateUrl: './hello.component.html',
  styleUrls: ['./app.component.scss'
              ]
})
export class HelloComponent  {
  logoSrc = "../assets/eye_track_green.png"
  pjatkSrc = "../assets/pjatk_2.png"
  eyeSrc = "../assets/eye_1.png"
  cameraAllowAccessSrc = "../assets/camera_allow_access.jpg"
  showInstruction: boolean = false;

  toogleInstruction()
  {
    this.showInstruction = this.showInstruction ? false : true;
  }

}
