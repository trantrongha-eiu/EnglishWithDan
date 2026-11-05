/**
 * Essay type (WritingTask2.essayType) of every standalone Task 2 prompt —
 * the 7 groups of the Task 2 Templates page (type01..type07, same ids as
 * Task2Template / Task2TypeGuide / js/shared/task2-generic-tpl.js).
 *
 * Reviewed by hand on 2026-11-05. Two-part questions go to the closest
 * group: "Why? + positive/negative?" → type07, "Why? + what can be done?"
 * → type03, "Why? + disadvantages?" → type01.
 *
 * Applied by scripts/setWritingTask2EssayTypes.js. New prompts get their
 * type from the "Dạng đề" select in admin (Writing → Task 2).
 */
module.exports = {
  // type01 — Adv & Disadv (15)
  type01: [
    '69cced3e84749e2f69dfb2dd', // In the past, when students did a university degree, they tended to stu
    '69cced5184749e2f69dfb2e2', // Nowadays, many people choose to be self-employed, rather than to work 
    '69e86945d4a26e0e1ef31203', // The widespread use of smartphones and tablets has changed the way peop
    '6a0be7cc1d7ec40efce5ee00', // Online shopping seems to be replacing the traditional method of buying
    '6a226b1117fe3959117de7a1', // Many schools now offer online learning as an alternative to in-person 
    '6a3bc26d6e41a07162431dbc', // Social media platforms have become a major source of news and informat
    '6a3d1e42a64d86d76bf66400', // Nowadays, many people spend a large amount of time using smartphones a
    '6a3d1f11a64d86d76bf67104', // Many companies are replacing human workers with artificial intelligenc
    '6a74052d66bdb38d66a0c6c6', // Some people believe that schools should replace traditional textbooks 
    '6a7409db66bdb38d66a0c6ef', // In many countries, university students are encouraged to take part in 
    '6a905d1f31a29bc08f2e5a6e', // The widespread use of smartphones and tablets has changed the way peop
    '6a905d2031a29bc08f2e5a6f', // Nowadays, an increasing number of people use smartwatches and health-t
    '6a905d2931a29bc08f2e5a83', // Some people think that good health is a basic human right, so medical 
    '6a905d2c31a29bc08f2e5a89', // The rapid advancement of technology has transformed the way people com
    '6a99b1875b413cfafa699784', // Social media is now used all over the world to stay in touch with othe
  ],
  // type02 — Discuss Both (20)
  type02: [
    '69ccec5d84749e2f69dfb2a4', // Some people think that it is better for older schoolchildren to study 
    '69ccec6b84749e2f69dfb2a9', // Some people think that children should be taught at school to recycle 
    '69ead8d512d21842dfb93022', // Some people believe older students should study many subjects to gain 
    '6a848738c4d5b5ac38bce892', // Some people believe that economic growth is essential for eliminating 
    '6a848738c4d5b5ac38bce895', // Some people believe that it is acceptable to use animals in any way th
    '6a848738c4d5b5ac38bce896', // Some people believe that showing imported films and TV programmes is b
    '6a905d2731a29bc08f2e5a7b', // Some people argue that governments should subsidize fresh fruits and v
    '6a905d2731a29bc08f2e5a7c', // Some people think that governments should fund free local public libra
    '6a905d2731a29bc08f2e5a7d', // Some people believe that governments should spend money preparing elit
    '6a905d2731a29bc08f2e5a7e', // Some people contend that governments should invest more money in pract
    '6a905d2a31a29bc08f2e5a85', // Some people believe that the government should spend money on supporti
    '6a905d2a31a29bc08f2e5a87', // Some people believe that the best way to reduce crime is to give longe
    '6a9313479ca5a616963131a1', // Some people think the government should provide free public libraries 
    '6a99b1895b413cfafa699786', // Some people argue that subsidising fruits and vegetables is a good way
    '6a99b1895b413cfafa699787', // Some people think that the government should provide free public libra
    '6a99b1895b413cfafa699788', // Some people believe that governments should build more sports faciliti
    '6a99b18a5b413cfafa69978b', // In some countries, governments spend a large amount of money supportin
    '6a99b18a5b413cfafa69978d', // Some people believe that all offenders should be sent to prison, while
    '6a99b45bdd3216114012771f', // Some people believe that individuals cannot do anything to improve the
    '6a99b45bdd32161140127740', // Some people think international car-free days are an effective way to 
  ],
  // type03 — Cause–Solution (22)
  type03: [
    '6a4f974247b9bcf279c93af2', // Students today face more academic pressure than ever before. What are 
    '6a71eb030404f51873811137', // Studies have suggested that children watch much more television than t
    '6a71eb1a0404f51873811138', // Many people believe that international tourism is a bad thing for thei
    '6a71eb3c0404f51873811139', // There is a general increase in anti-social behaviours and lack of resp
    '6a71eb570404f5187381113a', // Nowadays people use bicycles less as a form of transport. Why is that?
    '6a74047566bdb38d66a0c579', // In many countries, an increasing number of young people are losing int
    '6a74098166bdb38d66a0c6c8', // In many countries, students are under increasing pressure to achieve h
    '6a8e89ca756b6bc7a0ce2394', // Childhood obesity rates have risen sharply in many parts of the world 
    '6a8e89e3756b6bc7a0ce2395', // People nowadays consume far more processed and fast food than fresh, h
    '6a8e8a31756b6bc7a0ce2396', // Stress-related mental illnesses and anxiety disorders have become incr
    '6a8e8a43756b6bc7a0ce2397', // Many adults living in major cities struggle to get enough physical exe
    '6a905d2431a29bc08f2e5a72', // Many adults living in major cities struggle to get enough physical exe
    '6a905d2a31a29bc08f2e5a86', // The crime rate among young people is increasing rapidly. What are the 
    '6a905d2b31a29bc08f2e5a88', // The increasing levels of pollution and climate change are threatening 
    '6a910c61fd0973a6cd2b3a06', // Millions of people today spend long hours at work to afford basic livi
    '6a910c6bfd0973a6cd2b3a07', // Older people looking for work now have to compete with younger job see
    '6a910c76fd0973a6cd2b3a08', // More and more job seekers are moving away from their families and frie
    '6a910c82fd0973a6cd2b3a09', // Despite progress in gender equality, women are still underrepresented 
    '6a910c8efd0973a6cd2b3a0a', // Many university graduates struggle to find full-time jobs after comple
    '6a99b18a5b413cfafa69978c', // In many countries, children and teenagers are committing more crimes t
    '6a99b45cdd32161140127759', // Despite studying foreign languages for many years at school, many grad
    '6ac0b78973c776372979799b', // Many people find it hard to balance their work with other parts of the
  ],
  // type04 — Effect–Solution (10)
  type04: [
    '69fcb790e5b68c3982dd5184', // Young people are reading fewer books than in the past. What effects do
    '6a71eabe0404f51873811136', // Cyclists and car drivers sharing the same road cause some problems. Wh
    '6a905d2531a29bc08f2e5a73', // Traffic congestion in major cities is worsening, leading to longer com
    '6a905d2531a29bc08f2e5a74', // The majority of city commuters prefer using private cars and motorbike
    '6a905d2531a29bc08f2e5a75', // A significant amount of freight is moved long distances by heavy truck
    '6a905d2531a29bc08f2e5a76', // In modern cities, fewer citizens choose to walk or cycle for daily sho
    '6a905d2c31a29bc08f2e5a8b', // Rapid urbanisation is having a significant impact on people’s health a
    '6a910c98fd0973a6cd2b3a0b', // An increasing number of employees today suffer from workplace burnout 
    '6a910cb4fd0973a6cd2b3a0c', // More companies are allowing employees to work from home or follow a hy
    '6a99b45cdd32161140127772', // Many young people graduate from school or university without basic lif
  ],
  // type05 — Cause–Effect (6)
  type05: [
    '6a7c5ef6cdbb3e26189f9cf2', // Many students find it difficult to stay motivated when studying online
    '6a857a10282c853ce33a92f0', // The number of students dropping out of university is increasing in man
    '6a905d2131a29bc08f2e5a70', // In several countries, a growing number of university students leave hi
    '6a905d2231a29bc08f2e5a71', // Fewer young people today are choosing to study science, technology, en
    '6a905d2c31a29bc08f2e5a8a', // The education system in many countries is under pressure to prepare st
    '6a99b1875b413cfafa699785', // In many countries, not enough students are choosing to study science s
  ],
  // type06 — Agree/Disagree (16)
  type06: [
    '69ccec7d84749e2f69dfb2ae', // Some people said that the most important thing about being rich is tha
    '69ccec8684749e2f69dfb2b3', // The best way to solve the world‘s environmental problem is to increase
    '69ccecb184749e2f69dfb2c2', // Should a city try to preserve its old, historic buildings or destroy t
    '69ccecd384749e2f69dfb2c7', // With the increased global demand for oil and gas, undiscovered areas o
    '69ccecee84749e2f69dfb2ce', // Some people believe that planning for the future is a waste of time be
    '6a848738c4d5b5ac38bce88c', // Many celebrities complain about the way the media publicises their pri
    '6a848738c4d5b5ac38bce88f', // The international community must take immediate action to ensure that 
    '6a848738c4d5b5ac38bce890', // Children can learn effectively by watching television, so they should 
    '6a848738c4d5b5ac38bce891', // Too much emphasis is placed on education for young people. Some people
    '6a848738c4d5b5ac38bce893', // Some people believe that detailed reporting of crimes in newspapers an
    '6a848738c4d5b5ac38bce894', // Nowadays, many celebrities are famous for their glamour and wealth rat
    '6a905d2531a29bc08f2e5a77', // The working week should be shorter and workers should have a longer we
    '6a905d2631a29bc08f2e5a78', // Working from home will become the main way people work in the future. 
    '6a905d2631a29bc08f2e5a79', // Job satisfaction is more important than a high salary. Do you agree or
    '6a905d2631a29bc08f2e5a7a', // Some people believe that it is better for an individual to be unemploy
    '6a905d2c31a29bc08f2e5a8c', // Globalisation has brought significant changes to economies around the 
  ],
  // type07 — Pos/Neg Dev (13)
  type07: [
    '69ccec9b84749e2f69dfb2b8', // Today many children spend a lot of time playing computer games and les
    '69cceca384749e2f69dfb2bd', // Many people are travelling to other countries. Why? Is it a positive o
    '69ead86e12d21842dfb92fc5', // Today many children spend a lot of time playing computer games and les
    '6a848738c4d5b5ac38bce88b', // Nowadays, more and more people expect things to be done instantly, suc
    '6a848738c4d5b5ac38bce88d', // Nowadays, many children spend a considerable amount of time playing co
    '6a848738c4d5b5ac38bce88e', // In both education and employment, some people work harder than others.
    '6a905d2831a29bc08f2e5a7f', // In recent years, eco-tourism has become increasingly popular around th
    '6a905d2831a29bc08f2e5a80', // Many governments are promoting the use of electric vehicles to combat 
    '6a905d2931a29bc08f2e5a81', // More countries are investing heavily in renewable energy sources, such
    '6a905d2931a29bc08f2e5a82', // In many cities, unused public spaces and former parking lots are being
    '6a905d2931a29bc08f2e5a84', // People today are buying more consumer goods than ever before. Is this 
    '6a99b18a5b413cfafa699789', // Although fossil fuels are still the main source of energy in most coun
    '6a99b18a5b413cfafa69978a', // In some cities, public parks and open spaces are being turned into com
  ],

};
