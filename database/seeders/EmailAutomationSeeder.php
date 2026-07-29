<?php

namespace Database\Seeders;

use App\Models\EmailAutomation;
use Illuminate\Database\Seeder;

class EmailAutomationSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'name' => 'Welcome Email',
                'category' => 'onboarding',
                'trigger_event' => 'newsletter_signup',
                'offset_days' => 0,
                'send_time' => '09:00',
                'audience' => 'all_subscribers',
                'include_blocks' => ['referral_block', 'support_contact'],
                'subject' => ['en' => 'Welcome to GokuSafiri – Your African Adventure Begins!'],
                'body' => ['en' =>
                    '<p>Thank you for joining GokuSafiri! We\'re thrilled to have you.</p>'.
                    '<p>GokuSafiri connects you with hand-picked safaris, gorilla treks, and coastal escapes across 14 African countries, guided by local experts who know these places best.</p>'.
                    '<p><strong>Top destinations to explore:</strong> Serengeti, Masai Mara, Bwindi Forest, Zanzibar, and Victoria Falls.</p>'.
                    '<p>Follow us on social media for daily inspiration, and don\'t forget your referral rewards below  earn 5% travel credit for every friend who books.</p>'
                ],
                'cta_label' => 'Explore Tours',
                'cta_url' => config('app.url').'/tours',
            ],
            [
                'name' => 'Best Sellers',
                'category' => 'onboarding',
                'trigger_event' => 'newsletter_signup',
                'offset_days' => 2,
                'send_time' => '09:00',
                'audience' => 'all_subscribers',
                'include_blocks' => [],
                'subject' => ['en' => 'Our Best-Selling African Adventures'],
                'body' => ['en' =>
                    '<p>Here\'s what fellow travelers are booking right now:</p>'.
                    '<ul>'.
                    '<li>Gorilla Trekking  Bwindi Forest</li>'.
                    '<li>Rwanda Safari</li>'.
                    '<li>Uganda Safari</li>'.
                    '<li>Tanzania Great Migration</li>'.
                    '<li>Luxury Tours</li>'.
                    '</ul>'
                ],
                'cta_label' => 'Book Your Adventure',
                'cta_url' => config('app.url').'/tours',
            ],
            [
                'name' => 'Monthly Newsletter',
                'category' => 'onboarding',
                'trigger_event' => 'recurring_monthly',
                'recurring_day_of_month' => 1,
                'send_time' => '09:00',
                'audience' => 'all_subscribers',
                'include_blocks' => [],
                'subject' => ['en' => 'Your GokuSafiri Monthly Digest'],
                'body' => ['en' =>
                    '<p>This month: new tours, travel tips, entry requirement updates, traveler stories, seasonal promotions, and a fresh discount code.</p>'.
                    '<p><em>Edit this message each month before it goes out  it sends automatically on the 1st.</em></p>'
                ],
                'cta_label' => 'See What\'s New',
                'cta_url' => config('app.url').'/tours',
            ],

            [
                'name' => 'Thank You + Referral',
                'category' => 'booking_journey',
                'trigger_event' => 'booking_confirmed',
                'offset_days' => 0,
                'send_time' => '09:00',
                'include_blocks' => ['referral_block', 'support_contact'],
                'subject' => ['en' => 'Thank You! Invite Friends & Earn Rewards'],
                'body' => ['en' => '<p>Thank you for booking with GokuSafiri, {{name}}! Share the adventure  invite friends and earn rewards for every successful booking.</p>'],
            ],
            [
                'name' => '30 Days Before Departure',
                'category' => 'booking_journey',
                'trigger_event' => 'before_departure',
                'offset_days' => 30,
                'send_time' => '09:00',
                'include_blocks' => ['trip_summary', 'pre_departure_checklist', 'itinerary_link'],
                'subject' => ['en' => 'Your Adventure Starts Soon'],
                'body' => ['en' => '<p>Your trip to {{destination}} is one month away! Here\'s what to prepare before you fly.</p>'],
            ],
            [
                'name' => '14 Days Before Departure',
                'category' => 'booking_journey',
                'trigger_event' => 'before_departure',
                'offset_days' => 14,
                'send_time' => '09:00',
                'include_blocks' => ['trip_summary', 'itinerary_link', 'hotel_info', 'support_contact'],
                'subject' => ['en' => 'Two Weeks Until {{tour}}!'],
                'body' => ['en' => '<p>Two weeks to go! Here\'s your day-by-day schedule and hotel information.</p>'],
            ],
            [
                'name' => '7 Days Before Departure',
                'category' => 'booking_journey',
                'trigger_event' => 'before_departure',
                'offset_days' => 7,
                'send_time' => '09:00',
                'include_blocks' => ['guide_info', 'support_contact'],
                'subject' => ['en' => 'One Week to Go!'],
                'body' => ['en' => '<p>One week until {{tour}}! Your airport pickup will be arranged  full details and your guide\'s contact are below.</p>'],
            ],
            [
                'name' => '3 Days Before Departure',
                'category' => 'booking_journey',
                'trigger_event' => 'before_departure',
                'offset_days' => 3,
                'send_time' => '09:00',
                'include_blocks' => ['pre_departure_checklist', 'packing_checklist', 'weather_note'],
                'subject' => ['en' => 'Final Travel Reminder'],
                'body' => ['en' => '<p>Almost there! Double-check your flight, passport, visa, and cash before you leave.</p>'],
            ],
            [
                'name' => 'Arrival Day',
                'category' => 'booking_journey',
                'trigger_event' => 'departure_day',
                'send_time' => '06:00',
                'include_blocks' => ['driver_info', 'guide_info', 'hotel_info', 'emergency_contact'],
                'subject' => ['en' => 'Welcome to {{destination}}!'],
                'body' => ['en' => '<p>Welcome! Your GokuSafiri team is ready for you. Look out for your driver and guide at arrivals, and check in with the hotel details below.</p>'],
            ],
            [
                'name' => 'End of Trip',
                'category' => 'booking_journey',
                'trigger_event' => 'after_trip_end',
                'offset_days' => 0,
                'send_time' => '10:00',
                'include_blocks' => ['referral_block'],
                'subject' => ['en' => 'Thank You for Traveling with GokuSafiri'],
                'body' => ['en' => '<p>What an adventure! Thank you for trusting us with your journey to {{destination}}. We hope it created memories that last a lifetime.</p>'],
                'cta_label' => 'Plan My Next Trip',
                'cta_url' => config('app.url').'/tours',
            ],
            [
                'name' => 'Post-Trip Feedback',
                'category' => 'booking_journey',
                'trigger_event' => 'after_trip_end',
                'offset_days' => 2,
                'send_time' => '10:00',
                'include_blocks' => [],
                'subject' => ['en' => 'We\'d Love Your Feedback'],
                'body' => ['en' => '<p>How was your trip to {{destination}}? A quick review helps future travelers  and means the world to us.</p>'],
                'cta_label' => 'Leave a Review',
                'cta_url' => null,
            ],

            [
                'name' => 'Birthday',
                'category' => 'lifecycle',
                'trigger_event' => 'user_birthday',
                'send_time' => '09:00',
                'include_blocks' => [],
                'subject' => ['en' => 'Happy Birthday from GokuSafiri!'],
                'body' => ['en' => '<p>Happy birthday, {{name}}! To celebrate, here\'s a little gift from all of us at GokuSafiri.</p>'],
                'discount_code' => 'BIRTHDAY10',
                'cta_label' => 'Claim My Gift',
                'cta_url' => config('app.url').'/tours',
            ],
        ];

        foreach ($rows as $row) {
            EmailAutomation::updateOrCreate(['name' => $row['name']], $row);
        }
    }
}
