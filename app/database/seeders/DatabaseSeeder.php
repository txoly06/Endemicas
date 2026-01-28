<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Disease;
use App\Models\DiseaseCase;
use App\Models\EducationalContent;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@sistema.ao',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'institution' => 'Ministério da Saúde',
        ]);

        // Create health professional
        $professional = User::create([
            'name' => 'Dr. João Silva',
            'email' => 'joao.silva@hospital.ao',
            'password' => Hash::make('password123'),
            'role' => 'health_professional',
            'phone' => '+244 923 456 789',
            'institution' => 'Hospital Geral de Luanda',
        ]);

        // Create public user
        User::create([
            'name' => 'Maria Santos',
            'email' => 'maria@email.ao',
            'password' => Hash::make('password123'),
            'role' => 'public',
        ]);

        // Create diseases
        $diseases = [
            [
                'name' => 'Malária',
                'code' => 'B50',
                'description' => 'Doença infecciosa causada por parasitas do género Plasmodium, transmitida pela picada de mosquitos Anopheles infectados.',
                'symptoms' => 'Febre alta, calafrios, suores, dor de cabeça, náuseas, vómitos, dores musculares',
                'prevention' => 'Uso de redes mosquiteiras, repelentes, eliminação de águas paradas, medicação profilática em áreas endémicas',
                'treatment' => 'Medicamentos antimaláricos como artemeter-lumefantrina ou artesunato',
                'is_active' => true,
            ],
            [
                'name' => 'Cólera',
                'code' => 'A00',
                'description' => 'Infecção intestinal aguda causada pela bactéria Vibrio cholerae, caracterizada por diarreia severa.',
                'symptoms' => 'Diarreia aquosa severa, vómitos, desidratação rápida, cãibras musculares',
                'prevention' => 'Água potável tratada, higiene das mãos, saneamento adequado, vacinação',
                'treatment' => 'Reidratação oral ou intravenosa, antibióticos em casos severos',
                'is_active' => true,
            ],
            [
                'name' => 'Febre Amarela',
                'code' => 'A95',
                'description' => 'Doença viral aguda transmitida por mosquitos, que pode causar febre, icterícia e hemorragias.',
                'symptoms' => 'Febre, dor de cabeça, icterícia, dores musculares, náuseas, fadiga',
                'prevention' => 'Vacinação, controlo de mosquitos, uso de repelentes',
                'treatment' => 'Tratamento de suporte, não há tratamento específico antiviral',
                'is_active' => true,
            ],
            [
                'name' => 'Dengue',
                'code' => 'A90',
                'description' => 'Doença viral transmitida pelo mosquito Aedes aegypti.',
                'symptoms' => 'Febre alta, dor de cabeça intensa, dor atrás dos olhos, dores articulares e musculares, erupção cutânea',
                'prevention' => 'Eliminação de criadouros de mosquitos, uso de repelentes, telas nas janelas',
                'treatment' => 'Hidratação, repouso, analgésicos (evitar aspirina)',
                'is_active' => true,
            ],
            [
                'name' => 'Tuberculose',
                'code' => 'A15',
                'description' => 'Doença infecciosa causada pelo Mycobacterium tuberculosis, que afecta principalmente os pulmões.',
                'symptoms' => 'Tosse persistente por mais de 2 semanas, expectoração com sangue, febre, sudorese nocturna, perda de peso',
                'prevention' => 'Vacinação BCG, ventilação adequada, diagnóstico e tratamento precoces',
                'treatment' => 'Antibióticos específicos durante 6 meses (rifampicina, isoniazida, pirazinamida, etambutol)',
                'is_active' => true,
            ],
        ];

        foreach ($diseases as $diseaseData) {
            Disease::create($diseaseData);
        }

        $malaria = Disease::where('code', 'B50')->first();
        $colera = Disease::where('code', 'A00')->first();

        // Angola provinces
        $provinces = ['Luanda', 'Benguela', 'Huambo', 'Huíla', 'Cabinda', 'Malanje', 'Uíge', 'Kwanza Sul'];
        $municipalities = ['Município A', 'Município B', 'Município C'];

        // Create sample cases
        for ($i = 0; $i < 30; $i++) {
            $disease = $i % 5 === 0 ? $colera : $malaria;
            $status = ['suspected', 'confirmed', 'recovered', 'deceased'][array_rand(['suspected', 'confirmed', 'recovered', 'deceased'])];
            
            DiseaseCase::create([
                'disease_id' => $disease->id,
                'user_id' => $professional->id,
                'patient_name' => 'Paciente ' . ($i + 1),
                'patient_dob' => now()->subYears(rand(5, 70))->subDays(rand(0, 365)),
                'patient_id_number' => '00' . rand(1000000, 9999999) . 'LA0' . rand(10, 99),
                'patient_gender' => ['M', 'F'][array_rand(['M', 'F'])],
                'symptoms_reported' => $disease->symptoms,
                'symptom_onset_date' => now()->subDays(rand(1, 30)),
                'diagnosis_date' => now()->subDays(rand(0, 28)),
                'status' => $status,
                'province' => $provinces[array_rand($provinces)],
                'municipality' => $municipalities[array_rand($municipalities)],
                'latitude' => rand(-1800, -400) / 100, // Angola latitude range
                'longitude' => rand(1200, 2400) / 100, // Angola longitude range
            ]);
        }

        // Create alerts
        Alert::create([
            'disease_id' => $malaria->id,
            'title' => 'Surto de Malária em Luanda',
            'message' => 'Aumento significativo de casos de malária na província de Luanda. Recomenda-se uso de redes mosquiteiras e eliminação de águas paradas.',
            'severity' => 'high',
            'affected_area' => 'Luanda',
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        Alert::create([
            'disease_id' => $colera->id,
            'title' => 'Alerta de Cólera em Benguela',
            'message' => 'Casos de cólera detectados em Benguela. Recomenda-se consumo apenas de água tratada e higiene rigorosa.',
            'severity' => 'critical',
            'affected_area' => 'Benguela',
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        // Create educational content
        EducationalContent::create([
            'disease_id' => $malaria->id,
            'title' => 'Como Prevenir a Malária',
            'slug' => 'como-prevenir-malaria',
            'content' => '# Prevenção da Malária

## Medidas Essenciais

1. **Use redes mosquiteiras** tratadas com insecticida enquanto dorme
2. **Aplique repelente** nas áreas expostas da pele
3. **Elimine águas paradas** onde os mosquitos podem reproduzir-se
4. **Vista roupas de manga comprida** ao anoitecer
5. **Mantenha portas e janelas fechadas** ou com telas

## Sintomas de Alerta

Se apresentar febre, calafrios ou dores de cabeça, procure imediatamente um centro de saúde.',
            'type' => 'guide',
            'is_published' => true,
            'author_id' => $admin->id,
        ]);

        EducationalContent::create([
            'disease_id' => $colera->id,
            'title' => 'Cólera: Perguntas Frequentes',
            'slug' => 'colera-perguntas-frequentes',
            'content' => '# Perguntas Frequentes sobre Cólera

## O que é a Cólera?
A cólera é uma infecção intestinal aguda causada pela bactéria Vibrio cholerae.

## Como se transmite?
Através de água ou alimentos contaminados com fezes de pessoa infectada.

## Quais são os sintomas?
Diarreia aquosa severa, vómitos e desidratação rápida.

## Como prevenir?
- Beba apenas água tratada ou fervida
- Lave as mãos frequentemente com sabão
- Cozinhe bem os alimentos',
            'type' => 'faq',
            'is_published' => true,
            'author_id' => $admin->id,
        ]);
    }
}
