<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Food', 'description' => 'Groceries & Dining', 'type' => 'outcome'],
            ['name' => 'Transport', 'description' => 'Gas & Public Transit', 'type' => 'outcome'],
            ['name' => 'Housing', 'description' => 'Rent & Utilities', 'type' => 'outcome'],
            ['name' => 'Health', 'description' => 'Medical & Pharmacy', 'type' => 'outcome'],
            ['name' => 'Entertainment', 'description' => 'Movies & Fun', 'type' => 'outcome'],
            ['name' => 'Salary', 'description' => 'Main Income', 'type' => 'income'],
            ['name' => 'Freelance', 'description' => 'Side Hustle', 'type' => 'income'],
            ['name' => 'Investments', 'description' => 'Dividends & Crypto', 'type' => 'income'],
            ['name' => 'Gifts', 'description' => 'Gifts & Rewards', 'type' => 'income'],
        ];

        foreach ($categories as $category){
            Category::create($category);
        }
    }
}
