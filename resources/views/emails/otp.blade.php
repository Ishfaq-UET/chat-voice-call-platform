<x-mail::message>
# Hi {{ $name }},

Your verification code is:

# {{ $otp }}

This code expires in **15 minutes**. Enter it on the verification screen to activate your account.

If you did not create an account on {{ $appName }}, you can ignore this email.

Thanks,<br>
{{ $appName }}
</x-mail::message>
