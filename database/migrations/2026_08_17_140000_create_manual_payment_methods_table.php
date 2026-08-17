<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manual_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo_path')->nullable();
            $table->string('country_code', 2)->index();
            $table->string('account_title');
            $table->string('bank_name')->nullable();
            $table->string('account_number');
            $table->text('extra_instructions')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::table('manual_top_up_requests', function (Blueprint $table) {
            $table->foreignId('payment_method_id')
                ->nullable()
                ->after('user_id')
                ->constrained('manual_payment_methods')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('manual_top_up_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payment_method_id');
        });

        Schema::dropIfExists('manual_payment_methods');
    }
};
