<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('Pages/About');
    }

    public function howItWorks(): Response
    {
        return Inertia::render('Pages/HowItWorks');
    }

    public function safety(): Response
    {
        return Inertia::render('Pages/Safety');
    }

    public function faq(): Response
    {
        return Inertia::render('Pages/Faq');
    }

    public function contact(): Response
    {
        return Inertia::render('Pages/Contact');
    }

    public function pricing(): Response
    {
        return Inertia::render('Pages/Pricing');
    }

    public function terms(): Response
    {
        return Inertia::render('Pages/Legal', [
            'title' => 'Terms of use',
            'updated' => 'July 2026',
            'sections' => [
                ['heading' => 'Eligibility', 'body' => 'You must be 18 or older to create an account and use Wyak Dating. By registering you confirm you meet this requirement.'],
                ['heading' => 'Accounts & roles', 'body' => 'Members (male) and creators (female) have different permissions. Roles chosen at signup cannot be changed without contacting support.'],
                ['heading' => 'Payments & wallets', 'body' => 'Members fund a wallet and are charged for messages, voice notes, and call minutes at the creator’s published rates. Platform commission is deducted from creator earnings.'],
                ['heading' => 'Creator verification', 'body' => 'Creators must complete face verification before appearing in Discover. False or misleading identity materials may result in permanent ban.'],
                ['heading' => 'Conduct', 'body' => 'Harassment, illegal content, spam, and fraud are prohibited. We may suspend or ban accounts that violate these rules.'],
                ['heading' => 'Withdrawals', 'body' => 'Creator withdrawal requests are reviewed manually. Minimum amounts and processing times are set by the platform and shown in your dashboard.'],
            ],
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('Pages/Legal', [
            'title' => 'Privacy policy',
            'updated' => 'July 2026',
            'sections' => [
                ['heading' => 'What we collect', 'body' => 'Account details (name, email), profile information, verification images for creators, chat and call metadata, and payment-related transactions needed to operate wallets.'],
                ['heading' => 'How we use data', 'body' => 'To provide chat/call services, process payments and withdrawals, moderate safety issues, improve the product, and communicate account notices.'],
                ['heading' => 'Sharing', 'body' => 'We share data with payment processors, cloud storage, and voice infrastructure providers only as needed to run the product. We do not sell personal data.'],
                ['heading' => 'Retention', 'body' => 'Wallet ledgers are kept for financial integrity. Media and chat content may be removed upon request subject to legal retention needs.'],
                ['heading' => 'Your choices', 'body' => 'You can update profile details, request account deletion, and contact support at support@wyakdating.local for privacy questions.'],
            ],
        ]);
    }

    public function community(): Response
    {
        return Inertia::render('Pages/Legal', [
            'title' => 'Community rules',
            'updated' => 'July 2026',
            'sections' => [
                ['heading' => 'Be respectful', 'body' => 'No harassment, hate speech, threats, or non-consensual sexual content.'],
                ['heading' => 'Stay real', 'body' => 'No impersonation, catfishing, or sharing another person’s private images.'],
                ['heading' => 'Keep it legal', 'body' => 'No illegal activity, scams, or solicitation of minors. Report suspicious users immediately.'],
                ['heading' => 'Payments only in-app', 'body' => 'Do not ask members to pay outside the wallet. Creators who solicit off-platform payments may be banned.'],
            ],
        ]);
    }

    public function careers(): Response
    {
        return Inertia::render('Pages/Simple', [
            'title' => 'Careers',
            'intro' => 'We’re building a safer paid chat & voice platform. We’re not hiring full-time yet — send an introduction to careers@wyakdating.local if you want to stay on our radar.',
            'body' => 'Roles we expect to open: product design, moderation operations, and mobile engineering.',
        ]);
    }

    public function blog(): Response
    {
        return Inertia::render('Pages/Blog', [
            'posts' => \App\Support\BlogPosts::listed(),
        ]);
    }

    public function blogShow(string $slug): Response
    {
        $post = \App\Support\BlogPosts::find($slug);

        abort_if($post === null, 404);

        return Inertia::render('Pages/BlogShow', [
            'post' => $post,
            'related' => collect(\App\Support\BlogPosts::listed())
                ->reject(fn ($p) => $p['slug'] === $slug)
                ->take(3)
                ->values()
                ->all(),
        ]);
    }
}
