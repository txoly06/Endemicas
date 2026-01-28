<?php

namespace Database\Factories;

use App\Models\Disease;
use App\Models\DiseaseCase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DiseaseCase>
 */
class DiseaseCaseFactory extends Factory
{
    protected $model = DiseaseCase::class;

    public function definition(): array
    {
        $provinces = ['Luanda', 'Benguela', 'Huambo', 'Huíla', 'Cabinda'];
        $statuses = ['suspected', 'confirmed', 'recovered', 'deceased'];

        return [
            'disease_id' => Disease::factory(),
            'user_id' => User::factory(),
            'patient_code' => 'CASE-' . strtoupper(Str::random(8)),
            'patient_name' => $this->faker->name(),
            'patient_dob' => $this->faker->date('Y-m-d', '-18 years'),
            'patient_id_number' => $this->faker->numerify('00#######LA###'),
            'patient_gender' => $this->faker->randomElement(['M', 'F']),
            'symptoms_reported' => $this->faker->sentence(6),
            'symptom_onset_date' => $this->faker->dateTimeBetween('-30 days', '-7 days')->format('Y-m-d'),
            'diagnosis_date' => $this->faker->dateTimeBetween('-7 days', 'now')->format('Y-m-d'),
            'status' => $this->faker->randomElement($statuses),
            'province' => $this->faker->randomElement($provinces),
            'municipality' => $this->faker->city(),
            'commune' => $this->faker->optional()->streetName(),
            'latitude' => $this->faker->latitude(-18, -4),
            'longitude' => $this->faker->longitude(12, 24),
            'notes' => $this->faker->optional()->paragraph(),
        ];
    }

    public function suspected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspected',
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
        ]);
    }

    public function inProvince(string $province): static
    {
        return $this->state(fn (array $attributes) => [
            'province' => $province,
        ]);
    }
}
