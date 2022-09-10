import { Injectable, ElementRef } from '@angular/core';
import { DataService } from './data.service';


@Injectable({
  providedIn: 'root'
})
export class DataCollectorService
{

  private uncompletedCalibrationRequests:Array<any> = [];
  public get UncompletedCalibrationRequests(): Array<any> {return this.uncompletedCalibrationRequests};
  private calibrationData:Array<any> = [];
  public get CalibrationData(): Array<any> {return this.calibrationData};

  private uncompletedExperimentRequests:Array<any> = [];
  public get UncompletedExperimentRequests(): Array<any> {return this.uncompletedExperimentRequests}
  private experimentData:Array<any> = [];
  public get ExperimentData(): Array<any> {return this.experimentData};

  public formData: object;

  constructor(private dataService: DataService) {}

  public proceedCalibrationFrame(timeStamp: number, base64Image : string, currentState: number)
  {
    this.uncompletedCalibrationRequests.push(timeStamp);
    this.dataService.postGazeData(base64Image).subscribe((data: any[])=>{

      //console.log("DATA ERROR TEST: ", data );
      var dataItem = { "time": timeStamp, "gaze_x": data['gaze_x'],"gaze_y": data['gaze_y'],
      "marker": currentState, "state" : currentState};

      this.calibrationData.push(dataItem);
      this.removeValueFromArray(this.uncompletedCalibrationRequests, timeStamp);

    });
  }

  public proceedExperimentFrame(timeStamp: number, base64Image : string, currentState: number)
  {
    this.uncompletedExperimentRequests.push(timeStamp);
    this.dataService.postGazeData(base64Image).subscribe((data: any[])=>{

      var dataItem = { "time": timeStamp, "gaze_x": data['gaze_x'],"gaze_y": data['gaze_y'],
      "marker": currentState, "state" : currentState};

      this.experimentData.push(dataItem);
      this.removeValueFromArray(this.uncompletedExperimentRequests, timeStamp);
    });
  }

  private removeValueFromArray(array, item )
  {
    var index = array.indexOf(item);
    if (index !== -1)
    {
      array.splice(index, 1);
    }
  }

  public clearGazeData()
  {
    this.uncompletedCalibrationRequests = [];
    this.calibrationData = [];
    this.uncompletedExperimentRequests = [];
    this.experimentData = [];

  }

  public async proceedSaccadeResults(distanceFromScreen: number, screenResolution:Array<any>, screenWidthMM: number): Promise<any[]> {
    return new Promise((resolve, reject) => {

      this.dataService.postResultsData(this.calibrationData, this.experimentData, distanceFromScreen,
        screenResolution, screenWidthMM, this.formData).subscribe((data: any[])=>{

        console.log("RESULTS RECEIVED FROM API:")
        console.log("Estimation Data:")
        console.log(JSON.stringify(data['result_data']));
        console.log("Image Data:")
        console.log(JSON.stringify(data['result_image']));
        var saccadeResults = JSON.stringify(data['result_data']);
        console.log("Results applied: " + saccadeResults);
        console.log("Is Good:")
        console.log(JSON.stringify(data['result_is_good']));
        console.log("Power Spectrum Mean:")
        console.log(JSON.stringify(data['power_spectrum_mean']));
        console.log("Mean - SD Relation:")
        console.log(JSON.stringify(data['mean_sd_relation']));

        resolve(data);

      });

    })};

    public async proceedTestQuality(): Promise<any[]> {
      return new Promise((resolve, reject) => {

        this.dataService.postTestQualityData(this.calibrationData).subscribe((data: any[])=>{

          console.log("RESULTS RECEIVED FROM API:")
          console.log("Is Good:")
          console.log(JSON.stringify(data['is_good']));
          console.log("Power Spectrum Mean:")
          console.log(JSON.stringify(data['power_spectrum_mean']));
          console.log("Mean - SD Relation:")
          console.log(JSON.stringify(data['mean_sd_relation']));
          console.log("Frequency:")
          console.log(JSON.stringify(data['freq']));
          console.log("Image Data:")
          console.log(JSON.stringify(data['image']));

          resolve(data);

        });

      })};

    public async TestPromise(): Promise<string> {
      return new Promise((resolve, reject) => {

        this.dataService.testGetRequest().subscribe((data: any[])=>{

          var response = JSON.stringify(data);
          console.log(response);
          resolve(response);

        });

      })};

  }
