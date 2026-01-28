import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { DiseaseCase } from '../../types/case';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView() {
    const [cases, setCases] = useState<DiseaseCase[]>([]);
    // Removed unused loading state

    useEffect(() => {
        // In real app, we would fetch geographic stats specifically
        // caseService.getAll().then(res => setCases(res.data));

        // Mock data for map
        setTimeout(() => {
            setCases([
                {
                    id: 1,
                    patient_code: 'CASE-001',
                    patient_name: 'Patient X',
                    patient_dob: '1990-01-01',
                    patient_gender: 'M',
                    province: 'Luanda',
                    municipality: 'Luanda',
                    status: 'confirmed',
                    diagnosis_date: '2025-01-10',
                    latitude: -8.8383,
                    longitude: 13.2344,
                    disease: { id: 1, name: 'Malária', symptoms: '', transmission: '' }
                },
                {
                    id: 2,
                    patient_code: 'CASE-002',
                    patient_name: 'Patient Y',
                    patient_dob: '2000-01-01',
                    patient_gender: 'F',
                    province: 'Benguela',
                    municipality: 'Lobito',
                    status: 'suspected',
                    diagnosis_date: '2025-01-12',
                    latitude: -12.35,
                    longitude: 13.54,
                    disease: { id: 2, name: 'Cólera', symptoms: '', transmission: '' }
                }
            ]);
        }, 1000);
    }, []);

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monitorização Geográfica</h1>
                    <p className="text-sm text-gray-500">Mapa de calor em tempo real de casos reportados em todo o território.</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Confirmado</span>
                    <span className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span> Suspeito</span>
                </div>
            </div>

            <div className="flex-1 rounded-sm border border-gray-200 overflow-hidden shadow-sm relative z-0">
                <MapContainer center={[-11.2027, 17.8739]} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {cases.map((c) => (
                        c.latitude && c.longitude && (
                            <Marker key={c.id} position={[c.latitude, c.longitude]}>
                                <Popup>
                                    <div className="p-1">
                                        <strong className="block text-sm font-bold text-gray-900">{c.disease?.name}</strong>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'confirmed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {c.status}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {c.municipality}, {c.province}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
