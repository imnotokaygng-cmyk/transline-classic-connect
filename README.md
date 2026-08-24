# Transline Classic Connect

Build a SEPARATE PUBLIC CUSTOMER WEBSITE for the existing Transline Classic transport system.



IMPORTANT:

This is NOT the Clerk/Admin dashboard.



The existing Clerk/Admin website already exists and uses Supabase. This new public website must connect to the SAME Supabase project/database so that online customers and branch clerks share the exact same trips, seats, bookings and availability.



DO NOT create a second database.

DO NOT create a second booking system.

DO NOT use demo/mock data.

DO NOT rebuild the admin/clerk dashboard.



==================================================

1. PUBLIC WEBSITE PURPOSE

==================================================



This is the customer-facing Transline Classic website.



A visitor should be able to open the website without logging in.



Main navigation:



- Home

- Book a Ticket

- Send a Parcel

- Track Booking

- Track Parcel

- Routes

- Contact

- Staff Login



Staff Login should redirect to the existing protected staff/admin system. Customers should NOT be forced to log in.



Design should be professional, modern, trustworthy and mobile-first, matching Transline Classic branding.



==================================================

2. BOOK TICKET

==================================================



Create a complete public online ticket booking flow.



Customer selects:



1. Origin

2. Destination

3. Travel date

4. Available trip



Origin and destination must come from the EXISTING Supabase branches/routes data.



Do NOT make customers type destinations manually.



Only show valid routes/trips.



Show:



- Departure time

- Arrival time if available

- Fare

- Bus/vehicle

- Total seats

- Available seats

- Booked seats



==================================================

3. VISUAL BUS SEAT MAP

==================================================



When the customer selects a trip, show a REAL visual bus seat layout.



Do NOT use a simple numbered grid.



The seat map should look like an actual bus:



- Driver area at the front

- Bus body

- Aisle

- Seat positions

- Door where applicable

- Different layouts depending on the vehicle



Support different vehicle capacities/layouts such as:



- 11 seater

- 14 seater

- 47 seater

- Other existing buses in the database



The seat layout must be associated with the selected bus/trip.



Use the existing seat numbering/layout where available.



Example visual states:



AVAILABLE = white/outlined

BOOKED = grey

SELECTED = red

STAFF/RESERVED = purple



Include a legend.



Customer clicks an available seat to select it.



Do not allow clicking booked/reserved seats.



Display:



Selected seat: A15

Fare: KES 1,700

etc.



==================================================

4. REAL-TIME SHARED SEAT AVAILABILITY

==================================================



THIS IS CRITICAL.



The public website and the existing Clerk website must use the SAME Supabase bookings table and SAME trip IDs.



Use the existing get_taken_seats RPC and existing seat-lock database protection.



If a clerk sells 20 seats:



→ those 20 seats must immediately appear BOOKED on the public website.



If an online customer books a seat:



→ that seat must appear BOOKED on the Clerk website.



There must never be two separate seat inventories.



Preserve the existing:



- bookings_seat_lock.sql

- unique seat protection

- trips.seats_booked trigger

- get_taken_seats RPC



Handle race conditions gracefully.



If another customer or clerk books a seat while the current customer is selecting it, show:



"Sorry, this seat has just been booked. Please select another seat."



Then refresh availability.



==================================================

5. PASSENGER DETAILS

==================================================



After selecting the seat, collect the passenger information supported by the existing database schema.



At minimum where supported:



- Full name

- Phone number

- ID/passport number if required

- Selected seat

- Trip

- Origin

- Destination



Generate a booking reference.



Create the booking with:



payment_status = "pending"



Do not mark it paid yet.



==================================================

6. M-PESA STK PUSH

==================================================



Integrate Safaricom M-PESA Daraja STK Push.



The customer should be able to pay the ticket directly through M-PESA.



Payment flow:



Customer completes booking details

↓

Booking created as PENDING

↓

Customer enters M-PESA phone number

↓

Click "Pay with M-PESA"

↓

Backend sends STK Push through Daraja

↓

Customer receives M-PESA prompt

↓

Customer enters M-PESA PIN

↓

Safaricom sends callback to backend

↓

Backend verifies the transaction

↓

Booking becomes PAID

↓

Show booking confirmation



IMPORTANT SECURITY:



NEVER put these in frontend React code:



- Daraja Consumer Key

- Daraja Consumer Secret

- M-PESA Passkey

- Any service-role Supabase key



Daraja credentials MUST remain server-side.



Use Supabase Edge Functions or another secure backend/server-side implementation.



Recommended functions:



supabase/functions/mpesa-stk-push/

supabase/functions/mpesa-callback/



Use environment/secrets for:



MPESA_CONSUMER_KEY

MPESA_CONSUMER_SECRET

MPESA_PASSKEY

MPESA_SHORTCODE

MPESA_CALLBACK_URL



Do NOT hardcode real credentials.



If the Daraja credentials are not configured yet, build the integration structure correctly and provide clear instructions for adding the secrets.



Do NOT fake successful M-PESA payments.



==================================================

7. PAYMENT STATES

==================================================



Use the existing payment_status field.



Allowed values:



pending

paid

cancelled



Do NOT create a second payment status system unless the existing schema requires it.



STK Push being initiated DOES NOT mean payment succeeded.



Only a successful verified Daraja callback should change:



pending → paid



If payment fails/cancels/times out:



keep the booking pending or handle it according to the existing booking policy.



Do not falsely mark it paid.



==================================================

8. PAYMENT CONFIRMATION

==================================================



After successful payment show a professional confirmation page:



"Booking Confirmed"



Display:



- Booking reference

- Passenger name

- Origin

- Destination

- Travel date

- Departure time

- Bus

- Seat number

- Amount paid

- M-PESA transaction reference where available



Allow customer to print/save the ticket.



Also provide:



"Track Booking"



==================================================

9. BOOKING LOOKUP

==================================================



Create a public Track Booking page.



Customer enters:



Booking reference



Optionally phone number if required by the existing security design.



Show:



- Booking reference

- Passenger

- Trip

- Route

- Date

- Time

- Seat

- Payment status



Do not expose other customers' bookings.



==================================================

10. SEND PARCEL

==================================================



Create a public "Send Parcel" page.



The customer should NOT type the pickup/destination manually.



Use dropdowns populated from existing Supabase branches/locations.



Fields:



- Pickup location

- Destination

- Sender name

- Sender phone

- Receiver name

- Receiver phone

- Parcel type

- Parcel description

- Quantity

- Any other fields supported by the existing parcel schema



The parcel process is different from ticket booking.



After completing the parcel form:



DO NOT force the customer through an online parcel payment system.



Instead show:



"Continue on WhatsApp"



Clicking it should open WhatsApp with a pre-filled message containing the parcel information.



Example message:



Hello Transline Classic,

I would like to send a parcel.



Sender: John Doe

Phone: 0712345678

Receiver: Jane Doe

Receiver Phone: 0798765432

From: Nairobi

To: Kisumu

Parcel: Documents

Quantity: 1



The WhatsApp number must be configurable and NOT hardcoded throughout the application.



If possible, store it in configuration/environment settings.



==================================================

11. TRACK PARCEL

==================================================



Create a public parcel tracking page.



Customer enters tracking/reference number.



Show only the relevant parcel information:



- Tracking number

- Origin

- Destination

- Parcel status

- Date

- Last update



Do not expose sensitive customer information unnecessarily.



Use the existing parcel database.



==================================================

12. ROUTES

==================================================



Create a public Routes page showing available routes from the existing database.



Customers should see:



- Origin

- Destination

- Available trips

- Departure times

- Fare where appropriate



Do not hardcode routes.



==================================================

13. HOME PAGE

==================================================



Create a professional Transline Classic homepage.



Hero section:



"Travel with Transline Classic"



Buttons:



"Book a Ticket"

"Send a Parcel"



Include:



- Popular routes

- Simple booking explanation

- Parcel service

- Why choose Transline Classic

- Contact information

- Branch/location information where appropriate



Keep the design consistent with the existing Transline Classic branding.



==================================================

14. MOBILE EXPERIENCE

==================================================



This site will primarily be used on mobile phones.



Make EVERYTHING responsive.



The bus seat map must work well on:



- Android phones

- iPhones

- Tablets

- Desktop



Seat buttons must be large enough to tap accurately.



Do not make the customer zoom in to select seats.



==================================================

15. DATABASE INTEGRATION

==================================================



Use the EXISTING Supabase project.



Before modifying anything:



INSPECT the existing schema/types and identify:



- branches

- routes

- trips

- buses

- bookings

- passengers

- parcels

- profiles/users

- existing RPCs

- RLS policies



Reuse existing tables.



Do NOT create duplicate tables.



The public site must use the same:



trip_id

booking records

seat numbers

routes

branches

bus information



as the Clerk/Admin system.



==================================================

16. SECURITY

==================================================



Public users must NOT have unrestricted access to Supabase.



Use appropriate RLS policies.



Customers must only be able to:



- View information required for public booking

- Create legitimate bookings

- Track their own booking using the appropriate secure lookup

- Create/submit parcel requests according to the existing architecture



They must NOT be able to:



- Read all bookings

- Read all passengers

- Modify other customers' bookings

- Modify trips

- Modify buses

- Modify branches

- Access admin data

- Access clerk data

- Read private financial information



Never expose Supabase service-role credentials in the browser.



==================================================

17. CLERK ↔ PUBLIC WEBSITE CONNECTION

==================================================



TEST THIS EXACTLY:



Scenario 1:



A clerk logs into the existing Clerk website.



Clerk sells seats:



1

2

3

...

20



for Trip X.



The public website opens Trip X.



Exactly those 20 seats must appear BOOKED.



Scenario 2:



A customer uses the public website.



Customer books Seat 25.



The existing Clerk website opens Trip X.



Seat 25 must appear BOOKED.



Both systems must use the SAME database.



==================================================

18. ERROR HANDLING

==================================================



Handle:



- No trips available

- No seats available

- Seat becomes booked during selection

- Invalid phone number

- Failed STK Push

- M-PESA timeout

- Cancelled M-PESA payment

- Network error

- Booking creation failure

- Duplicate booking attempt



Give the customer clear messages.



Never show raw database errors to customers.



==================================================

19. DO NOT BREAK EXISTING SYSTEM

==================================================



Do not modify or break:



- Existing Clerk portal

- Existing Admin portal

- Existing authentication

- Existing branch restrictions

- Existing RLS

- Existing booking system

- Existing get_taken_seats RPC

- Existing seat-lock migration

- Existing seats_booked trigger



The public website is an additional frontend that consumes the existing backend.



==================================================

20. IMPLEMENTATION METHOD

==================================================



FIRST inspect the existing project and database types.



Then identify what can be reused.



Do NOT immediately create duplicate components or tables.



Build in this order:



1. Public routing/layout

2. Home page

3. Trip search

4. Visual bus seat selection

5. Passenger details

6. Booking creation

7. M-PESA STK Push backend

8. Daraja callback

9. Payment confirmation

10. Booking trackingNf

11. Public parcel form

12. WhatsApp redirect

13. Parcel tracking

14. Routes page

15. Mobile optimization

16. Full testing



Run type checking after implementation.



Fix all TypeScript/import/runtime errors.



Do not use mock data where live Supabase data exists.



IMPORTANT:

If the existing database schema does not contain a field required for the feature, STOP and tell me exactly what is missing rather than inventing an incompatible schema.



The final result must be a functioning PUBLIC Transline Classic online booking website connected to the existing Clerk/Admin system and the same Supabase database.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ecbeb74-dea3-4957-8f8f-9006a89eace2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
