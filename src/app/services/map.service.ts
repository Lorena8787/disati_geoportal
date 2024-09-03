import { Injectable } from '@angular/core';
import { Observable, forkJoin, BehaviorSubject } from 'rxjs';

import WKT from 'ol/format/WKT';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Geometry from 'ol/geom/Geometry';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import XYZ from 'ol/source/XYZ.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import ScaleLine from 'ol/control/ScaleLine';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';

import { MultiPolygon } from 'ol/geom';
import { Fill, Stroke, Style } from 'ol/style';
import { FullScreen, defaults as defaultControls } from 'ol/control.js';

import { DataproviderService } from './dataprovider.service';

import { PaisesIbero } from '../interfaces/paises-ibero';
import { CatastrosIbero } from '../interfaces/catastros-ibero';
import { TileWMS } from 'ol/source';

import { PaisesStyle } from '../classes/paises-style';
import { CatastroStyle } from '../classes/catastro-style';
import { SelectFeatureStyle } from '../classes/select-feature-style';


@Injectable({
  providedIn: 'root'
})
export class MapService {

  public map!: Map;
  public layers: { name: string, layer: VectorLayer<any> }[] = [];

  public filterAppat!: boolean;
  public filterCpci!: boolean;

  private overlay!: Overlay;
  private data!: [PaisesIbero[], CatastrosIbero[]];
  private baseMaps: any[] = [];
  public wmsLayers: any[] = [];
  //private selectedProperties!: PaisesIbero | CatastrosIbero | {};
  private selectedProperties!: any;

  private dataLoadedSubject = new BehaviorSubject<boolean>(false);
  public dataLoaded = this.dataLoadedSubject.asObservable();

  private moreDataLoadedSubject = new BehaviorSubject<{ paisid: number, selectedProperties: PaisesIbero | CatastrosIbero | {} }>({ paisid: 0, selectedProperties: {} });
  public moreDataLoaded = this.moreDataLoadedSubject.asObservable();

  private selectedFeature: any;
  private originalStyle: Style | null = null;

  private paisesStyle = new PaisesStyle();
  private paisesIberoStyle = this.paisesStyle.getStyle()

  private catastrosStyle = new CatastroStyle();
  private catastrosIberoStyle = this.catastrosStyle.getStyle()

  private selectStyle = new SelectFeatureStyle();
  private selectFeatureStyle = this.selectStyle.getStyle()

  constructor(private dataProviderService: DataproviderService) { }

  public initializeMap(): void {
    if (typeof document !== 'undefined') {
      this.map = new Map({
        controls: defaultControls().extend([new FullScreen()]),
        target: 'map',
        layers: [
          // Mapa base del servicio de imágenes del mundo - ESRI
          new TileLayer({
            source: new XYZ({
              attributions: '<a href="https://www.esri.com" target="_blank">Esri, DigitalGlobe, GeoEye, i-cubed, USDA FSA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community</a> ',
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            }),
            visible: true,
            zIndex: 0,
          }),
          // Mapa base de límites y lugares encima del mapa base - ESRI
          new TileLayer({
            source: new XYZ({
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            }),
            visible: true,
            zIndex: 1
          })
        ],
        view: new View({
          center: [-2519117, -1161798], //EPSG:3857
          projection: 'EPSG:3857',
          zoom: 2.8
        }),
      });
    }
    this.addWMSLayers();
  }


  // Datos de los servicios de las capas
  private getData(): Observable<[PaisesIbero[], CatastrosIbero[]]> {
    
    this.dataLoadedSubject.next(false); // Mantiene el loading

    return forkJoin([
      this.dataProviderService.getPaisesIberoamerica(),
      this.dataProviderService.getCatastrosIberoamerica()
    ]);
  }

  public addVectorLayer(): any {
    this.getData().subscribe({
      next: (data: [PaisesIbero[], CatastrosIbero[]]) => {
        this.data = data;

        this.dataLoadedSubject.next(true); // Emite el evento para quitar el loading

        this.createLayerPaisesIbero(this.data[0]);
        this.createLayerCatastrosIbero(this.data[1]);

      },
      error: (error: Error) => { console.error('There was an error!', error); },
      complete: () => { console.log('Data fetching complete.'); }
    });
  }

  private createLayerPaisesIbero(data: PaisesIbero[]) {
    let colorFill = 'rgba(0, 0, 255, 0.3)';
    let colorStroke = '#0000FF'

    let layerName = `Países Iberoamérica`;  
    let visibilidad = true;

    let vectorLayer = this.createLayer(data, layerName, colorFill, colorStroke, visibilidad);

    this.map.addLayer(vectorLayer);
    this.layers.push({ name: layerName, layer: vectorLayer });
  }

  private createLayerCatastrosIbero(data: CatastrosIbero[]) {
    let colorFill = 'rgba(210, 180, 140, 1)';
    let colorStroke = 'rgba(139, 69, 19, 1)';

    let layerName = `Catastros Iberoamérica`; 
    let visibilidad = false;

    let vectorLayer = this.createLayer(data, layerName, colorFill, colorStroke, visibilidad);

    this.map.addLayer(vectorLayer);
    this.layers.push({ name: layerName, layer: vectorLayer });
  }

  // Crear capas 
  public createLayer(data: any[], layerName: string, colorFill: string, colorStroke: string, visibilidad: boolean): VectorLayer<Feature<Geometry>> {
    const wktFormat = new WKT();
    const features = data.map(element => {
      if (!element.geom) { return null; }

      const wktFeatures = element.geom.replace('SRID=4326;', '');
      const feature = wktFormat.readFeature(wktFeatures, {
        dataProjection: 'EPSG:4326',  // Proyección original de los datos
        featureProjection: 'EPSG:3857'  // Transformar las características a EPSG:3857
      });

      const properties: any = {};
      for (const key in element) {
        if (key !== 'geom') {
          properties[key] = element[key];
        }
      }
      feature.setProperties(properties);
      return feature;
    }).filter(feature => feature !== null) as Feature<Geometry>[];

    const vectorSource = new VectorSource({ features: features });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: colorFill
        }),
        stroke: new Stroke({
          color: colorStroke,
          width: 2
        })
      }),
      zIndex: 2,
      visible: visibilidad,
    });

    vectorLayer.getSource()!.getFeatures().forEach(feature => {
      feature.set('isVisible', true);
      feature.set('layerName', layerName);
    });

    (vectorLayer as any).layerName = layerName;

    return vectorLayer;
  }

  public addOverlay(): void {
    this.overlay = new Overlay({
      autoPan: {
        animation: {
          duration: 250
        }
      }
    });
    this.map.addOverlay(this.overlay);

    this.map.on('singleclick', (event) => {
      let feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => feature);

      if (feature) {
        if (!this.isFeatureVisible(feature)) {
          return;
        }

        if (this.selectedFeature) {
          this.resetFeatureStyle();
        }

        this.selectedFeature = feature;
        this.highlightFeature(feature);

        const geometry = feature.getGeometry();
        let coordinates: any;

        switch (geometry?.getType()) {
          case 'MultiPolygon':
            coordinates = (geometry as MultiPolygon).getInteriorPoints().getCoordinates();
            break;
          case 'Point':
            coordinates = (geometry as Point).getCoordinates();
            break;
          default:
            return;
        }

        if (coordinates) {
          this.selectedProperties = feature.getProperties();
          this.moreDataLoadedSubject.next({ paisid: this.selectedProperties.paisid, selectedProperties: this.selectedProperties });
        }
      }
    });

  }

  // Comprueba si una característica pasa el filtro
  private isFeatureVisible(feature: any): boolean {
    let isVisible = feature.get('isVisible');

    if (isVisible) {
      return true;
    } else {
      return false;
    }
  }

  public checkFilters(): Array<boolean> {
    return [this.filterAppat, this.filterCpci]
  }

  // Aplica los filtros de la capa Paises Iberoamérica
  public applyFilters(filterAppat: boolean, filterCpci: boolean): void {

    this.filterAppat = filterAppat;
    this.filterCpci = filterCpci;

    this.layers.forEach(layerInfo => {
      if (layerInfo.name === 'Países Iberoamérica') {
        layerInfo.layer.getSource()!.getFeatures().forEach(feature => {
          let isCpciMember = feature.get('miembro_cpci') === 'True';
          let isAppatMember = feature.get('miembro_appat') === 'True';
          let style: Style | null = null;
          let isVisible: boolean = false;

          if (filterCpci && filterAppat) {
            // Filtro combinado
            if (isCpciMember && isAppatMember) {
              style = new Style({
                fill: new Fill({ color: 'rgba(0, 0, 255, 0.3)' }), // Visible
                stroke: new Stroke({ color: '#0000FF', width: 2 })
              });
              isVisible = true;
            } else {
              style = new Style({
                fill: new Fill({ color: 'rgba(255, 255, 255, 0)' }), // Invisible
                stroke: new Stroke({ color: 'rgba(255, 255, 255, 0)', width: 0 })
              });
              isVisible = false;
            }
          } else if (filterCpci) {
            // Solo filtro cpci
            style = isCpciMember ? new Style({
              fill: new Fill({ color: 'rgba(0, 0, 255, 0.3)' }), // Visible
              stroke: new Stroke({ color: '#0000FF', width: 2 })

            }) : new Style({
              fill: new Fill({ color: 'rgba(255, 255, 255, 0)' }), // Invisible
              stroke: new Stroke({ color: 'rgba(255, 255, 255, 0)', width: 0 })
            });
            isVisible = isCpciMember;
          } else if (filterAppat) {
            // Solo filtro appat
            style = isAppatMember ? new Style({
              fill: new Fill({ color: 'rgba(0, 0, 255, 0.3)' }), // Visible
              stroke: new Stroke({ color: '#0000FF', width: 2 })
            }) : new Style({
              fill: new Fill({ color: 'rgba(255, 255, 255, 0)' }), // Invisible
              stroke: new Stroke({ color: 'rgba(255, 255, 255, 0)', width: 0 })
            });
            isVisible = isAppatMember;
          } else {
            // Sin filtros aplicados
            style = new Style({
              fill: new Fill({ color: 'rgba(0, 0, 255, 0.3)' }), // Visible
              stroke: new Stroke({ color: '#0000FF', width: 2 })
            });
            isVisible = true;
          }
          feature.set('isVisible', isVisible);
          feature.setStyle(style);
        });
      }
    });
  }

  // Después de cerrar el panel devuelve el color a la feature seleccionada
  public resetFeatureStyle(): void {
    if (this.originalStyle) {
      this.selectedFeature.setStyle(this.originalStyle);
    }
  }

  private highlightFeature(feature: any) {
    const layerName = feature.get('layerName');

    if (layerName === 'Países Iberoamérica') {
      // Estilo original específico para 'Paises'
      this.originalStyle = this.paisesIberoStyle;
    } else {
      this.originalStyle = this.catastrosIberoStyle;
    }
    const highlightStyle = this.selectFeatureStyle;

    feature.setStyle(highlightStyle);
  }

  // Añadir capas a la lista de capas
  public updateLayerList(): void {
    const layerList = document.getElementById('layer');

    if (layerList) {
      layerList.innerHTML = '';

      this.layers.forEach((layerInfo: any) => {
        let style = layerInfo.layer.getStyle();
        let fillColor = '';
        let strokeColor = '';

        if (style && style instanceof Style) {
          let fill = style.getFill();
          let stroke = style.getStroke();
          fillColor = fill ? (fill.getColor() as string) : '';
          strokeColor = stroke ? (stroke.getColor() as string) : '';
        } else if (Array.isArray(style)) {
          let firstStyle = style.find(s => s instanceof Style) as Style | undefined;
          if (firstStyle) {
            let fill = firstStyle.getFill();
            let stroke = firstStyle.getStroke();
            fillColor = fill ? (fill.getColor() as string) : '';
            strokeColor = stroke ? (stroke.getColor() as string) : '';
          }
        }
        if (!document.getElementById(layerInfo.name)) {
          this.addLayerListElements(layerInfo, layerList, fillColor, strokeColor);
        }
      });

    }
  }

  private addLayerListElements(layerInfo: any, layerList: any, fillColor: any, strokeColor: any): void {
    let listItem = document.createElement('li');
    let label = document.createElement('label');
    let layerVisible = layerInfo.layer.getVisible();

    label.classList.add('layer-list-label');
    label.style.display = 'flex';
    label.style.paddingBottom = '20px';

    label.innerHTML = `
    <input type="checkbox" id="${layerInfo.name}" name="${layerInfo.name}" ${layerVisible ? 'checked' : ''} style="margin-right: 10px; width: 16px; height: 18px;">
    <div class="color-box" style="background-color: ${fillColor}; border: 1px solid ${strokeColor}; height: 20px; width: 20px; margin-right: 10px;"></div> ${layerInfo.name}`;
    label.style.display = 'flex';
    listItem.appendChild(label);
    layerList!.appendChild(listItem);
    listItem.querySelector('input')?.addEventListener('change', (event) => {
      const checkbox = event.target as HTMLInputElement;
      layerInfo.layer.setVisible(checkbox.checked);
    });
    layerList!.appendChild(listItem);
  }

  // Añadir mapas base
  public addBaseMaps() {
    let basemapName = '';
    let key_maptiler = 'rhC12crMCpwkiE6Apbxr';

    this.baseMaps.forEach(map => {
      if (map.active) {
        basemapName = map.name;
      }
    });

    this.baseMaps = [
      {
        name: 'ESRISatelliteBoundaries',
        label: 'ESRI Satellite',
        layer: new TileLayer({
          source: new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          }),
          visible: false,
          zIndex: 1
        }),
        active: false
      },
      {
        name: 'ESRISatellite',
        label: 'ESRI Satellite',
        layer: new TileLayer({
          source: new XYZ({
            attributions: '<a href="https://www.esri.com" target="_blank">Esri, DigitalGlobe, GeoEye, i-cubed, USDA FSA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community</a> ',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          }),
          visible: false,
          zIndex: 0
        }),
        active: false
      },
      {
        name: 'osm',
        label: 'OpenStreetMap',
        layer: new TileLayer({
          source: new OSM({}),
          visible: false,
          zIndex: 0
        }),
        active: false
      },
      {
        name: 'streets',
        label: 'Streets',
        layer: new TileLayer({
          source: new XYZ({
            attributions: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a> ',
            url: 'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=' + key_maptiler,
            maxZoom: 20,
          }),
          visible: false,
          zIndex: 0
        }),
        active: false
      },
      /*
      {
        name: 'satellite',
        label: 'Satellite',
        layer: new TileLayer({
          source: new XYZ({
            attributions: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ',
            url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key_maptiler,
            tileSize: 512,
            maxZoom: 20,
          }),
          visible: false,
          zIndex: 0
        }),
        active: false
      },*/
      {
        name: 'terrain',
        label: 'Terrain',
        layer: new TileLayer({
          source: new OSM({
            url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
          }),
          visible: false,
          zIndex: 0
        }),
        active: false
      },
    ];

    // Añadir capas de mapas base al mapa
    this.baseMaps.forEach(baseMap => {
      // Comporbacion basemap activo
      if (baseMap.name == basemapName) {
        baseMap.layer.setVisible(true);
        baseMap.active = true
      }
      if (basemapName == '' && baseMap.name == 'ESRISatellite') {
        baseMap.layer.setVisible(true);
        baseMap.active = true;

        this.baseMaps.forEach(baseMap2 => {
          if (baseMap.name == 'ESRISatelliteBoundaries') {
            baseMap2.layer.setVisible(true);
            baseMap2.active = false;
          }
        })
      }

      this.map.addLayer(baseMap.layer);
    });

    return this.baseMaps;
  }

  // Añadir mapas base
  public addWMSLayers() {
    let wmsLayerName = '';
    this.wmsLayers.forEach(layer => {
      if (layer.active) {
        wmsLayerName = layer.name;
      }
    });

    this.wmsLayers = [
      {
        name: 'catastroBogota',
        label: 'Sector Catastral',
        layer: new TileLayer({
          source: new TileWMS({
            url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/services/catastro/sectorcatastral/MapServer/WmsServer',
            params: {
              'LAYERS': '0',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
              'STYLES': 'default',
              'CRS': 'EPSG:3857',
              'TRANSPARENT': 'TRUE'
            },
            transition: 0
          }),
          visible: false,
          zIndex: 2
        }),
      },
      {
        name: 'catastroBogota',
        label: 'Manzanas',
        layer: new TileLayer({
          source: new TileWMS({
            url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/services/catastro/manzana/MapServer/WmsServer',
            params: {
              'LAYERS': '0',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
              'STYLES': 'default',
              'CRS': 'EPSG:3857',
              'TRANSPARENT': 'TRUE'
            },
            transition: 0
          }),
          visible: false,
          zIndex: 2
        }),
      },
      {
        name: 'catastroBogota',
        label: 'Lote',
        layer: new TileLayer({
          source: new TileWMS({
            url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/services/catastro/lote/MapServer/WMSServer',
            params: {
              'LAYERS': '0',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
              'STYLES': 'default',
              'CRS': 'EPSG:3857',
              'TRANSPARENT': 'TRUE'
            },
            transition: 0
          }),
          visible: false,
          zIndex: 2
        }),
      },
      {
        name: 'catastroBogota',
        label: 'Construcciones',
        layer: new TileLayer({
          source: new TileWMS({
            url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/services/catastro/construccion/MapServer/WMSServer',
            params: {
              'LAYERS': '0',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
              'STYLES': 'default',
              'CRS': 'EPSG:3857',
              'TRANSPARENT': 'TRUE'
            },
            transition: 0
          }),
          visible: false,
          zIndex: 2
        }),
      },
      {
        name: 'catastroEspaña',
        label: 'Manzanas',
        layer: new TileLayer({
          source: new TileWMS({
            url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
            params: {
              'LAYERS': 'MASA',
              'FORMAT': 'image/png',
              'VERSION': '1.1.1',
              'STYLES': '',
              'TRANSPARENT': 'TRUE'
            },
            serverType: 'geoserver',
            transition: 0
          }),
          visible: false,
          zIndex: 2
        }),
      },
      {
        name: 'catastroEspaña',
        label: 'Parcelas',
        layer: new TileLayer({
          source: new TileWMS({
            url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
            params: {
              'LAYERS': 'PARCELA',
              'FORMAT': 'image/png',
              'VERSION': '1.1.1',
              'STYLES': '',
              'TRANSPARENT': 'TRUE'
            },
            serverType: 'geoserver',
            transition: 0
          }),
          visible: false,
          zIndex: 2
        }),
      },
      {
        name: 'catastroEspaña',
        label: 'Subparcelas',
        layer: new TileLayer({
          source: new TileWMS({
            url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
            params: {
              'LAYERS': 'SUBPARCELA',
              'FORMAT': 'image/png',
              'VERSION': '1.1.1',
              'STYLES': '',
              'TRANSPARENT': 'TRUE'
            },
            serverType: 'geoserver',
            transition: 0
          }),
          visible: false,
          zIndex: 2
        }),
      },
      {
        name: 'catastroEspaña',
        label: 'Construcciones',
        layer: new TileLayer({
          source: new TileWMS({
            url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
            params: {
              'LAYERS': 'CONSTRU',
              'FORMAT': 'image/png',
              'VERSION': '1.1.1',
              'STYLES': '',
              'TRANSPARENT': 'TRUE'
            },
            serverType: 'geoserver',
            transition: 0
          }),
          visible: false,
          zIndex: 2
        }),
      },
      {
        name: 'catastroEspaña',
        label: 'Textos',
        layer: new TileLayer({
          source: new TileWMS({
            url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
            params: {
              'LAYERS': 'TEXTOS',
              'FORMAT': 'image/png',
              'VERSION': '1.1.1',
              'STYLES': '',
              'TRANSPARENT': 'TRUE'
            },
            serverType: 'geoserver',
            transition: 0
          }),
          visible: false,
          zIndex: 2
        }),
      },
    ];

    // Añadir capas de mapas base al mapa
    this.wmsLayers.forEach(layer => {
      // Comporbacion basemap activo
      if (layer.name == wmsLayerName) {
        layer.layer.setVisible(true);
        layer.active = true
      }
      if (wmsLayerName == '' && layer.name == 'osm') {
        layer.layer.setVisible(true);
        layer.active = true
      }

      this.map.addLayer(layer.layer);
    });

    return this.wmsLayers;
  }

}