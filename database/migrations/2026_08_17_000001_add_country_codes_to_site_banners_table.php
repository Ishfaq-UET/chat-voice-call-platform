<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_banners', function (Blueprint $table) {
            $table->json('country_codes')->nullable()->after('link_label');
        });

        foreach (DB::table('site_banners')->orderBy('id')->get() as $banner) {
            $code = strtoupper(trim((string) ($banner->country_code ?? '')));
            $codes = $code !== '' ? [$code] : [];

            DB::table('site_banners')
                ->where('id', $banner->id)
                ->update(['country_codes' => json_encode($codes)]);
        }

        Schema::table('site_banners', function (Blueprint $table) {
            $table->dropIndex(['country_code']);
            $table->dropColumn('country_code');
        });
    }

    public function down(): void
    {
        Schema::table('site_banners', function (Blueprint $table) {
            $table->string('country_code', 2)->nullable()->after('link_label');
        });

        foreach (DB::table('site_banners')->orderBy('id')->get() as $banner) {
            $codes = json_decode((string) $banner->country_codes, true);
            $first = is_array($codes) && isset($codes[0]) ? strtoupper((string) $codes[0]) : null;

            DB::table('site_banners')
                ->where('id', $banner->id)
                ->update(['country_code' => $first]);
        }

        Schema::table('site_banners', function (Blueprint $table) {
            $table->index('country_code');
            $table->dropColumn('country_codes');
        });
    }
};
