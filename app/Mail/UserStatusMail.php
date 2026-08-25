<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $subjectLine,
        public string $headline,
        public string $body,
        public ?string $actionUrl = null,
        public ?string $actionLabel = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.status',
            with: [
                'name' => $this->user->name,
                'headline' => $this->headline,
                'body' => $this->body,
                'actionUrl' => $this->actionUrl,
                'actionLabel' => $this->actionLabel,
                'appName' => config('app.name'),
            ],
        );
    }
}
