<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Nnjeim\World\Models\Country;

class CountryCatalog
{
    private const CACHE_KEY = 'country_catalog.all';

    private const CACHE_TTL = 86400;

    /** @return array<string, array<string, mixed>> */
    public static function all(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Country::query()
                ->with('currency')
                ->orderBy('name')
                ->get()
                ->mapWithKeys(fn (Country $country) => [
                    strtoupper($country->iso2) => static::mapCountry($country),
                ])
                ->all();
        });
    }

    /** @return list<string> */
    public static function codes(): array
    {
        return array_keys(static::all());
    }

    public static function isSupported(?string $code): bool
    {
        return $code !== null && isset(static::all()[strtoupper($code)]);
    }

    public static function normalize(?string $code): string
    {
        $code = strtoupper((string) $code);

        return static::isSupported($code) ? $code : 'US';
    }

    public static function find(?string $code): ?array
    {
        if ($code === null) {
            return null;
        }

        return static::all()[strtoupper($code)] ?? null;
    }

    public static function name(?string $code): string
    {
        return static::find($code)['name'] ?? 'United States';
    }

    public static function defaultPrices(?string $code): array
    {
        $country = static::find(static::normalize($code));
        $currencyCode = $country['currency'] ?? 'USD';
        $defaults = config('country_defaults', []);

        return $defaults[$currencyCode] ?? $defaults['default'] ?? [
            'chat' => 1,
            'voice' => 2,
            'call' => 5,
        ];
    }

    public static function marketFor(?string $code): array
    {
        $code = static::normalize($code);
        $country = static::find($code) ?? static::find('US');

        return [
            'country_code' => $code,
            'country_name' => $country['name'],
            'currency_code' => $country['currency'],
            'currency_symbol' => $country['symbol'],
            'currency_symbol_first' => $country['symbol_first'],
        ];
    }

    public static function optionsForSelect(): array
    {
        return array_values(array_map(
            fn (array $country) => [
                'code' => $country['code'],
                'name' => $country['name'],
                'label' => trim(($country['emoji'] ?? '').' '.$country['name'].' ('.$country['currency'].')'),
            ],
            static::all(),
        ));
    }

    public static function formatMoney(float|string $amount, ?string $countryCode): string
    {
        $market = static::marketFor($countryCode);
        $formatted = number_format((float) $amount, 2);

        if ($market['currency_symbol_first'] ?? true) {
            return $market['currency_symbol'].$formatted;
        }

        return $formatted.' '.$market['currency_symbol'];
    }

    /** Validation rule for ISO2 country codes from nnjeim/world. */
    public static function countryCodeRule(): \Illuminate\Validation\Rules\Exists
    {
        return Rule::exists(config('world.migrations.countries.table_name', 'countries'), 'iso2');
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    private static function mapCountry(Country $country): array
    {
        $currency = $country->currency;
        $symbol = $currency?->symbol_native ?: $currency?->symbol ?: '$';

        return [
            'code' => strtoupper($country->iso2),
            'name' => $country->name,
            'emoji' => $country->emoji,
            'currency' => $currency?->code ?? 'USD',
            'symbol' => $symbol,
            'symbol_first' => (bool) ($currency?->symbol_first ?? true),
        ];
    }
}
