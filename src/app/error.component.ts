import { Component} from '@angular/core';
import { DataCollectorService } from './datacollector.service';
import {Router} from '@angular/router';


@Component({
  selector: 'error',
  templateUrl: './error.component.html',
  styleUrls: ['./app.component.scss'
              ]
})
export class ErrorComponent  {
  errorSrc = "../assets/error_icon.png"
  pjatkSrc = "../assets/pjatk_2.png"
  eyeSrc = "../assets/eye_1.png"




  constructor(private router:Router){}

  async ngAfterViewInit() {


  }

  redirectFormComponent()
  {
    window.location.href = location.protocol + '//' + location.host + '/form';
  }



}
