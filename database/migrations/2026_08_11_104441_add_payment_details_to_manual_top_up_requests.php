<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('manual_top_up_requests', function (Blueprint $table) {
            $table->string('payment_channel')->nullable()->after('user_id'); // jazzcash, easypaisa, bank_transfer, other
            $table->string('sender_account_name')->nullable()->after('payment_channel');
            $table->string('sender_number')->nullable()->after('sender_account_name');
            $table->string('receiver_account')->nullable()->after('sender_number');
            $table->text('member_notes')->nullable()->after('screenshot_path');
        });
    }

    public function down(): void
    {
        Schema::table('manual_top_up_requests', function (Blueprint $table) {
            $table->dropColumn([
                'payment_channel',
                'sender_account_name',
                'sender_number',
                'receiver_account',
                'member_notes',
            ]);
        });
    }
};
