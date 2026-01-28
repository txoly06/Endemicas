<?php

namespace Database\Factories;

use App\Models\Disease;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Disease>
 */
class DiseaseFactory extends Factory
{
    protected $model = Disease::class;

    public function definition(): array
    {
        $diseases = [
            ['name' => 'Malária', 'code' => 'MAL'],
            ['name' => 'Cólera', 'code' => 'COL'],
            ['name' => 'Dengue', 'code' => 'DEN'],
            ['name' => 'Tuberculose', 'code' => 'TUB'],
            ['name' => 'Febre Amarela', 'code' => 'FAM'],
        ];

        $disease = $this->faker->unique()->randomElement($diseases);

        return [
            'name' => $disease['name'],
            'code' => $disease['code'] . $this->faker->unique()->numberBetween(1, 999),
            'description' => $this->faker->paragraph(),
            'symptoms' => $this->faker->sentence(10),
            'prevention' => $this->faker->sentence(8),
            'treatment' => $this->faker->sentence(8),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
