<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->string('payment_reference')->nullable()->after('admin_notes');
            $table->string('payment_method')->nullable()->after('payment_reference'); // bank_transfer, cash, other
        });
    }

    public function down(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropColumn(['payment_reference', 'payment_method']);
        });
    }
};
