import { Geometry } from "ol/geom";

export interface CatastrosIbero {
    id: number;
    nombre: string;
    nombre_division: string;
    pais: string;
    paisid: number;
    url: string;
    geom: Geometry;
    codigo: string | null;
}
