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
  przyblizSrc = "../assets/przybliz.jpg"
  oddalSrc = "../assets/oddal.jpg"
  wyprostujSrc = "../assets/wyprostuj.jpg"
  dobrzeSrc = "../assets/dobrze.jpg"
  pointSrc = "../assets/point.jpg"
  wynikiSrc = "../assets/wyniki.jpg"
  showInstruction: boolean = false;

  toogleInstruction()
  {
    this.showInstruction = this.showInstruction ? false : true;
  }

}
