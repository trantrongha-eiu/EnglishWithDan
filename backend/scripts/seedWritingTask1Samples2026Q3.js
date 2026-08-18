/**
 * Seed script – band 7+ sample essays (sampleSections) for the 12
 * WritingTask1 topics added by seedWritingTasks2026Q3.js. Written directly
 * from the actual chart/map data (verified by viewing each image), not
 * copied from an external source — the site presents these as "Bài mẫu từ
 * Daniel" (the teacher's own model answer), so content needs to be
 * original rather than scraped from a third-party site.
 *
 * Same 4-section convention as the site's existing WritingTask1 samples:
 * Introduction / Overview / Body 1 / Body 2.
 *
 * Matches existing docs by exact `prompt` text — does NOT upsert.
 *
 * Run: node backend/scripts/seedWritingTask1Samples2026Q3.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const SAMPLES = [
  {
    prompt: 'The charts below show the use of water for agricultural products in Australia in 2004 and the value of these products to the Australian economy in the same year. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The two pie charts compare the proportion of water used for seven types of agricultural products in Australia in 2004 with the proportion of income each product generated in the same year.' },
      { title: 'Overview', content: 'Overall, livestock farming consumed by far the largest share of water but contributed only a small fraction of total income, whereas fruit production required relatively little water yet generated the highest income of all the products shown.' },
      { title: 'Body 1', content: 'Livestock accounted for 36% of total water usage, the highest figure on the chart, yet it brought in just 5% of total income, indicating a considerable inefficiency. Dairy farming showed a more balanced picture, using 19% of the water and generating a broadly similar 20% of income. Cotton followed a comparable pattern to livestock, consuming 15% of water but producing only 11% of income.' },
      { title: 'Body 2', content: 'By contrast, fruit stood out as the most profitable product relative to its water consumption: it required only 11% of the water but accounted for 36% of total income, the largest share of any product. Vegetables followed a similar trend, using just 4% of the water while contributing 21% of income. Sugar and rice, meanwhile, made only modest contributions to income (6% and 1% respectively) despite using slightly more water.' },
    ],
  },
  {
    prompt: 'The chart and table provide data on online shopping among Australian and New Zealand customers in 2012. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: "The pie charts compare Australian and New Zealand customers' preferences for local versus overseas websites in 2012, while the table outlines the main reasons consumers in both countries shopped online that year." },
      { title: 'Overview', content: 'Overall, Australian shoppers showed a much stronger preference for overseas websites than their New Zealand counterparts, and in both countries, lower prices were by far the most influential factor driving online purchases.' },
      { title: 'Body 1', content: 'Regarding shopping habits, 65% of Australian customers shopped exclusively on overseas websites, compared with only 50% of New Zealanders. Conversely, local websites were considerably more popular in New Zealand, being used exclusively by 43% of shoppers there, more than double the 25% recorded in Australia. A small minority in both countries, 10% of Australians and 7% of New Zealanders, used a combination of both types of websites.' },
      { title: 'Body 2', content: 'In terms of motivations, lower prices were the leading reason for online shopping in both nations, cited by 55% of Australians and 51% of New Zealanders. Convenience ranked second, mentioned by 28% and 36% of respondents respectively, while a wider range of products was a less significant factor, chosen by 15% of Australians and 11% of New Zealanders. Other reasons accounted for a negligible 2% in both countries.' },
    ],
  },
  {
    prompt: 'The chart below shows the number of items borrowed from public libraries in the UK over the ten-year period from 1995 to 2005. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The chart illustrates the number of items borrowed from public libraries in the United Kingdom across four categories between 1995 and 2005.' },
      { title: 'Overview', content: "Overall, the total number of items borrowed fell substantially over the decade, with children's books experiencing by far the steepest decline of the four categories." },
      { title: 'Body 1', content: "In 1995, children's books were the most heavily borrowed items by a wide margin, accounting for 1,113 million loans out of a total of roughly 1,648 million. However, this figure plummeted dramatically to 161 million in 2000 and fell further still to just 110 million by 2005, representing a decrease of almost 90% over the period. Audio-visual materials also declined steadily, from 330 million in 1995 to 280 million in 2000 and 230 million in 2005." },
      { title: 'Body 2', content: 'In contrast, borrowing of adult fiction and non-fiction books remained comparatively stable throughout the period. Adult fiction fell only gradually, from 98 million to 60 million, while adult non-fiction fluctuated only slightly, from 107 million to a peak of 113 million in 2000 before settling at 104 million in 2005. As a result, by 2005 the four categories had become far more evenly balanced than they had been a decade earlier.' },
    ],
  },
  {
    prompt: 'The maps below show recent archaeological findings at a historic site in 2004 and 2014. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The two maps show the archaeological findings at a historic site in 2004 and in 2014.' },
      { title: 'Overview', content: 'Overall, several new structures were uncovered at the site by 2014, and the number of ancient houses increased considerably, while the ancient temple and the coastline remained unchanged.' },
      { title: 'Body 1', content: 'In 2004, the north-western part of the site contained three trees, and the north-eastern section featured two mountains alongside two ancient houses. By 2014, the mountains had disappeared entirely, and this area instead contained an ancient stadium and an ancient toilet. The number of ancient houses in this part of the site also rose sharply, from two to ten, with the houses arranged in two neat rows. Meanwhile, the number of trees fell slightly, from three to two.' },
      { title: 'Body 2', content: 'In the southern and eastern parts of the site, fewer changes took place. An ancient palace, which had not been present in 2004, was discovered close to the centre of the site by 2014. The ancient temple, however, remained in exactly the same position throughout the period, as did the sea and its coastline to the east of the site.' },
    ],
  },
  {
    prompt: 'The pie charts illustrate the proportions of different course types chosen by students in the years 1984, 1994, and 2004. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The pie charts illustrate the proportions of four different types of courses chosen by students in 1984, 1994, and 2004.' },
      { title: 'Overview', content: 'Overall, face-to-face courses remained the most popular option in all three years, despite a steady decline in their share, while mixed-media courses saw the sharpest rise, eventually overtaking correspondence courses to become the second most popular type by 2004.' },
      { title: 'Body 1', content: 'In 1984, face-to-face courses accounted for two-thirds of all enrolments, at 67%, with correspondence courses making up a further 20% and mixed-media courses just 13%. Online courses did not exist at this time. By 1994, the proportion of face-to-face courses had fallen to 54%, while online courses had emerged, accounting for 11% of the total, and mixed-media courses had risen slightly to 15%. Correspondence courses remained unchanged, at 20%.' },
      { title: 'Body 2', content: 'By 2004, face-to-face courses had fallen further still, to 40%, though they remained the largest single category. Mixed-media courses, by contrast, had grown considerably, to 35%, overtaking correspondence courses, which had declined to 15%. Online courses remained relatively stable, at 10% of the total.' },
    ],
  },
  {
    prompt: 'The graph below shows the percentage of adults living in urban and rural areas who participated in four leisure activities in 1990 and 2010. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The table shows the percentage of urban and rural adults who took part in four leisure activities in 1990 and 2010.' },
      { title: 'Overview', content: 'Overall, reading was the most popular activity among both urban and rural adults throughout the period, with participation rates converging by 2010, while photography saw the most significant increase of the four activities, particularly among urban residents.' },
      { title: 'Body 1', content: 'In 1990, a higher proportion of rural adults read for leisure than urban adults, at 71% compared with 61%. By 2010, however, both figures had risen to an identical 78%, meaning the gap between the two groups had closed entirely. A similar pattern was observed for animated play, which remained low throughout, ranging from 10% to 18%, with a slight overall decline in both areas by 2010.' },
      { title: 'Body 2', content: 'Playing followed a different trend: participation among urban adults fell from 21% to 14%, whereas the rural figure remained unchanged, at 26%, throughout the period. Photography saw the largest rise of all, with urban participation more than doubling, from 7% to 17%, while the rural figure also increased substantially, from 14% to 24%.' },
    ],
  },
  {
    prompt: 'The line graph provides information about the number of international conferences that took place in three different cities. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The line graph shows the number of international conferences held in three different cities between 1965 and 2010.' },
      { title: 'Overview', content: 'Overall, City C experienced the most dramatic change over the period, rising from zero conferences in 1965 to a level comparable with the other two cities by 2010, while City B remained the most stable of the three throughout.' },
      { title: 'Body 1', content: 'In 1965, City A hosted the highest number of conferences, at 35, while City B held approximately 30 and City C held none at all. Over the following decades, City A fluctuated considerably, falling to 20 in 1975 before rising again to 30 in 1985, and continuing this pattern of sharp rises and falls until 2010, when it stood at 20. City B, by contrast, remained relatively stable at around 28 to 30 conferences for most of the period, before dipping slightly to 25 by 2010.' },
      { title: 'Body 2', content: 'City C showed a completely different trajectory. Starting from zero in 1965, the number of conferences held there rose steadily to reach around 30 by 1995, before falling back to approximately 25 in 2005 and then recovering to roughly 30 by 2010, a level similar to that of the other two cities.' },
    ],
  },
  {
    prompt: 'The graph below shows the percentage of female members of parliament in five European countries between 2000 and 2012. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate. Your report should comprise a minimum of 150 words.',
    sampleSections: [
      { title: 'Introduction', content: 'The graph illustrates the percentage of female members of parliament in five European countries between 2000 and 2012.' },
      { title: 'Overview', content: 'Overall, the proportion of female MPs increased in all five countries over the period, although Italy experienced by far the most dramatic rise, while Belgium ended the period with the highest percentage of the five.' },
      { title: 'Body 1', content: "Germany, Spain, and Belgium all followed a broadly similar pattern of gradual growth. Germany's figure rose only slightly, from around 30% to 33%, while Spain increased more noticeably, from 27% to 35%, before levelling off after 2004. Belgium showed the strongest growth of this group, climbing from 23% in 2000 to 38% in 2012, overtaking Spain to become the country with the highest proportion of female MPs by the end of the period." },
      { title: 'Body 2', content: 'Italy and the UK stood in stark contrast to one another at the start of the period. The UK began at a relatively low 17% and increased gradually to 23% by 2012. Italy, meanwhile, started at just 2.5%, the lowest of all five countries, before rising sharply between 2004 and 2008 to reach 23%, a level almost identical to that of the UK by the end of the period.' },
    ],
  },
  {
    prompt: 'The diagrams below show the changes that took place in a coastal area called Pentland between 1950 and 2007. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The two maps illustrate the changes that took place in the coastal town of Pentland between 1950 and 2007.' },
      { title: 'Overview', content: 'Overall, Pentland was transformed from a largely industrial area with open grassland into a residential and leisure destination, with numerous new facilities being added, while the coastline itself remained unchanged.' },
      { title: 'Body 1', content: 'In 1950, the town consisted mainly of an industrial area and two areas of grassland, connected by a simple road network with a small car park. By 2007, both the industrial area and the grassland had disappeared entirely. In their place, a range of new facilities had been constructed, including a park, a swimming pool, a marina, a cinema, and two clusters of shops. The original car park had also been replaced by a larger, multi-storey car park to accommodate increased traffic.' },
      { title: 'Body 2', content: 'Residential development was another notable change, with a block of apartments being built on the eastern side of the town, close to the newly created marina. Despite all these developments, the sea and its coastline to the north and east of the town remained exactly as they had been in 1950.' },
    ],
  },
  {
    prompt: 'The diagram below shows the recycling process of aluminium cans. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The diagram illustrates the twelve-stage process by which aluminium cans are recycled, a process which takes a total of six weeks to complete from start to finish.' },
      { title: 'Overview', content: 'Overall, the process begins with the collection of waste cans and ends with the production of new cans ready for use, passing through several stages of sorting, melting, and reshaping along the way.' },
      { title: 'Body 1', content: 'The process begins when used aluminium cans are collected from various locations and taken to a facility for consolidation. They are then sorted using advanced sorting technology to remove any impurities such as iron. Following this, the sorted cans are shredded into small pieces and compressed into bales, before being melted down in an induction furnace.' },
      { title: 'Body 2', content: 'In the second half of the process, the molten aluminium undergoes thermal de-coating to remove any remaining paint or coating, before being cast into ingots. These ingots are then purified and weighed, before being passed through rolling mills, which flatten them into thin sheets of metal. Finally, these sheets are formed and shaped into new cans, completing the six-week cycle and making the cans ready for use once again.' },
    ],
  },
  {
    prompt: 'The table shows the amount of money donated by charities in the USA, EU countries, and other countries to developing nations between 2006 and 2010, measured in millions of dollars. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The table shows the amount of money, in millions of dollars, donated by charities in the USA, the EU, and other countries to developing nations between 2006 and 2010.' },
      { title: 'Overview', content: 'Overall, the USA donated considerably more than the EU and other countries combined throughout the period, and this gap widened over time, while donations from the EU and other countries followed a similar, more modest pattern of growth.' },
      { title: 'Body 1', content: 'In 2006, the USA donated $9.8 million, already more than the EU and other countries combined ($3.1 million and $2.8 million respectively). US donations then rose steadily, reaching $17 million by 2008, before dipping slightly to $16.7 million in 2009 and climbing again to a peak of $20.3 million in 2010, more than double the 2006 figure.' },
      { title: 'Body 2', content: 'Donations from the EU and other countries followed a broadly similar trend to one another throughout the period, both rising gradually from around $3 million in 2006 to between $3.7 million and $4.1 million by 2010. As a result, the total amount donated by all three sources combined nearly doubled over the five years, from $15.7 million in 2006 to $28.1 million in 2010.' },
    ],
  },
  {
    prompt: 'The maps below show a housing estate as it is now and a plan for developing it in the future. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    sampleSections: [
      { title: 'Introduction', content: 'The maps show a housing estate as it currently stands and the plans for its future development.' },
      { title: 'Overview', content: 'Overall, the majority of the woodland will be cleared to make way for new development, and a number of new leisure facilities will be built, while the total number of houses on the estate will increase considerably.' },
      { title: 'Body 1', content: 'At present, the estate is dominated by dense woodland, consisting of around 6,000 trees, among which eight large four-bedroom houses are scattered along a private road. Under the new plan, the woodland will be reduced dramatically, to just 250 trees, retained mainly along the northern edge of the estate near the main road. In place of the cleared woodland, a considerably larger number of smaller one-, two-, and three-bedroom houses will be built, meaning that although individual houses will be smaller, the total number of residents will rise.' },
      { title: 'Body 2', content: 'Several new amenities will also be introduced, including a lake, tennis courts, and a flower garden, all situated close to the new housing. Areas of parkland will be scattered throughout the estate, while the private road will remain in roughly its original position.' },
    ],
  },
];

async function runSeed() {
  const WritingTask1 = require('../models/WritingTask1');

  const ops = SAMPLES.map(s => ({
    updateOne: {
      filter: { prompt: s.prompt },
      update: { $set: { sampleSections: s.sampleSections } },
      upsert: false,
    }
  }));

  const result = await WritingTask1.bulkWrite(ops);
  console.log(`[WritingTask1SamplesSeed] matched ${result.matchedCount}, modified ${result.modifiedCount} (expected ${SAMPLES.length})`);
  if (result.matchedCount !== SAMPLES.length) {
    console.warn('[WritingTask1SamplesSeed] WARNING: some prompts did not match an existing WritingTask1 doc — check for text drift.');
  }
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed())
    .then(() => { console.log('[WritingTask1SamplesSeed] Done'); mongoose.disconnect(); })
    .catch(err => { console.error('[WritingTask1SamplesSeed] Failed:', err); process.exit(1); });
}

module.exports = { runSeed, SAMPLES };
