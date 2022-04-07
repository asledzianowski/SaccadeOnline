import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class DrawingService
{

    private context: CanvasRenderingContext2D;


    public canvasWidth: number;
    public canvasHeight: number;
    public markerRadius: number;
    public markerColor: string;
    public markerYPosition : number;
    public markerFixationXPosition : number;
    public markerTargetRightXPosition : number;
    public markerTargetLeftXPosition : number;

    constructor() {

     }


    public initialize( context: CanvasRenderingContext2D, canvasWidth: number,
      canvasHeight: number, distFromScreenInCm : number, targetToFixDistanceInDeg : number,
      screen_width_mm : number  )
    {
      this.context = context;
      this.canvasHeight = canvasHeight;
      this.canvasWidth = canvasWidth;

      //var distFromScreenInCm = 86; //cm
      //var targetToFixDistanceInDeg = 5; //deg
      //var screen_width_mm =  this.canvasWidth * 0.2645833333;

      var fixTargetDistInPx = this.getTargetDistance(this.canvasWidth,
        screen_width_mm, distFromScreenInCm, targetToFixDistanceInDeg);
        fixTargetDistInPx = Math.round(fixTargetDistInPx);

      this.markerRadius= 30;
      this.markerColor = "green";
      this.markerYPosition = (this.canvasHeight - this.markerRadius) / 2;
      this.markerFixationXPosition = (this.canvasWidth -  this.markerRadius) / 2;
      this.markerTargetRightXPosition = this.markerFixationXPosition + fixTargetDistInPx;
      this.markerTargetLeftXPosition = this.markerFixationXPosition - fixTargetDistInPx;

      console.log("screenWidth = " + this.canvasWidth)
      console.log("markerFixationXPosition = " + this.markerFixationXPosition)
      console.log("fixTargetDistInPx = " + fixTargetDistInPx)
      console.log("this.markerTargetRightXPosition: " + this.markerTargetRightXPosition)
      console.log("this.markerTargetLeftXPosition: " + this.markerTargetLeftXPosition)

    }


    private getDrawingContext()
    {
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      return this.context;
    }

    public drawFixationPoint()
    {
      var ctx = this.getDrawingContext();
      this.drawCircle({
        ctx: ctx, x: this.markerFixationXPosition, y: this.markerYPosition,
        radius:  this.markerRadius, fill: this.markerColor});

    }

    public drawTargetRight()
    {
      var ctx = this.getDrawingContext();
      this.drawCircle({
        ctx: ctx, x: this.markerTargetRightXPosition, y: this.markerYPosition,
        radius:  this.markerRadius, fill: this.markerColor});
    }

    public drawTargetLeft()
    {
      var ctx = this.getDrawingContext();
      this.drawCircle({
        ctx: ctx, x: this.markerTargetLeftXPosition, y: this.markerYPosition,
        radius:  this.markerRadius, fill: this.markerColor});
    }

    private drawCircle(obj) {
      obj.ctx.beginPath();
      obj.ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI, false);
      if (obj.fill) {
          obj.ctx.fillStyle = obj.fill;
          obj.ctx.fill();
      }
      if (obj.stroke) {
          obj.ctx.lineWidth = obj.strokeWidth;
          obj.ctx.strokeStype = obj.stroke;
          obj.ctx.stroke();
      }
    }

    private getTargetDistance(screen_width_px, screen_width_mm,
      dist_from_screen_cm, target_to_fix_distance_deg){

      var screen_width_cm = screen_width_mm / 10
      var target_dist = this.degrees_to_pixels(screen_width_cm, screen_width_px, dist_from_screen_cm,
                target_to_fix_distance_deg)
      return target_dist;
    }

    private degrees_to_pixels(monitor_width_cm, monitor_horizontal_resolution_px, distance_from_monitor_cm, size_in_deg)
    {
      var deg_per_px = this.radians_to_degrees(Math.atan2(.5 * monitor_width_cm, distance_from_monitor_cm))
      / (.5 * monitor_horizontal_resolution_px)
      var size_in_px = size_in_deg / deg_per_px
      return size_in_px
    }

    private radians_to_degrees(radians)
    {
      var pi = Math.PI;
      return radians * (180/pi);
    }


}
