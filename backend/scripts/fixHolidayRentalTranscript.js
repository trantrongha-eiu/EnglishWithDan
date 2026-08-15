// "Holiday rental" (ListeningSection, standalone Part 1, also embedded as
// Part 1 of ListeningTest "Actual Tests / Actual Test 5") had the WRONG
// transcript stored: the text in the DB was actually the "Chervil Cottage"
// dialogue that belongs to a different section ("Cam 16 - Test 4 – Part 1"),
// not this one. The audioUrl and the existing questionGroups/correctAnswer
// values were already correct — verified by transcribing the actual audio
// file with faster-whisper and confirming every answer (14 September, 835,
// School, Deck, river, Towel, Garage, Chinese, 200, July) matches. Only the
// `transcript` field is patched here; audio and questions are untouched.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningSection = require('../models/ListeningSection');
const ListeningTest = require('../models/ListeningTest');

const TRANSCRIPT = `Transcript
Holiday rental

DAVE:
Hello?
WOMAN:
Oh, hello. I'm calling about a vacation rental. The name I've been given is Carol Marriot.
DAVE:
I'm Dave, Carol's husband. We own it together.
WOMAN:
Oh, right. Well, some friends of ours rented Astor Cottage from you for a week by the ocean last summer, and they recommended it to us. My husband and I would like to rent it in the fall for a week.
DAVE:
Okay. When exactly?
WOMAN:
We're looking at the week beginning September 21st, if it's available.
DAVE:
Let me check ... No, I'm sorry, it's already booked that week. You could have it the previous week, from the 14th.
WOMAN:
Well, we could manage that week if we change a couple of arrangements. How much would it cost?
DAVE:
That would be $835.
WOMAN:
Ah, that's rather more than we wanted to pay, I'm afraid. We were hoping to pay closer to $790, which our friends paid last year.
DAVE:
We also have a slightly smaller cottage called Periwinkle Cottage.
WOMAN:
Excuse me, how do you spell the name?
DAVE:
P-E-R-I-W-I-N-K-L-E, Periwinkle. It's available the week you want it, and it's the exact same price that your friends paid last year.
DAVE:
I take it you want a place that sleeps just two people, like Astor Cottage?
WOMAN:
Yes. Is it near Astor Cottage?
DAVE:
Yeah, it's right across the street.
WOMAN:
And what's this cottage like?
DAVE:
Well, it's part of a historic building that was originally a school a hundred years ago. It was converted into a post office around 1950. Then later on, the post office moved, and the building was divided to make two cottages.
WOMAN:
So is it on several floors?
DAVE:
No, it's all on one floor. There's a large living room, a kitchen that's really well equipped, a bedroom, and a bathroom with a tub and a shower.
WOMAN:
Oh, very nice.
DAVE:
From the living room, you can go out onto the deck, which is a great place to have your meals when the weather's nice.
WOMAN:
That sounds fantastic. Can you see the river that flows through the town from the cottage?
DAVE:
You sure can. It's close by. You can see it from the bedroom.
WOMAN:
Okay. Would we need to bring anything, bedding, say?
DAVE:
That's provided. But we make a small charge for towels, unless you bring your own, of course.
WOMAN:
Oh, okay. I'll do that, because we'll be driving. There'll be plenty of room in the car for things like that. Oh, that reminds me — is there a garage that we can use?
DAVE:
I'm afraid there isn't one, but you can usually get a parking spot on the street right in front of the cottage.
WOMAN:
No problem. We probably won't use the car much while we're there anyway. We like to go for walks.
WOMAN:
Oh, and what about the town itself? Are there any restaurants in the neighbourhood?
DAVE:
There are a few, all within walking distance. A lot of people like the fish restaurant, but in my opinion, the Chinese restaurant has got to be the best for miles around.
WOMAN:
That's good to know. We might end up eating out every evening.
DAVE:
Well, why not?
WOMAN:
Our friend said the town is pretty famous for antique stores.
DAVE:
That's right. There's a whole bunch of them, at least ten on the main street.
WOMAN:
Marvellous. Okay, I'd like to make the booking, please.
DAVE:
Great. We ask for a deposit of $200 and final payment at least six weeks before you stay. But we'll be away ourselves for much of August, so let's say no later than the last day of July. Is that okay with you?
WOMAN:
Fine.
DAVE:
Okay. And let me give you our details so you can send the deposit ...`;

async function run() {
  const sec = await ListeningSection.findOne({ title: 'Holiday rental' });
  if (!sec) throw new Error('ListeningSection "Holiday rental" not found');
  sec.transcript = TRANSCRIPT;
  await sec.save();
  console.log('[fixHolidayRentalTranscript] Patched standalone ListeningSection "Holiday rental".');

  const test = await ListeningTest.findOne({ name: 'Actual Test 5', seriesName: 'Actual Tests' });
  if (!test) throw new Error('ListeningTest "Actual Test 5" not found');
  const section = test.sections.find(s => s.title === 'Holiday rental');
  if (!section) throw new Error('Section "Holiday rental" not found inside Actual Test 5');
  section.transcript = TRANSCRIPT;
  await test.save();
  console.log('[fixHolidayRentalTranscript] Patched embedded copy inside ListeningTest "Actual Test 5".');
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await run();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[fixHolidayRentalTranscript] FAILED', e); process.exit(1); });
}

module.exports = { run, TRANSCRIPT };
