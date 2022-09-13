import { Injectable, ElementRef } from '@angular/core';
import { DataService } from './data.service';


@Injectable({
  providedIn: 'root'
})
export class VideoService
{

  private video: ElementRef;
  private videoCanvas: ElementRef;
  private videoCanvasContext: CanvasRenderingContext2D;
  private canvasConverter: ElementRef;
  private current_faceboxes: any[];
  private current_eyeboxes: any[];
  private current_eyecenters: any[];
  private frameHeight: number;
  private frameWidth: number;

  constructor(private dataService: DataService,) {

  }

  public initialize(video: ElementRef, videoCanvas: ElementRef, canvasConverter: ElementRef,
    frameWidth: number, frameHeight : number, )
  {
    this.video = video;
    this.videoCanvas = videoCanvas;
    this.videoCanvasContext =  this.videoCanvas.nativeElement.getContext('2d');;
    this.canvasConverter = canvasConverter;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;

    this.current_faceboxes = [];
    this.current_eyeboxes = [];
    this.current_eyecenters = [];
  }

  public proceedVideoFrame(base64Image : string)
  {
    this.dataService.testPostRequestFaceAndEye(base64Image).subscribe((data: any[])=>{

      // console.log("#### FACE BOXES #### : " + data['face_boxes']);
      // // console.log("#### face_img_base_64 #### : " + data['face_img_base_64']);
      // console.log("face_eye_boxes: " + data['face_eye_boxes']);
      // console.log("face_eye_centers: " + data['face_eye_centers']);
      if(data != null)
      {
        this.current_faceboxes = data['face_boxes'];
        this.current_eyeboxes = data['face_eye_boxes'];
        this.current_eyecenters = data['face_eye_centers'];
      }
      else
      {
        this.current_faceboxes = undefined
      }

    })


    if(this.current_faceboxes != undefined && this.current_eyeboxes != undefined
      && this.current_eyecenters != undefined)
    {
      this.drawCanvasImageWithFaceRects(this.video.nativeElement,  this.video.nativeElement.width, this.frameHeight,
        this.current_faceboxes, this.current_eyeboxes, this.current_eyecenters);
    }
    else
    {
      this.drawCanvasImage(this.video.nativeElement, this.frameWidth, this.frameHeight);
    }
  }


  private drawCanvasImageWithFaceRects(image: any, width: number, height: number, face_boxes: any[],
  eye_boxes: any[], eye_centers: any[]) {

    this.videoCanvasContext.drawImage(image, 0, 0, width, height);

    if(face_boxes != null)
    {

      for (let i = 0; i < face_boxes.length; i++) {
        var current_face_box = face_boxes[i];
        var face_xmin = current_face_box[0];
        var face_ymin = current_face_box[1];
        var face_box_width = current_face_box[2] - face_xmin;
        var face_box_height = current_face_box[3] - face_ymin;
        this.drawViewFinderShape(face_xmin, face_ymin, face_box_width, face_box_height);


        var current_eyeboxes =  eye_boxes[i];

        if(current_eyeboxes != undefined)
        {
          for (let j = 0; j < current_eyeboxes.length; j++) {
            this.videoCanvasContext.strokeStyle = 'orange';
            var current_eyebox = current_eyeboxes[j];
            var eye_xmin = current_eyebox[0] + face_xmin;
            var eye_ymin = current_eyebox[1] + face_ymin;
            var eye_box_width = current_eyebox[2] + face_xmin - eye_xmin;
            var eye_box_height = current_eyebox[3] + face_ymin - eye_ymin;

            this.videoCanvasContext.beginPath();
            //this.context.lineWidth = 3;
            this.drawViewFinderShape(eye_xmin, eye_ymin, eye_box_width, eye_box_height);
            //this.context.strokeStyle = 'green';
            this.videoCanvasContext.stroke();

          }

        var current_eyecenters = eye_centers[i]

        if(current_eyecenters != undefined)

          for (let k = 0; k < current_eyecenters.length; k++) {
            var current_eyecenter = current_eyecenters[k];
            var eye_center_x = current_eyecenter[0] + face_xmin
            var eye_center_y = current_eyecenter[1] + face_ymin
            this.videoCanvasContext.strokeRect(eye_center_x,eye_center_y,1,1)
            this.videoCanvasContext.stroke();
          }

          if(current_eyecenters.length >= 2)
          {
            var eyeXDistance = Math.abs(current_eyecenters[0][0] - current_eyecenters[1][0]);
            var eyeYDistance = Math.abs(current_eyecenters[0][1] - current_eyecenters[1][1]);

            var fontSize = eyeXDistance / 2.6;
            this.videoCanvasContext.font = 'bold ' + fontSize.toString() + 'px tahoma';

            var positioningText = 'DOBRZE ' + eyeXDistance;
            this.videoCanvasContext.fillStyle = "green";
            if(eyeXDistance > 57)
            {
              positioningText = 'ODDAL SIĘ ' + eyeXDistance;
              this.videoCanvasContext.fillStyle = "red";
            }
            else if(eyeXDistance < 51)
            {
              positioningText = 'PRZYBLIŻ SIĘ ' + eyeXDistance;
              this.videoCanvasContext.fillStyle = "red";
            }



            if(eyeYDistance > 5)
            {
              this.videoCanvasContext.fillStyle = "red";
              this.videoCanvasContext.fillText("WYPROSTUJ GŁOWĘ", face_xmin, face_ymin - 5); //(fontSize + 2)
            }
            else
            {
              this.videoCanvasContext.fillText(/*eyeYDistance.toString() + " " +  */positioningText, face_xmin, face_ymin - 5);
            }
          }

        }
      }
    }

  this.videoCanvasContext.save()
}

drawViewFinderShape(xmin, ymin, box_width, box_height){

  this.videoCanvasContext.lineWidth = 4;
  this.videoCanvasContext.strokeStyle = 'Cornsilk';
  var lineLength = (box_width /5);
  this.videoCanvasContext.beginPath();
  this.videoCanvasContext.moveTo(xmin, ymin);
  this.videoCanvasContext.lineTo(xmin + lineLength, ymin);
  this.videoCanvasContext.moveTo(xmin, ymin - 2);
  this.videoCanvasContext.lineTo(xmin, ymin + lineLength);
  this.videoCanvasContext.stroke();

  this.videoCanvasContext.beginPath();
  var oppositeX = xmin + box_width
  this.videoCanvasContext.moveTo(oppositeX, ymin);
  this.videoCanvasContext.lineTo(oppositeX - lineLength, ymin);
  this.videoCanvasContext.moveTo(oppositeX, ymin - 2);
  this.videoCanvasContext.lineTo(oppositeX, ymin + lineLength);
  this.videoCanvasContext.stroke();

  this.videoCanvasContext.beginPath();
  var oppositeY = ymin + box_height;
  this.videoCanvasContext.moveTo(xmin, oppositeY);
  this.videoCanvasContext.lineTo(xmin + lineLength, oppositeY);
  this.videoCanvasContext.moveTo(xmin, oppositeY + 2);
  this.videoCanvasContext.lineTo(xmin, oppositeY - lineLength);
  this.videoCanvasContext.stroke();

  this.videoCanvasContext.beginPath();
  this.videoCanvasContext.moveTo(oppositeX, oppositeY);
  this.videoCanvasContext.lineTo(oppositeX - lineLength, oppositeY);
  this.videoCanvasContext.moveTo(oppositeX, oppositeY + 2);
  this.videoCanvasContext.lineTo(oppositeX, oppositeY - lineLength);
  this.videoCanvasContext.stroke();
}

drawCanvasImage(image: any, width: number, height: number) {

    this.videoCanvasContext.drawImage(image, 0, 0, width, height);
}

convertToBase64Image(image: any, width: number, height: number) {
    this.canvasConverter.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, width, height);
      return this.canvasConverter.nativeElement.toDataURL();
}

}
