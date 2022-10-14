import { OSMItem } from './osm';
import { SimpleModal } from './simple-modal';

export type SearchModal = {
    loading: boolean;
    q: string | null;
    items: OSMItem[];
} & SimpleModal

