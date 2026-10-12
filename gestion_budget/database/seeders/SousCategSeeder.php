<?php

namespace Database\Seeders;

use App\Models\SousCateg;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SousCategSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sousCategories = [
            // Food (categorie_id: 1)
            ['name' => 'Restaurant', 'description' => 'Dining out', 'categorie_id' => 1],
            ['name' => 'Groceries', 'description' => 'Supermarket trips', 'categorie_id' => 1],

            // Transport (categorie_id: 2)
            ['name' => 'Gas', 'description' => 'Fuel for car', 'categorie_id' => 2],
            ['name' => 'Public Transit', 'description' => 'Bus & Taxi', 'categorie_id' => 2],

            // Housing (categorie_id: 3)
            ['name' => 'Rent', 'description' => 'Monthly Rent', 'categorie_id' => 3],
            ['name' => 'Electricity', 'description' => 'Electric bill', 'categorie_id' => 3],

            // Health (categorie_id: 4)
            ['name' => 'Doctor', 'description' => 'Medical checkups', 'categorie_id' => 4],
            ['name' => 'Pharmacy', 'description' => 'Meds', 'categorie_id' => 4],

            // Entertainment (categorie_id: 5)
            ['name' => 'Movies', 'description' => 'Cinema trips', 'categorie_id' => 5],
            ['name' => 'Sports', 'description' => 'Gym & Activities', 'categorie_id' => 5],

            // Salary (categorie_id: 6)
            ['name' => 'Primary Job', 'description' => 'Monthly Salary', 'categorie_id' => 6],
            
            // Freelance (categorie_id: 7)
            ['name' => 'Upwork', 'description' => 'Upwork gigs', 'categorie_id' => 7],

            // Investments (categorie_id: 8)
            ['name' => 'Dividends', 'description' => 'Stock dividends', 'categorie_id' => 8],

            // Gifts (categorie_id: 9)
            ['name' => 'Birthday', 'description' => 'Birthday money', 'categorie_id' => 9],
        ];

    foreach ($sousCategories as $sousCateg){
        SousCateg::create($sousCateg);
    }
    }
}
