<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageAdminMail;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class ContactController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:40',
            'topic' => ['required', Rule::in(['general', 'booking', 'payment', 'partnership', 'other'])],
            'subject' => 'nullable|string|max:150',
            'message' => 'required|string|min:10|max:5000',
            'booking_reference' => 'nullable|string|max:20',
        ]);

        $message = ContactMessage::create([
            ...$data,
            'user_id' => $request->user()?->id,
            'locale' => app()->getLocale(),
        ]);

        if ($adminEmail = config('mail.admin_email')) {
            Mail::to($adminEmail)->queue(new ContactMessageAdminMail($message));
        }

        return back()->with('success', __('contact.form_success'));
    }
}
