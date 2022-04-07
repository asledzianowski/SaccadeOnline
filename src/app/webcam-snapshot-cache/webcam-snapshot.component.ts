import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { DataService } from '../data.service';

@Component({
  selector: "app-webcam-snapshot",
  templateUrl: "./webcam-snapshot.component.html",
  styleUrls: ["./webcam-snapshot.component.scss"]
})
export class WebcamSnapshotComponent implements AfterViewInit {

  constructor(private dataService: DataService) { }

  WIDTH = 640;
  HEIGHT = 480;

  @ViewChild("video")
  public video: ElementRef;

  @ViewChild("canvas")
  public canvas: ElementRef;

  @ViewChild("canvasConverter")
  public canvasConverter: ElementRef;

  private context: CanvasRenderingContext2D;
  private current_faceboxes: any[];
  private image: any;

  captures: string[] = [];
  error: any;
  isCaptured: boolean;

  image_storage = {}

  async ngAfterViewInit() {
    await this.setupDevices();
    this.context = this.canvas.nativeElement.getContext('2d');
    this.image = new Image();
  }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
          requestAnimationFrame(this.renderFrame.bind(this));
        } else {
          this.error = "You have no output video device";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  calculateSize(srcSize, dstSize) {
    var srcRatio = srcSize.width / srcSize.height;
    var dstRatio = dstSize.width / dstSize.height;
    if (dstRatio > srcRatio) {
      return {
        width:  dstSize.height * srcRatio,
        height: dstSize.height
      };
    } else {
      return {
        width:  dstSize.width,
        height: dstSize.width / srcRatio
      };
    }
  }

  getPngDimensions(base64) {
    const header = atob(base64.slice(0, 50)).slice(16,24)
    const uint8 = Uint8Array.from(header, c => c.charCodeAt(0))
    const dataView = new DataView(uint8.buffer)

    return {
      width: dataView.getInt32(0),
      height: dataView.getInt32(4)
    }
  }


  renderFrame() {

    //this.drawCanvasImage(this.video.nativeElement, this.canvas.nativeElement.width, this.canvas.nativeElement.height)
    requestAnimationFrame(this.renderFrame.bind(this));

    var video_element = this.video.nativeElement
    this.canvas.nativeElement.width = this.canvas.nativeElement.scrollWidth;
    this.canvas.nativeElement.height = this.canvas.nativeElement.scrollHeight;
    if (video_element.readyState === video_element.HAVE_ENOUGH_DATA) {
      var videoSize = { width: video_element.videoWidth, height: video_element.videoHeight };
      var canvasSize = { width: this.canvas.nativeElement.width, height: this.canvas.nativeElement.height };
      var renderSize = this.calculateSize(videoSize, canvasSize);
      var xOffset = (canvasSize.width - renderSize.width) / 2;
      var base64Image = this.convertToBase64Image(video_element,
        this.canvas.nativeElement.width, this.canvas.nativeElement.height)
      //console.log(base64Image)
      this.dataService.testPostRequest(base64Image).subscribe((data: any[])=>{

        // console.log("#### FACE BOXES #### : " + data['face_boxes']);
        // console.log("#### face_img_base_64 #### : " + data['face_img_base_64']);

        this.current_faceboxes = data['face_boxes'];

      })


      this.drawCanvasImageWithFaceRects(video_element, this.canvas.nativeElement.width,
        this.canvas.nativeElement.height, this.current_faceboxes )

    }
  }

  drawCanvasImageWithFaceRects(image: any, width: number, height: number, face_boxes: any[]) {

    this.context.drawImage(image, 0, 0, width, height);

    if(face_boxes != null)
    {

      for (let i = 0; i < face_boxes.length; i++) {
        var current_face_box = face_boxes[i];
        var xmin = current_face_box[0];
        var ymin = current_face_box[1];
        var box_width = current_face_box[2] - xmin;
        var box_height = current_face_box[3] - ymin;
        //1.7

        this.context.beginPath();
        this.context.rect(xmin, ymin, box_width, box_height);
        this.context.lineWidth = 5;
        this.context.strokeStyle = 'green';
        this.context.stroke();
        this.context.save()
      }
    }

  }

  drawCanvasImage(image: any, width: number, height: number) {

    this.context.clearRect(0, 0, width, height);
    this.context.drawImage(image, 0, 0, width, height);
  }

  // drawCanvasImage(image: any, width: number, height: number) {
  //   this.canvas.nativeElement
  //     .getContext("2d")
  //     .drawImage(image, 0, 0, width, height);
  // }

  convertToBase64Image(image: any, width: number, height: number) {
    this.canvasConverter.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, width, height);
      return this.canvasConverter.nativeElement.toDataURL();
  }

  capture() {
    this.drawImageToCanvas(this.video.nativeElement);
    this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));
    this.isCaptured = true;
  }

  removeCurrent() {
    this.isCaptured = false;
  }

  setPhoto(idx: number) {
    this.isCaptured = true;
    var image = new Image();
    image.src = this.captures[idx];
    this.drawImageToCanvas(image);
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }
}
