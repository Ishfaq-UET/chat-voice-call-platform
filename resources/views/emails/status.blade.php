<x-mail::message>
# Hi {{ $name }},

## {{ $headline }}

{{ $body }}

@if ($actionUrl && $actionLabel)
<x-mail::button :url="$actionUrl">
{{ $actionLabel }}
</x-mail::button>
@endif

Thanks,<br>
{{ $appName }}
</x-mail::message>
