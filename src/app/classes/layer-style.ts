import { Style, Fill, Stroke } from 'ol/style';

export class LayerStyle {
  private fillColor: string;
  private strokeColor: string;

  constructor(fillColor: string, strokeColor: string) {
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
  }

  getStyle(): Style {
    return new Style({
      fill: new Fill({ color: this.fillColor }),
      stroke: new Stroke({ color: this.strokeColor, width: 2 })
    });
  }
  
}
