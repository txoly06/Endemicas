export interface DiseaseCase {
    id: number;
    patient_code: string;
    patient_name: string;
    patient_dob: string;
    patient_gender: 'M' | 'F' | 'O';
    status: 'suspected' | 'confirmed' | 'recovered' | 'deceased';
    province: string;
    municipality: string;
    diagnosis_date: string;
    disease?: Disease;
    // Fields for creation/forms
    disease_id?: number;
    symptoms?: string; // For display from backend
    symptoms_reported?: string; // For form submission
    symptom_onset_date?: string;
    patient_id_number?: string;
    latitude?: number;
    longitude?: number;
    // Patient Card details
    qr_data?: string;
    masked_id_number?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    total: number;
    per_page?: number;
    last_page?: number;
}

export interface Disease {
    id: number;
    name: string;
    symptoms: string;
    transmission: string;
}

export interface StatData {
    municipality: string;
    count: number;
}
