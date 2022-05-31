import { Injectable } from '@angular/core';
import { DrawingService } from './drawing.service';


@Injectable({
  providedIn: 'root'
})
export class StimuliService
{

  private drawingService: DrawingService;

  private currentMarkerState : number  = 0;
  public get CurrentMarkerState(): number {return this.currentMarkerState}

  private calibrationSaccadeCount : number = 0;
  private calibrationSaccadeLimit : number = 2;
  private calibrationFixationTime : number = 4000;

  private experimentSaccadeCount : number = 0;
  private experimentSaccadeLimit : number = 11;
  private experimentFixationTime : number = 1000;

  private currentIntervalId : any = null;

  private isCalibrationFinished : boolean = false;
  private isExperimentFinished : boolean = false;
  public get IsCalibrationFinished(): boolean {return this.isCalibrationFinished}
  public get IsExperimentFinished(): boolean {return this.isExperimentFinished}


  constructor() {}

  public initialize(drawingService : DrawingService)
  {
    this.drawingService = drawingService;
  }


  manageCalibrationDisplay(  )
  {
    this.stopTimer();
    console.log("Calibration State: " + this.currentMarkerState);
    if(this.calibrationSaccadeCount < this.calibrationSaccadeLimit)
    {
      switch(this.currentMarkerState)
      {
         case 0:
          this.currentMarkerState = 1
          this.drawingService.drawTargetRight();
          break;
         case 1:
          this.currentMarkerState = -1
          this.drawingService.drawTargetLeft();
          break;

      }

      this.calibrationSaccadeCount++;
      this.currentIntervalId = setInterval(this.manageCalibrationDisplay.bind(this), this.calibrationFixationTime);
    }
    else
    {
      this.isCalibrationFinished = true;
    }

  }

  public runCalibration()
  {
    this.isCalibrationFinished = false;
    this.currentMarkerState = 0;
    this.drawingService.drawFixationPoint();
    this.currentIntervalId = setInterval(this.manageCalibrationDisplay.bind(this), this.calibrationFixationTime);
  }

  manageExperimentDisplay(  )
  {
    this.stopTimer();
    console.log("Experiment State: " + this.currentMarkerState);

    if(this.experimentSaccadeCount < this.experimentSaccadeLimit )
    {
      var time = this.experimentFixationTime;

      if(this.currentMarkerState == 0 )
      {
        this.experimentSaccadeCount++;
        //The maximum is exclusive and the minimum is inclusive
        this.currentMarkerState = this.getRandomInt(1,3);
        //adjusting random value for marker position
        if(this.currentMarkerState == 2)
        {
          this.currentMarkerState = -1;
        }
      }
      else
      {
        //The maximum is exclusive and the minimum is inclusive
        time = this.getRandomInt(1000,2001);
        this.currentMarkerState = 0;
      }

      switch(this.currentMarkerState)
      {
         case 0:
          this.drawingService.drawFixationPoint();
          break;
         case 1:
          this.drawingService.drawTargetRight();
          break;
        case -1:
          this.drawingService.drawTargetLeft();
          break;
      }

      this.currentIntervalId = setInterval(this.manageExperimentDisplay.bind(this), time);
    }
    else
    {
      this.isExperimentFinished = true;
    }

  }

  public runExperiment()
  {
    this.isExperimentFinished = false;
    this.currentMarkerState = 0;
    this.drawingService.drawFixationPoint();
    this.currentIntervalId = setInterval(this.manageExperimentDisplay.bind(this), this.experimentFixationTime);
  }

  stopTimer() {
    clearInterval(this.currentIntervalId);
    this.currentIntervalId = null;
  }

  getRandomInt(min : number, max : number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    //The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min) + min);
  }

}
