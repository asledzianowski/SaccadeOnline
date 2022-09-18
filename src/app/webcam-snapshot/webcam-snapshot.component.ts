import { AfterViewInit, Component, ElementRef, ViewChild, HostListener, NgZone  } from "@angular/core";
import {Router} from '@angular/router';
import { DrawingService } from '../drawing.service';
import { VideoService } from '../video.service';
import { StimuliService } from '../stimuli.service';
import { DataCollectorService } from '../datacollector.service';
import { ThisReceiver } from "@angular/compiler";

export enum State {NONE,CONFIG,TESTQUALITY,CALIBRATION,EXPERIMENT,RESULTS,QUALITYRESULTS}

@Component({
  selector: "app-webcam-snapshot",
  templateUrl: "./webcam-snapshot.component.html",
  styleUrls: ["./webcam-snapshot.component.scss"],
  host: {'(window:resize)': 'onResize($event)'}
})
export class WebcamSnapshotComponent implements AfterViewInit {

  logoSrc = "../assets/eye_track_green.png"
  loaderImgSrc = "../assets/loader_white.gif"
  testChartSrc = "../assets/chart_mock.png"
  qualitySuccessSrc = "../assets/quality_success.png"
  qualityFailedSrc = "../assets/quality_failed.png"
  qualityLampSrc = "../assets/quality_lamp.png"
  qualityEyeSrc = "../assets/quality_eye.png"
  qualityGlassesSrc = "../assets/quality_glasses.png"

  VIDEO_WIDTH = 640;
  VIDEO_HEIGHT = 480;
  initialTime: Date;

  @ViewChild("dpi")
  public dpi: ElementRef;

  @ViewChild("video")
  public video: ElementRef;

  @ViewChild("video_canvas")
  public video_canvas: ElementRef;

  @ViewChild("canvasConverter")
  public canvasConverter: ElementRef;

  @ViewChild("experiment_canvas")
  public experimentCanvas: ElementRef;

  //fix for angular error (style bindings in html not working when called from requestVideoFrameCallback)
  @ViewChild("experimentCanvasDiv")
  public experimentCanvasDiv: ElementRef;
  //fix for angular error (style bindings in html not working when called from requestVideoFrameCallback)
  @ViewChild("resultsDiv")
  public resultsDiv: ElementRef;

  @ViewChild("testQualityDiv")
  public testQualityDiv: ElementRef;

  @ViewChild("saccadeList")
  public saccadeList: ElementRef;

  @ViewChild("resultImage")
  public resultImage: ElementRef;

  public experimentDataFPS: number;
  public cameraFPS: number;
  public saccadeResultsId : string;
  public saccadeResults : any[];
  public saccadeResultsFromAPI : string;
  public chartSource : string;
  public saccadeResultsIsGood: boolean;
  public saccadeResultsPowerSpectrumMean: number;
  public saccadeResultsMeanSdRelation: number;

  public resultsMock : any[] = [{"Start":1428,"End":1597,"MarkerChange":1190,"LatencyFrameCount":3,"DurationFrameCount":2,"Latency":238,"Duration":169,"Distance":null,"Amplitude":0.21,"AvgVelocity":60.99,"MaxVelocity":200.10,"Gain":10.8},{"Start":4392,"End":4472,"MarkerChange":4315,"LatencyFrameCount":1,"DurationFrameCount":1,"Latency":77,"Duration":80,"Distance":null,"Amplitude":0.15,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},{"Start":5666,"End":5745,"MarkerChange":5431,"LatencyFrameCount":3,"DurationFrameCount":1,"Latency":235,"Duration":79,"Distance":null,"Amplitude":0.19,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},{"Start":7029,"End":7109,"MarkerChange":6787,"LatencyFrameCount":3,"DurationFrameCount":1,"Latency":242,"Duration":80,"Distance":null,"Amplitude":0.13,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},{"Start":9361,"End":9669,"MarkerChange":9275,"LatencyFrameCount":1,"DurationFrameCount":4,"Latency":86,"Duration":308,"Distance":null,"Amplitude":0.18,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},{"Start":10394,"End":10548,"MarkerChange":10316,"LatencyFrameCount":1,"DurationFrameCount":2,"Latency":78,"Duration":154,"Distance":null,"Amplitude":0.06,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},
  {"Start":1428,"End":1597,"MarkerChange":1190,"LatencyFrameCount":3,"DurationFrameCount":2,"Latency":238,"Duration":169,"Distance":null,"Amplitude":0.21,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},{"Start":4392,"End":4472,"MarkerChange":4315,"LatencyFrameCount":1,"DurationFrameCount":1,"Latency":77,"Duration":80,"Distance":null,"Amplitude":0.15,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},{"Start":5666,"End":5745,"MarkerChange":5431,"LatencyFrameCount":3,"DurationFrameCount":1,"Latency":235,"Duration":79,"Distance":null,"Amplitude":0.19,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},{"Start":7029,"End":7109,"MarkerChange":6787,"LatencyFrameCount":3,"DurationFrameCount":1,"Latency":242,"Duration":80,"Distance":null,"Amplitude":0.13,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},{"Start":9361,"End":9669,"MarkerChange":9275,"LatencyFrameCount":1,"DurationFrameCount":4,"Latency":86,"Duration":308,"Distance":null,"Amplitude":0.18,"AvgVelocity":null,"MaxVelocity":null,"Gain":null},{"Start":10394,"End":10548,"MarkerChange":10316,"LatencyFrameCount":1,"DurationFrameCount":2,"Latency":78,"Duration":154,"Distance":null,"Amplitude":0.06,"AvgVelocity":null,"MaxVelocity":null,"Gain":null}]


  //Show face marker (configuration adjustments) on every 10 frame 
  public faceMarkersShowOnFrameLimit : number = 10;
  public faceMarkersShowOnFrameCount : number = 0;

  public framesLeftTotal: number;

  public screenWidth: number;
  public screenHeight: number;

  public currentState : State;
  public showCanvas: boolean;

  public showConfiguration: boolean;
  public showStimuli: boolean;
  public showResults: boolean;
  public showResultsLoader: boolean = true;
  public showSaccadeResults: boolean = false;


  public showTestQualityLoader: boolean = true;
  public showTestQualitResults: boolean = false;
  public testQualityIsGood: boolean;
  public testQualityPowerSpectrumMean: number;
  public testQualityMeanSdRelation: number;
  public testQualityFrequency: number;

  private document: any;
  private documentElement: any;
  error: any;

  private resultsTimerId : any = null;

  paintCount : number = 0;
  startTime : number = 0.0;
  fps : string ;

  public distFromScreenInCm: number = 86;
  public targetToFixDistanceInDeg: number = 8;

  constructor(private drawingService : DrawingService, private videoService : VideoService,
    private stimuliService : StimuliService, private dataCollectorService : DataCollectorService,
    private zone:NgZone, private router: Router) {
    this.showCanvas = true;
  }


  ngOnInit(){
    this.router.events.subscribe(event =>{
       this.stopCamera();
    })
 }

onResize(event){
  //event.target.innerWidth; // window width
  this.screenWidth =  window.innerWidth ; //event.target.innerWidth ; //* window.devicePixelRatio;
  this.screenHeight = window.innerHeight ; //event.target.innerHeight ; //* window.devicePixelRatio;
  let screenWidthMM = this.getScreenWidthInMM();

  //this.VIDEO_HEIGHT = (this.screenHeight / 5) * 3;
  //this.VIDEO_WIDTH = (this.VIDEO_HEIGHT / 4) * 5;

  this.drawingService.initialize(this.experimentCanvas.nativeElement.getContext('2d'),
    this.screenWidth, this.screenHeight, this.distFromScreenInCm, this.targetToFixDistanceInDeg, screenWidthMM);

  // this.videoService.initialize(this.video, this.video_canvas, this.canvasConverter,
  //   this.VIDEO_WIDTH, this.VIDEO_HEIGHT);
}
  async ngAfterViewInit() {

    //Redirect with reload (no need to reinitialize objects)
    if(this.dataCollectorService.formData == undefined)
    {
      //Comment while developing
      window.location.href = location.protocol + '//' + location.host + '/form';
    }

    await this.setupDevices();
    this.initializeServices();

    //COMMENT FOR TESTS
    this.setUpConfigState();

    //UNCOMMENT FOR TESTS
    //this.testResultPanel();
    //this.testQualityResultPanel()

    this.documentElement = document.documentElement;
    this.document = document;

  }

  testResultPanel()
  {
    this.setUpResultState();
    this.chartSource = this.testChartSrc;
    this.saccadeResults = this.resultsMock;
    this.showResultsLoader = true;
    this.showSaccadeResults = true;
    this.saccadeResultsId = '102030'
    this.experimentDataFPS = 30;
    this.cameraFPS = 30;
  }

  testQualityResultPanel()
  {
    console.log("Start testQualityResultPanel")
    this.setUpTestQualityResultState();
    this.testQualityIsGood =  true;
    this.testQualityMeanSdRelation = 9999;
    this.testQualityPowerSpectrumMean = 999;
    this.showTestQualityLoader = true;
    this.showTestQualitResults = true;
    this.experimentDataFPS = 30;
    this.cameraFPS = 30;
  }

  initializeServices(){

    // define drawing defaults
	  console.log("window.innerWidth CM", (window.innerWidth / 96) * 2.54)
    console.log("window.innerWidth MM", Math.round(window.innerWidth / 96) * 25.4);
    this.screenWidth =  window.innerWidth ; //* window.devicePixelRatio;
    this.screenHeight = window.innerHeight ; //* window.devicePixelRatio;

    // this.VIDEO_HEIGHT = (this.screenHeight / 5) * 3;
    // this.VIDEO_WIDTH = (this.VIDEO_HEIGHT / 4) * 5;

    console.log("screenHeight: ", this.screenHeight);
    let screenWidthMM = this.getScreenWidthInMM();
    this.drawingService.initialize(this.experimentCanvas.nativeElement.getContext('2d'),
    this.screenWidth, this.screenHeight, this.distFromScreenInCm, this.targetToFixDistanceInDeg, screenWidthMM);

    this.videoService.initialize(this.video, this.video_canvas, this.canvasConverter,
      this.VIDEO_WIDTH, this.VIDEO_HEIGHT);

    this.stimuliService.initialize(this.drawingService);
    this.dataCollectorService.clearGazeData();

  }

  getScreenWidthInMM()
  {
    //https://ryanve.com/_php/airve/chromosome/request.php?request=lab/resolution/#units
    //96⁢px = 1⁢in = 2.54⁢cm = 25.4mm
    return (window.innerWidth / 96) * 25.4;
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if(this.currentState == State.CONFIG)
    {
      //this.openFullscreen();
      // this.screenWidth =  window.outerWidth ;
      // this.screenHeight = window.outerHeight ;
      // this.initializeServices();
      this.startSaccadeTest();
    }
    else {
      //this.closeFullscreen();
      this.reloadPage();
    }
  }

  setUpConfigState()
  {

    this.currentState = State.CONFIG;
    this.showConfiguration = true;
    this.showStimuli = false;
    this.showResults = false;
    this.video_canvas.nativeElement.width = this.VIDEO_WIDTH;
    this.video_canvas.nativeElement.height = this.VIDEO_HEIGHT;
  }

  startSaccadeTest()
  {
    this.setUpCalibrationState();
  }

  startQualityTest()
  {
    this.setUpTestQuailtyState();
  }

  setUpTestQuailtyState()
  {
    this.currentState = State.TESTQUALITY;
    this.showConfiguration = false;
    this.showStimuli = true;
    this.showTestQualitResults = false;
    this.resetStopWatch();
    this.stimuliService.runCalibration();
  }


  setUpCalibrationState()
  {
    this.currentState = State.CALIBRATION;
    this.showConfiguration = false;
    this.showStimuli = true;
    this.showResults = false;
    this.resetStopWatch();
    this.stimuliService.runCalibration();
  }

  setUpExperimentState()
  {
    this.currentState = State.EXPERIMENT;
    this.showConfiguration = false;
    this.showStimuli = true;
    this.showResults = false;
    this.resetStopWatch();
    this.stimuliService.runExperiment();
  }


  setUpResultState()
  {
    this.showConfiguration = false;
    this.currentState = State.RESULTS;
    //fix for angular error (style bindings in html not working when called from requestVideoFrameCallback)
    this.experimentCanvasDiv.nativeElement.style["display"] = "none";
    this.resultsDiv.nativeElement.style["display"] = "block";
    this.resultsDiv.nativeElement.style["background-color"] = "gray !important";
    this.resultsDiv.nativeElement.style["height"] =  this.screenWidth + "px";
    this.stopCamera();
  }

  setUpTestQualityResultState()
  {
    this.showConfiguration = false;
    this.currentState = State.QUALITYRESULTS;
    //fix for angular error (style bindings in html not working when called from requestVideoFrameCallback)

    this.experimentCanvasDiv.nativeElement.style["display"] = "none";
    this.testQualityDiv.nativeElement.style["display"] = "block";
    this.testQualityDiv.nativeElement.style["background-color"] = "gray !important";
    this.testQualityDiv.nativeElement.style["height"] =  this.screenWidth + "px";

    this.stopCamera();
  }

  //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        if (stream) {
          console.log("Form Data: " + JSON.stringify(this.dataCollectorService.formData));
          this.cameraFPS = stream.getVideoTracks()[0].getSettings().frameRate
          console.log("CAMERA FRAME RATE: " + this.cameraFPS);
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
          this.video.nativeElement.requestVideoFrameCallback(this.renderFrame.bind(this))
        } else {
          this.error = "You have no output video device";
          console.log(this.error);
        }
      } catch (e) {
        this.error = e;
        console.log("You have no camera device")
      }
    }
    else
    {
      console.log("You have no media devices")
    }
  }

  async stopCamera() {
    this.video.nativeElement.srcObject.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  //https://wicg.github.io/video-rvfc/
  //https://web.dev/requestvideoframecallback-rvfc/
  //should be changed in future to:
  //https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API
  //https://www.npmjs.com/package/@types/dom-mediacapture-transform
  //https://web.dev/mediastreamtrack-insertable-media-processing/

  //renderFrame = (now, metadata) => {
async renderFrame() {
    // console.log("Now: " + now)
    // console.log("State: " + State[this.currentState]);

    // if (this.startTime === 0.0) {
    //   this.startTime = now;
    // }
    // const elapsed = (now - this.startTime) / 1000.0;
    // this.fps = (++this.paintCount / elapsed).toFixed(3);
    // console.log("Current FPS: " + this.fps)

    if(this.currentState != State.RESULTS && this.currentState != State.QUALITYRESULTS)
    {
      // or requestAnimationFrame
      this.video.nativeElement.requestVideoFrameCallback(this.renderFrame.bind(this));
    }

    var video_element = this.video.nativeElement
    if (video_element.readyState === video_element.HAVE_ENOUGH_DATA) {
      //var videoSize = { width: video_element.videoWidth, height: video_element.videoHeight };
      //var canvasSize = { width: this.video_canvas.nativeElement.width, height: this.video_canvas.nativeElement.height };
      //var renderSize = this.calculateSize(videoSize, canvasSize);
      //var xOffset = (canvasSize.width - renderSize.width) / 2;

      var base64Image = this.convertToBase64Image(video_element, this.video_canvas.nativeElement.width,
        this.video_canvas.nativeElement.height)

      switch(this.currentState)
      {
        case State.CONFIG:
          
          if(this.faceMarkersShowOnFrameCount < this.faceMarkersShowOnFrameLimit)
          {
            this.faceMarkersShowOnFrameCount++ 
          }
          else
          {
            this.videoService.proceedVideoFrame(base64Image);
            this.faceMarkersShowOnFrameCount = 0;
            //console.log("ProceedVideoFrame: " + now)
          }
          break;
        case State.TESTQUALITY:
          if(this.stimuliService.IsCalibrationFinished == true)
          {
            this.setUpTestQualityResultState();
          }
          else
          {
            this.dataCollectorService.proceedCalibrationFrame(this.getCurrentTimeStamp(),
                  base64Image, this.stimuliService.CurrentMarkerState);
          }
          break;
        case State.CALIBRATION:
          if(this.stimuliService.IsCalibrationFinished == true)
          {
            this.setUpExperimentState();
          }
          else
          {
            this.dataCollectorService.proceedCalibrationFrame(this.getCurrentTimeStamp(),
                  base64Image, this.stimuliService.CurrentMarkerState);
          }
          break;
        case State.EXPERIMENT:
          if(this.stimuliService.IsExperimentFinished == true)
          {
            this.setUpResultState();
          }
          else
          {
            console.log("Left calibration requests: "
        + this.dataCollectorService.UncompletedCalibrationRequests.length);
        console.log("Left experiment requests: "
        + this.dataCollectorService.UncompletedExperimentRequests.length);

            this.dataCollectorService.proceedExperimentFrame(this.getCurrentTimeStamp(),
            base64Image, this.stimuliService.CurrentMarkerState);
          }
          break;
        case State.RESULTS:
          await this.proceedResults();
          break;
        case State.QUALITYRESULTS:
            this.showTestQualityLoader = true;
            await this.proceedTestQuality();
            break;

      }

    }
  }

  public async proceedTestQuality()
  {
    if(this.resultsTimerId != null) clearInterval(this.resultsTimerId);

    var isAllDataCollected = this.IsAllDataCollected();
    if(isAllDataCollected == false)
    {
      this.resultsTimerId = setInterval(this.proceedTestQuality.bind(this), 1000);
    }
    else
    {
      console.log("Calibration Data:")
      console.log(JSON.stringify(this.dataCollectorService.CalibrationData));

      console.log("Sending results");


      var data = await this.dataCollectorService.proceedTestQuality();

      console.log("DATA RECEIVED:", data);

      this.zone.run(() => {
        this.testQualityIsGood = data['is_good'];
        this.testQualityPowerSpectrumMean = data['power_spectrum_mean'];
        this.testQualityMeanSdRelation = data['mean_sd_relation'];
        this.testQualityFrequency = data['freq'];

        this.showTestQualityLoader = false;
        this.showTestQualitResults = true;

        this.dataCollectorService.clearGazeData();
      });


    }
  }

  public async proceedResults()
  {
    if(this.resultsTimerId != null) clearInterval(this.resultsTimerId);

    var isAllDataCollected = this.IsAllDataCollected();
    if(isAllDataCollected == false)
    {
      this.resultsTimerId = setInterval(this.proceedResults.bind(this), 1000);
    }
    else
    {
      // console.log("Calibration Data:")
      // console.log(JSON.stringify(this.dataCollectorService.CalibrationData));
      // console.log("Experiment Data:")
      // console.log(JSON.stringify(this.dataCollectorService.ExperimentData));

      console.log("Sending results");

	    var screenWidthMM = this.getScreenWidthInMM();
      var screenResolution = [this.screenWidth, this.screenHeight];
      var data = await this.dataCollectorService.proceedSaccadeResults(this.distFromScreenInCm, screenResolution, screenWidthMM);

      console.log("DATA RECEIVED:", data);

      this.zone.run(() => {
        this.saccadeResultsId = data['result_id'];
        this.saccadeResults = data['result_data'];
        this.chartSource = "data:image/png;base64," + data['result_image'];
        this.experimentDataFPS = data['result_freq'];
        console.log("Data FREQUENCY: " + data['result_freq'])
        console.log("Data fps: " + this.experimentDataFPS)
        this.saccadeResultsIsGood = data['result_is_good']
        this.saccadeResultsPowerSpectrumMean = data['power_spectrum_mean'];
        this.saccadeResultsMeanSdRelation = data['mean_sd_relation'];
        this.showResultsLoader = false;
        this.showSaccadeResults = true;
      });

      console.log("HTML: " + JSON.stringify(this.saccadeResults));

    }
  }

  public IsAllDataCollected()
  {
    this.zone.run(() => {
      this.framesLeftTotal = this.dataCollectorService.UncompletedCalibrationRequests.length +
      this.dataCollectorService.UncompletedExperimentRequests.length;
    });

    console.log("Left calibration requests: "
        + this.dataCollectorService.UncompletedCalibrationRequests.length);
        console.log("Left experiment requests: "
        + this.dataCollectorService.UncompletedExperimentRequests.length);

    if(this.dataCollectorService.UncompletedCalibrationRequests.length == 0 &&
      this.dataCollectorService.UncompletedExperimentRequests.length == 0)
      {
        return true;
      }
      else
      {
        return false;
      }
  }

  public async logCalibrationData()
  {
    console.log("Calibration finished: " + this.getCurrentTimeStamp());
    console.log("Calibration Data: " + JSON.stringify(this.dataCollectorService.CalibrationData));
  }

  public resetStopWatch()
  {
    this.initialTime = new Date();
  }

    public getCurrentTimeStamp(){
      let currentDate = new Date();
      var ts = currentDate.getTime() - this.initialTime.getTime();
      return ts;
  }

  public newGuid()
  {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  convertToBase64Image(image: any, width: number, height: number) {
    this.canvasConverter.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, width, height);
      return this.canvasConverter.nativeElement.toDataURL();
  }

  public reloadPage() {
    window.location.reload();
  }

  public async goInitialState() {
    await this.setupDevices();
    this.initializeServices();
    this.experimentCanvasDiv.nativeElement.style["display"] = "block";
    this.testQualityDiv.nativeElement.style["display"] = "none";
    this.setUpConfigState();
  }

  openFullscreen() {
    if (this.documentElement.requestFullscreen) {
      this.documentElement.requestFullscreen();
    } else if (this.documentElement.mozRequestFullScreen) {
      /* Firefox */
      this.documentElement.mozRequestFullScreen();
    } else if (this.documentElement.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.documentElement.webkitRequestFullscreen();
    } else if (this.documentElement.msRequestFullscreen) {
      /* IE/Edge */
      this.documentElement.msRequestFullscreen();
    }
  }

  /* Close fullscreen */
  closeFullscreen() {
    if (document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
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

}
