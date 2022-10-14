export type OSMItem = {
    display_name: string;
    osm_id: number;
    type: string;
    lat: number;
    lon: number;
    geojson: {
        coordinates: number[][][]
    }
}