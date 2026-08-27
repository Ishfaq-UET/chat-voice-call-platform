<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $otp,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your verification code — '.\App\Models\Setting::brandName(),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.otp',
            with: [
                'name' => $this->user->name,
                'otp' => $this->otp,
                'appName' => \App\Models\Setting::brandName(),
            ],
        );
    }
}
