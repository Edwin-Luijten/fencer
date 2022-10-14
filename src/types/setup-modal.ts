import { SimpleModal } from './simple-modal';

export type SetupModal = {
    formValid: boolean;
    mapboxToken: string | null;
    mapboxStyle: string;
    email: string | null;
    rules: any[];
} & SimpleModal