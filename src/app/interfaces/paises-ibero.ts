import { Geometry } from "ol/geom";

export interface PaisesIbero {
    id: number;
    pais: string;
    paisid: number;
    miembro_appat: boolean | string;
    miembro_cpci: boolean | string;
    url: string;
    geom: Geometry;
    data_2011: string;
}
