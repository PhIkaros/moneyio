<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Compte;
use App\Models\Category;
use App\Models\SousCateg;
use App\Models\Income;
use App\Models\Outcome;
use App\Models\Transfert;
use App\Models\Budget;
use App\Models\NikkiEntry;
use App\Models\Note;
use Carbon\Carbon;
use Faker\Factory as Faker;

class OneYearDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('en_US');

        // 1. Clean DB
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Compte::truncate();
        Income::truncate();
        Outcome::truncate();
        Transfert::truncate();
        Budget::truncate();
        NikkiEntry::truncate();
        Note::truncate();
        SousCateg::truncate();
        Category::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1.5 Seed Categories
        $this->call([
            CategorySeeder::class,
            SousCategSeeder::class,
        ]);

        // 2. Setup User 1
        $user = User::find(1);
        if (!$user) {
            $this->command->error("User ID 1 not found.");
            return;
        }

        // 3. Create Accounts
        $compteMain = Compte::create(['name' => 'Checking Account', 'type' => 'Bank', 'balance' => 0, 'user_id' => $user->id]);
        $compteSavings = Compte::create(['name' => 'Savings Account', 'type' => 'Bank', 'balance' => 0, 'user_id' => $user->id]);
        $compteCash = Compte::create(['name' => 'Cash Wallet', 'type' => 'Cash', 'balance' => 0, 'user_id' => $user->id]);

        $comptes = [$compteMain, $compteSavings, $compteCash];

        // Fetch Categories
        $incomeCategories = Category::where('type', 'income')->with('sousCategories')->get();
        $outcomeCategories = Category::where('type', 'outcome')->with('sousCategories')->get();

        if ($outcomeCategories->isEmpty()) {
            // Fallback if type not set properly
            $outcomeCategories = Category::with('sousCategories')->get();
        }

        $allSousCategs = SousCateg::all();

        // 4. Generate Monthly Data (12 months back)
        $startDate = Carbon::now()->subYear()->startOfMonth();
        $endDate = Carbon::now();

        $currentDate = clone $startDate;

        $totalBalances = [
            $compteMain->id => 0,
            $compteSavings->id => 0,
            $compteCash->id => 0
        ];

        while ($currentDate <= $endDate) {
            $month = $currentDate->month;
            $year = $currentDate->year;
            $daysInMonth = $currentDate->daysInMonth;

            // --- INCOMES ---
            // Salary (1st of month or first weekday)
            $salaryCat = $incomeCategories->first();
            $salarySous = $salaryCat ? $salaryCat->sousCategories->first() : null;
            
            $salary = 15000 + rand(-1000, 2000); // 15k MAD/USD base
            Income::create([
                'amount' => $salary,
                'description' => 'Monthly Salary',
                'date' => clone $currentDate->startOfMonth(),
                'compte_id' => $compteMain->id,
                'sous_categ_id' => $salarySous ? $salarySous->id : null,
            ]);
            $totalBalances[$compteMain->id] += $salary;

            // Random side hustle
            if (rand(1, 10) > 7) {
                $side = rand(500, 2000);
                Income::create([
                    'amount' => $side,
                    'description' => 'Freelance Work',
                    'date' => (clone $currentDate)->addDays(rand(10, 20)),
                    'compte_id' => $compteMain->id,
                    'sous_categ_id' => $salarySous ? $salarySous->id : null,
                ]);
                $totalBalances[$compteMain->id] += $side;
            }

            // --- OUTCOMES ---
            // Rent
            $rentSous = $allSousCategs->firstWhere('name', 'Rent') ?? $allSousCategs->first();
            $rent = 4000;
            Outcome::create([
                'amount' => $rent,
                'description' => 'Rent',
                'date' => clone $currentDate->startOfMonth()->addDays(2),
                'compte_id' => $compteMain->id,
                'sous_categ_id' => $rentSous ? $rentSous->id : null,
            ]);
            $totalBalances[$compteMain->id] -= $rent;

            // Bills
            $bills = rand(500, 1000);
            Outcome::create([
                'amount' => $bills,
                'description' => 'Utilities & Internet',
                'date' => clone $currentDate->startOfMonth()->addDays(5),
                'compte_id' => $compteMain->id,
                'sous_categ_id' => $allSousCategs->random()->id,
            ]);
            $totalBalances[$compteMain->id] -= $bills;

            // Daily expenses
            $numExpenses = rand(20, 40); // Almost every day
            for ($i = 0; $i < $numExpenses; $i++) {
                $expenseAmount = rand(50, 500);
                $account = rand(1, 10) > 8 ? $compteCash : $compteMain; // 20% cash
                Outcome::create([
                    'amount' => $expenseAmount,
                    'description' => $faker->sentence(2),
                    'date' => (clone $currentDate)->addDays(rand(0, $daysInMonth - 1)),
                    'compte_id' => $account->id,
                    'sous_categ_id' => $allSousCategs->random()->id,
                ]);
                $totalBalances[$account->id] -= $expenseAmount;
            }

            // --- TRANSFERTS ---
            // Save some money each month
            $savings = rand(1000, 3000);
            Transfert::create([
                'from_compte_id' => $compteMain->id,
                'to_compte_id' => $compteSavings->id,
                'amount' => $savings,
                'description' => 'Monthly Savings',
                'date' => clone $currentDate->startOfMonth()->addDays(1),
            ]);
            $totalBalances[$compteMain->id] -= $savings;
            $totalBalances[$compteSavings->id] += $savings;

            // Cash withdrawal
            $withdrawal = rand(500, 1500);
            Transfert::create([
                'from_compte_id' => $compteMain->id,
                'to_compte_id' => $compteCash->id,
                'amount' => $withdrawal,
                'description' => 'ATM Withdrawal',
                'date' => (clone $currentDate)->addDays(rand(5, 25)),
            ]);
            $totalBalances[$compteMain->id] -= $withdrawal;
            $totalBalances[$compteCash->id] += $withdrawal;


            // --- BUDGETS ---
            // Global Budget
            Budget::create([
                'user_id' => $user->id,
                'categorie_id' => null,
                'amount' => 12000, // Total expected monthly expenses
                'month' => $month,
                'year' => $year
            ]);

            // Specific Category Budget
            $randCat = $outcomeCategories->random();
            Budget::create([
                'user_id' => $user->id,
                'categorie_id' => $randCat->id,
                'amount' => rand(1000, 3000),
                'month' => $month,
                'year' => $year
            ]);

            // --- NIKKI ENTRIES ---
            // Create a few journal entries per month
            $numEntries = rand(4, 10);
            for ($i = 0; $i < $numEntries; $i++) {
                $entryDate = (clone $currentDate)->addDays(rand(0, $daysInMonth - 1));
                // Only one entry per date is normally allowed by the UI logic, but let's make it realistic
                NikkiEntry::updateOrCreate(
                    ['date' => $entryDate->format('Y-m-d'), 'user_id' => $user->id],
                    [
                        'title' => $faker->randomElement(['A Good Day', 'Expense Regrets', 'Payday!', 'Just some thoughts', 'Budget Planning']),
                        'content' => '<p>' . implode('</p><p>', $faker->paragraphs(rand(1, 3))) . '</p>',
                    ]
                );
            }

            // Move to next month
            $currentDate->addMonth();
        }

        // Update Account Balances
        $compteMain->update(['balance' => $totalBalances[$compteMain->id]]);
        $compteSavings->update(['balance' => $totalBalances[$compteSavings->id]]);
        $compteCash->update(['balance' => $totalBalances[$compteCash->id]]);

        // 5. Generate Notes
        $colors = ['#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb'];
        
        Note::create([
            'user_id' => $user->id,
            'title' => 'Grocery List',
            'content' => '',
            'items' => [
                ['id' => '1', 'text' => 'Milk', 'completed' => true],
                ['id' => '2', 'text' => 'Eggs', 'completed' => false],
                ['id' => '3', 'text' => 'Bread', 'completed' => false],
            ],
            'color' => '#ccff90',
            'pinned' => true,
            'pinned_dashboard' => true,
            'archived' => false,
        ]);

        Note::create([
            'user_id' => $user->id,
            'title' => 'Financial Goals 2026',
            'content' => '1. Save $10,000 for emergency fund.<br>2. Invest in ETFs.<br>3. Cut down on dining out.',
            'items' => [],
            'color' => '#fbbc04',
            'pinned' => true,
            'pinned_dashboard' => false,
            'archived' => false,
        ]);

        Note::create([
            'user_id' => $user->id,
            'title' => 'Old Ideas',
            'content' => 'Some old text',
            'items' => [],
            'color' => '#ffffff',
            'pinned' => false,
            'pinned_dashboard' => false,
            'archived' => true,
        ]);
        
        $this->command->info('1 Year of data generated successfully for User 1!');
    }
}
