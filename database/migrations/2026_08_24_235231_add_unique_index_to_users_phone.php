<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Empty strings break UNIQUE (multiple '') — treat as null.
        DB::table('users')->where('phone', '')->update(['phone' => null]);

        // Keep the earliest user for each duplicate phone; clear the rest.
        $duplicates = DB::table('users')
            ->select('phone')
            ->whereNotNull('phone')
            ->groupBy('phone')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('phone');

        foreach ($duplicates as $phone) {
            $keepId = DB::table('users')
                ->where('phone', $phone)
                ->orderBy('id')
                ->value('id');

            DB::table('users')
                ->where('phone', $phone)
                ->where('id', '!=', $keepId)
                ->update(['phone' => null]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unique('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone']);
        });
    }
};
