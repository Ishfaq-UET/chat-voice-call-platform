<?php

namespace App\Mail\Transport;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

class BrevoTransport extends AbstractTransport
{
    public function __construct(
        protected string $apiKey,
    ) {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());
        $mail = Setting::mail();

        $from = $email->getFrom()[0] ?? null;
        $senderEmail = $from?->getAddress() ?: $mail['from_address'];
        $senderName = $from?->getName() ?: $mail['from_name'];

        $to = collect($email->getTo())
            ->map(fn (Address $address) => array_filter([
                'email' => $address->getAddress(),
                'name' => $address->getName() ?: null,
            ]))
            ->values()
            ->all();

        if ($to === []) {
            throw new \RuntimeException('Brevo mail has no recipients.');
        }

        $payload = [
            'sender' => array_filter([
                'email' => $senderEmail,
                'name' => $senderName ?: null,
            ]),
            'to' => $to,
            'subject' => $email->getSubject() ?? '(no subject)',
        ];

        $html = $email->getHtmlBody();
        $text = $email->getTextBody();

        if (is_string($html) && $html !== '') {
            $payload['htmlContent'] = $html;
        }

        if (is_string($text) && $text !== '') {
            $payload['textContent'] = $text;
        }

        if (! isset($payload['htmlContent']) && ! isset($payload['textContent'])) {
            $payload['textContent'] = $payload['subject'];
        }

        $response = Http::withHeaders([
            'api-key' => $this->apiKey,
            'accept' => 'application/json',
            'content-type' => 'application/json',
        ])
            ->timeout(20)
            ->post('https://api.brevo.com/v3/smtp/email', $payload);

        if (! $response->successful()) {
            Log::warning('Brevo API rejected email', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            throw new \RuntimeException(
                'Brevo API error: '.($response->json('message') ?? $response->body()),
            );
        }
    }

    public function __toString(): string
    {
        return 'brevo';
    }
}
