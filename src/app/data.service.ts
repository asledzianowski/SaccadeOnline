import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private REST_API_SERVER = "https://brainonline.pja.edu.pl:8080";

  constructor(private httpClient: HttpClient) { }

  public testGetRequest(){
    return this.httpClient.get(this.REST_API_SERVER + "/test");
  }

  public testPostRequest(base64Data:string){
    return this.httpClient.post<any>(this.REST_API_SERVER + "/getfacedata", { base64_image_string : base64Data })
  }


  public testPostRequestIthID(id:string, base64Data:string){
    return this.httpClient.post<any>(this.REST_API_SERVER + "/getfacedataid",
    { base64_image_string : base64Data, image_id: id })
  }

  public testPostRequestImgRes(base64Data:string){
    return this.httpClient.post<any>(this.REST_API_SERVER + "/getfacedataandimg", { base64_image_string : base64Data })
  }

  public testPostRequestFaceAndEye(base64Data:string){
    return this.httpClient.post<any>(this.REST_API_SERVER + "/getfaceandeyedata", { base64_image_string : base64Data })
  }



  public postGazeData(base64Data:string)
  {
    return this.httpClient.post<any>(this.REST_API_SERVER + "/postgazedata", { base64_image_string : base64Data })
  }

  public postResultsData(calibrationData:Array<any>, experimentData:Array<any>, distanceFromScreen:number,
    screenResolution:Array<any>, screenWidthMM: number, formData: object)
  {
    return this.httpClient.post<any>(this.REST_API_SERVER + "/postresultsdata",
    { calibration_data: calibrationData, experiment_data: experimentData, distance_from_screen: distanceFromScreen,
      screen_resolution: screenResolution, screen_width_mm: screenWidthMM, form_data: formData})
  }

}
