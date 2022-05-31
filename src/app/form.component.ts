import { Component} from '@angular/core';
import { DataCollectorService } from './datacollector.service';
import {Router} from '@angular/router';


@Component({
  selector: 'form',
  templateUrl: './form.component.html',
  styleUrls: ['./app.component.scss'
              ]
})
export class FormComponent  {
  logoSrc = "../assets/eye_track_green.png"
  pjatkSrc = "../assets/pjatk_2.png"
  eyeSrc = "../assets/eye_1.png"

  public id: string;
  public email: string;
  public sex: number;
  public age: number;
  public visionDefect: number;
  public stress: number;
  public mood: number;
  public type: number = 0;
  public lateralization: number;
  public phase: number;
  public uprds: number;

  public showFormError : boolean = true;
  public validationText : string = "Proszę o wypełnienie formularza";


  constructor(private dataCollectorService : DataCollectorService, private router:Router){}

  async ngOnInit() {

      console.log("Form Data: " + JSON.stringify(this.dataCollectorService.formData));
      if(this.dataCollectorService.formData != undefined)
      {
        this.id = this.dataCollectorService.formData['id'];
        this.type = this.getTypeInt(this.dataCollectorService.formData['type']),
        this.lateralization = this.getLaterationInt(this.dataCollectorService.formData['lateralization']),
        this.phase = this.getPhaseInt(this.dataCollectorService.formData['phase']),
        this.uprds = this.dataCollectorService.formData['uprds'];
        this.email = this.dataCollectorService.formData['email'];
        this.sex = this.dataCollectorService.formData['sex'] == "F" ? 0 : 1;
        this.age = this.dataCollectorService.formData['age'];
        this.visionDefect = this.dataCollectorService.formData['visionDefect'];
        this.stress = this.dataCollectorService.formData['stress'];
        this.mood = this.dataCollectorService.formData['mood'];

      }
  }

  async onTypeSelectionChange()
  {
      if(this.type == 0)
      {
        this.lateralization = undefined;
        this.phase = undefined;
        this.uprds =undefined;

      }
  }

  getFormData()
  {
    if(this.sex == undefined && this.age == undefined)
    {
      this.validationText = "Proszę o wypełnienie formularza";
      this.showFormError = true;
    }
    else if(this.sex == undefined)
    {
      this.validationText = "Proszę podać płeć";
      this.showFormError = true;
    }
    else if(this.age == undefined)
    {
      this.validationText = "Proszę podać wiek";
      this.showFormError = true;
    }
    else if(this.age < 5 || this.age > 120 )
    {
      this.validationText = "Dopuszczalny zakres wieku to 5-120 lat";
      this.showFormError = true;
    }
    else if(this.visionDefect == undefined)
    {
      this.validationText = "Proszę wskazać czy jest wada wzroku";
      this.showFormError = true;
    }
    else if(this.stress == undefined)
    {
      this.validationText = "Proszę wskazać aktualny poziom stresu";
      this.showFormError = true;
    }
    else if(this.mood == undefined)
    {
      this.validationText = "Proszę wskazać aktualny nastrój";
      this.showFormError = true;
    }
    else
    {
      this.showFormError = false;

      this.dataCollectorService.formData = {
        "id": this.id,
        "type": this.getTypeString(this.type),
        "lateralization" : this.getLaterationString(this.lateralization),
        "phase": this.getPhaseString(this.phase),
        "uprds": this.uprds,
        "email": this.email,
        "sex" : this.sex == 0 ? "F" : "M",
        "age" : this.age,
        "visionDefect" : this.visionDefect,
        "stress" : this.stress,
        "mood" : this.mood
      };

      this.router.navigate(['/camera']);

    }

  }

  getTypeString(type : number)
  {
    if(type == 0) return "HC";
    else if(type == 1) return "PD";
    else if(type == 2) return "MSA";
    else if(type == 3) return "PSP";
    else if(type == 4) return "CBS";
    else if(type == 5) return "DLB";
    else if(type == 6) return "ET";
    else if(type == 7) return "Other";
    else return undefined;

  }

  getTypeInt(type : string)
  {
    if(type == "HC") return 0;
    else if(type == "PD") return 1;
    else if(type == "MSA") return 2;
    else if(type == "PSP") return 3;
    else if(type == "CBS") return 4;
    else if(type == "DLB") return 5;
    else if(type == "ET") return 6;
    else if(type == "Other") return 7;
    else return undefined;

  }

  getLaterationString(type : number)
  {
    if(type == 0) return "R";
    else if(type == 1) return "L";
    else return undefined;
  }

  getLaterationInt(type : string)
  {
    if(type == "R") return 0;
    else if(type == "L") return 1;
    else return undefined;
  }

  getPhaseString(phase : number)
  {
    if(phase == 0) return "MedOff";
    else if(phase == 1) return "MedOn";
    else if(phase == 2) return "DBS";
    else if(phase == 3) return "Pump";
    else return undefined;
  }

  getPhaseInt(phase : string)
  {
    if(phase == "MedOff") return 0;
    else if(phase == "MedOn") return 1;
    else if(phase == "DBS") return 2;
    else if(phase == "Pump") return 3;
    else return undefined;
  }

}
