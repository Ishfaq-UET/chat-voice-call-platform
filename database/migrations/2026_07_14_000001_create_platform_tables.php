<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('male')->after('email'); // male, female, admin
            $table->string('avatar')->nullable()->after('role');
            $table->text('bio')->nullable()->after('avatar');
            $table->string('phone')->nullable()->after('bio');
            $table->string('verification_status')->default('unverified')->after('phone'); // unverified, pending, approved, rejected
            $table->timestamp('online_at')->nullable()->after('verification_status');
            $table->boolean('is_banned')->default(false)->after('online_at');
        });

        Schema::create('female_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('chat_price', 10, 2)->default(1.00);
            $table->decimal('voice_price', 10, 2)->default(2.00);
            $table->decimal('call_price_per_minute', 10, 2)->default(5.00);
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('bank_holder')->nullable();
            $table->timestamps();
        });

        Schema::create('verification_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('selfie_path');
            $table->string('id_photo_path')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('balance', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // top_up, chat_fee, voice_fee, call_fee, earning, commission, withdrawal, refund
            $table->decimal('amount', 12, 2);
            $table->decimal('balance_after', 12, 2);
            $table->nullableMorphs('related');
            $table->string('description')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('male_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('female_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['male_id', 'female_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->string('type')->default('text'); // text, voice, image
            $table->text('body')->nullable();
            $table->string('media_path')->nullable();
            $table->decimal('amount_charged', 10, 2)->default(0);
            $table->decimal('commission_amount', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('male_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('female_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('conversation_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('ringing'); // ringing, active, ended, rejected, missed, failed
            $table->string('agora_channel');
            $table->decimal('rate_per_minute', 10, 2);
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->decimal('total_charged', 10, 2)->default(0);
            $table->decimal('commission_amount', 10, 2)->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('pending'); // pending, paid, rejected
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('bank_holder')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('calls');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('verification_requests');
        Schema::dropIfExists('female_profiles');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'avatar',
                'bio',
                'phone',
                'verification_status',
                'online_at',
                'is_banned',
            ]);
        });
    }
};
