const ev=(source,label,url)=>({source,label,url});
const pick=(brand,name,catalogQuery,summary,fitNote,evidence)=>({brand,name,catalogQuery,summary,fitNote,evidence});
const guide=(title,description,deck,picks,freshnessCopy)=>({
  title,
  seoTitle:title+" | Reccas",
  description,
  deck,
  checkedLabel:"Oct 2026",
  freshnessCopy:freshnessCopy||"Each pick must still satisfy this shopping use case and remain available when Reccas checks it.",
  picks
});

export const EXTRA_STATIC_EDITS={
  "best-comfortable-heels-for-women":guide(
    "Best comfortable heels for women",
    "Comfortable heels tested by editors and foot experts for walkability, support and event-length wear.",
    "These are the heels with actual comfort evidence, not just lower heel heights.",
    [
      pick("Sam Edelman","Bianka Slingback Pump","Bianka Slingback Pump","The low-kitten-heel consensus pick: polished enough for events and work, with wide sizing and unusually strong comfort feedback.","The pointed toe is still a pointed toe; the low heel and adjustable slingback reduce fatigue but do not make it a walking sneaker.",[
        ev("Glamour","Best overall comfortable heel · tested","https://www.glamour.com/gallery/most-comfortable-heels-for-women"),
        ev("Glamour","Most comfortable kitten heel","https://www.glamour.com/story/best-kitten-heels")
      ]),
      pick("Naturalizer","Vera Sandal","Vera Sandal","A wedding and event sandal that pairs a block heel with the comfort features Naturalizer is known for.","Open-toe fit and strap placement matter; this is best for shoppers who prefer a block heel over a pump.",[
        ev("Glamour","Best comfortable heel for weddings","https://www.glamour.com/gallery/most-comfortable-heels-for-women"),
        ev("Glamour","Editor-tested comfortable kitten heel option","https://www.glamour.com/story/best-kitten-heels")
      ]),
      pick("Vionic","Reyes Slingback Heel","Reyes Slingback","The support-first work heel, with a lower profile and footbed-focused design.","The structured footbed feels more supportive than a minimalist pump; check width if your forefoot is sensitive.",[
        ev("Glamour","Best comfortable heel for work","https://www.glamour.com/gallery/most-comfortable-heels-for-women")
      ])
    ]
  ),

  "best-tote-bags-for-travel":guide(
    "Best tote bags for travel",
    "Travel tote bags tested for flights, commuting, laptop carry and packability.",
    "These totes are chosen for what happens after you fill them: weight, organization, closures and whether they still work under an airplane seat.",
    [
      pick("Longchamp","Le Pliage Large Tote","Le Pliage Large","The classic pack-flat travel tote: light, zip-top and flexible enough for flights, commuting and day trips.","Organization is minimal, so pouches help if you carry lots of small items.",[
        ev("Travel + Leisure","Best overall travel tote · tested","https://www.travelandleisure.com/style/travel-bags/best-travel-tote-bags"),
        ev("Travel + Leisure","Best travel purse tote · editor tested","https://www.travelandleisure.com/style/travel-bags/best-travel-purses")
      ]),
      pick("Cuyana","Paloma Tote","Paloma Tote","The polished leather travel-and-work option, roomy enough for a laptop and layers without looking like luggage.","The premium leather construction makes it heavier and more expensive than nylon travel totes.",[
        ev("Travel + Leisure","Best work travel tote · tested","https://www.travelandleisure.com/style/travel-bags/best-travel-tote-bags")
      ]),
      pick("Baggallini","Carryall Laptop Tote","Carryall Laptop Tote","The organization-first choice with water-resistant nylon, a laptop sleeve and travel-specific pockets.","It is less structured and fashion-forward than leather, but much lighter for transit days.",[
        ev("Travel + Leisure","Best travel tote for laptops · tested","https://www.travelandleisure.com/style/travel-bags/best-travel-tote-bags")
      ])
    ]
  ),

  "best-shoulder-bags-for-women":guide(
    "Best shoulder bags for women",
    "Shoulder bags fashion editors actually carry for everyday use, ranked for versatility and repeat wear.",
    "The best shoulder bag needs to be easy to carry and useful after the trend cycle moves on.",
    [
      pick("Coach","Chelsea Shoulder Bag 30","Chelsea Shoulder Bag 30","A polished everyday shoulder bag with enough capacity for daily essentials and a shape that works beyond one season.","It is a true shoulder bag rather than a laptop tote; capacity is best for personal essentials.",[
        ev("Vogue","Vogue editor everyday shoulder-bag pick","https://www.vogue.com/article/everyday-handbags")
      ]),
      pick("Coach","Brooklyn Shoulder Bag 28","Brooklyn Shoulder Bag 28","The slouchier everyday option, repeatedly favored for its soft leather and easy under-arm carry.","The relaxed construction is less organized than a compartment-heavy work bag.",[
        ev("ELLE","Editor-loved everyday bag","https://www.elle.com/fashion/shopping/g70392617/best-everyday-bags-women/")
      ]),
      pick("Tory Burch","Romy Shoulder Bag","Romy Shoulder Bag","A suede-forward fashion option that still functions as a real daily shoulder bag.","Suede needs more weather care than pebbled leather or nylon.",[
        ev("Vogue","Vogue editor everyday suede bag","https://www.vogue.com/article/everyday-handbags")
      ])
    ]
  ),

  "best-everyday-handbags-for-women":guide(
    "Best everyday handbags for women",
    "Everyday handbags editors rely on for work, errands and weekends, selected for real capacity and repeat wear.",
    "These are not occasion bags. They are the bags fashion editors say they actually reach for day after day.",
    [
      pick("Coach","Brooklyn Shoulder Bag 28","Brooklyn Shoulder Bag 28","A soft leather daily bag with enough room for essentials without becoming a commuter tote.","The open, slouchy shape favors easy access over internal organization.",[
        ev("ELLE","Editor-loved everyday handbag","https://www.elle.com/fashion/shopping/g70392617/best-everyday-bags-women/")
      ]),
      pick("Coach","Chelsea Shoulder Bag 30","Chelsea Shoulder Bag 30","A more polished shoulder-bag option with a clean shape that can handle work-adjacent days and weekends.","It is not designed around a large laptop; think daily handbag rather than work tote.",[
        ev("Vogue","Vogue editor everyday handbag","https://www.vogue.com/article/everyday-handbags")
      ]),
      pick("Cuyana","System Tote 16-Inch","System Tote 16","The carry-more option for people whose everyday bag needs to include a laptop, chargers and workday extras.","The size moves it closer to a work tote; choose this when capacity matters more than compactness.",[
        ev("Marie Claire","Fashion editor's everyday workhorse","https://www.marieclaire.com/fashion/everyday-handbags/")
      ])
    ]
  ),

  "best-jeans-for-curvy-women":guide(
    "Best jeans for curvy women",
    "Curvy-fit jeans tested for waist gap, hip room, stretch recovery and length options.",
    "Curvy denim is a pattern problem, not a size label. These picks are designed or tested for more room through the hip and thigh relative to the waist.",
    [
      pick("Madewell","Curvy Perfect Vintage Wide-Leg Jean","Curvy Perfect Vintage","A dedicated curvy pattern with extra room through the hip and thigh and a more fitted waist.","Use Madewell's curvy size chart rather than assuming your standard Madewell size maps one-to-one.",[
        ev("Yahoo Shopping","Best curvy jeans overall","https://shopping.yahoo.com/style/clothing/article/best-jeans-curvy-women-173554346.html"),
        ev("InStyle","Curvy-jean wear test pick","https://www.instyle.com/best-curvy-jeans-6740246")
      ]),
      pick("Abercrombie & Fitch","Curve Love High Rise 90s Relaxed Jean","Curve Love High Rise 90s Relaxed","The length-range standout, with extra room at the hip and thigh and multiple inseam choices.","The low-stretch denim can feel snug initially; length choice matters as much as waist size.",[
        ev("InStyle","Best curvy jeans for everyday wear","https://www.instyle.com/best-curvy-jeans-6740246"),
        ev("People","Curvy fit recommendation","https://people.com/best-jeans-for-curvy-women-7970021")
      ]),
      pick("Good American","Good Legs Straight Jeans","Good Legs Straight","A stretch-forward option designed around a gap-resistant waistband and broader size range.","The compression/stretch feel is different from rigid denim; choose based on how held-in you want the fit.",[
        ev("People","Curvy-jean standout","https://people.com/best-jeans-for-curvy-women-7970021"),
        ev("InStyle","Curve-friendly tested brand","https://www.instyle.com/best-curvy-jeans-6740246")
      ])
    ]
  ),

  "best-jeans-for-tall-women":guide(
    "Best jeans for tall women",
    "Jeans for tall women selected for genuinely longer inseams, proportion and editor fit testing.",
    "The problem is not finding bigger jeans; it is finding enough length without distorting the rise and leg shape.",
    [
      pick("Spanx","SpanxShape Authentic 360 Wide-Leg Jeans","Authentic 360 Wide-Leg","The top editor pick for tall shoppers who want a full-length wide leg rather than an accidental crop.","The shaping construction feels more structured than traditional rigid denim.",[
        ev("Glamour","Best jeans for tall women overall","https://www.glamour.com/gallery/best-jeans-tall-women")
      ]),
      pick("Abercrombie & Fitch","Curve Love High Rise 90s Relaxed Jeans","Curve Love High Rise 90s Relaxed","A straight-leg option with long and extra-long inseams and useful curve-fit sizing.","The extra-long length is the key feature; check rise and curve/regular cut separately.",[
        ev("Glamour","Best straight-leg jeans for tall women","https://www.glamour.com/gallery/best-jeans-tall-women"),
        ev("Vogue","Tall-denim editor guide","https://www.vogue.com/article/best-jeans-for-tall-women")
      ]),
      pick("Madewell","The Longline Straight Jean","Longline Straight Jean","A cleaner straight-leg option from a brand with dedicated tall lengths.","Some washes fit differently, so use the exact product's tall inseam rather than relying on the style name alone.",[
        ev("Vogue","Tall-jeans editor guide","https://www.vogue.com/article/best-jeans-for-tall-women")
      ])
    ]
  ),

  "best-merino-wool-sweaters-for-women":guide(
    "Best merino wool sweaters for women",
    "Merino wool sweaters selected for softness, temperature regulation, layering and editor-tested fit.",
    "Merino earns its keep because it is warm without bulk. These picks cover everyday, work and travel-friendly shapes.",
    [
      pick("Madewell","Merino Wool Pullover","Merino Wool Pullover","A soft everyday merino option that balances a relaxed fit with enough polish for work or layering.","Merino is lighter than chunky wool; use a base layer if you want true winter warmth.",[
        ev("Women's Health","Best merino sweater overall · tested","https://www.womenshealthmag.com/style/g69711364/best-merino-wool-sweaters/")
      ]),
      pick("Everlane","Luxe Merino Half-Zip","Luxe Merino Half-Zip","A sportier merino layer with a half-zip shape that works for travel and casual office outfits.","The relaxed half-zip silhouette is less formal than a fine-gauge crewneck.",[
        ev("InStyle","Wool-sweater editor pick","https://www.instyle.com/best-wool-sweaters-for-women-11871977"),
        ev("Harper's Bazaar","Merino editor pick","https://www.harpersbazaar.com/fashion/trends/g45499335/best-merino-wool-sweaters-women/")
      ]),
      pick("J.Crew","Merino Wool Sweater","Merino Wool","The classic work-friendly merino choice, useful when you want a finer knit than cashmere or a chunky wool sweater.","J.Crew rotates merino silhouettes; Reccas matches the live product before showing a shopping link.",[
        ev("PureWow","Editor-loved merino V-neck","https://www.purewow.com/fashion/best-wool-sweaters"),
        ev("Corporette","Merino work-sweater recommendation","https://corporette.com/the-best-merino-wool-sweaters/")
      ])
    ]
  ),

  "best-packable-jackets-for-travel":guide(
    "Best packable jackets for travel",
    "Packable jackets tested for warmth, weather resistance, luggage space and real travel use.",
    "A travel jacket has to justify the suitcase space it takes. These are the layers that pack down without becoming useless.",
    [
      pick("Cotopaxi","Fuego Hooded Down Jacket","Fuego Hooded Down Jacket","The best-overall packable travel jacket in current testing, balancing warmth, weight and compressibility.","Down packs small but is not the best choice for sustained wet weather without a shell.",[
        ev("Travel + Leisure","Best overall packable jacket · tested","https://www.travelandleisure.com/style/fashion/best-travel-jackets")
      ]),
      pick("The North Face","1996 Retro Nuptse Jacket","1996 Retro Nuptse","A warmer puffer option that still packs down better than a traditional winter coat.","It is bulkier than ultralight travel layers and reads visibly sporty.",[
        ev("Travel + Leisure","Best puffer in packable-jacket testing","https://www.travelandleisure.com/style/fashion/best-travel-jackets"),
        ev("Travel + Leisure","Best packable puffer · tested","https://www.travelandleisure.com/best-puffer-jackets-for-women-6748138")
      ]),
      pick("Columbia","Switchback III Jacket","Switchback III Jacket","The rain-first packable option for mild trips where wind and precipitation matter more than insulation.","This is a shell, not a warm puffer; layer underneath in cold weather.",[
        ev("Travel + Leisure","Best packable rain jacket · tested","https://www.travelandleisure.com/style/fashion/best-travel-jackets")
      ])
    ]
  ),

  "best-cocktail-dresses-for-women":guide(
    "Best cocktail dresses for women",
    "Cocktail dresses for weddings, dinners and parties, selected from current fashion-editor recommendations.",
    "Cocktail is the middle dress code: polished but not black tie. These picks cover mini, fitted and classic event silhouettes.",
    [
      pick("Bernadette","Halterneck Mini Dress","Halterneck Mini Dress","A statement mini for cocktail dress codes where the goal is festive rather than conservative.","Mini length makes this less universal for formal venues; check the event dress code before choosing it.",[
        ev("Vogue","Cocktail mini editor pick","https://www.vogue.com/article/best-cocktail-dress-styles")
      ]),
      pick("Reformation","Cocktail Dress","Cocktail Dress","A Reformation option for shoppers who want a modern fitted event dress rather than traditional occasionwear.","Reformation rotates event styles quickly, so Reccas matches the current catalog product before showing a shop link.",[
        ev("Vogue","Cocktail-dress editor guide","https://www.vogue.com/article/best-cocktail-dress-styles"),
        ev("Marie Claire","Editors tested Reformation event dressing","https://www.marieclaire.com/fashion/fall-fashion/reformation-alexa-chung-fashion-collaboration-fall-2026/")
      ]),
      pick("J.Crew","Pleated Evening Dress","Pleated Evening Dress","A more classic event-ready option that can cover cocktail weddings and formal dinners.","This is dressier than a day-to-night midi and works best when the event actually calls for occasionwear.",[
        ev("Glamour","Editor event-dress pick","https://www.glamour.com/story/best-little-black-dresses")
      ])
    ]
  ),

  "best-midi-dresses-for-women":guide(
    "Best midi dresses for women",
    "Midi dresses with editor evidence across work, weddings and repeat everyday wear.",
    "The midi is broad enough to cover very different jobs. These picks represent the strongest office, event and structured options in Reccas's current evidence.",
    [
      pick("Madewell","Smocked Midi Shirtdress","Smocked Midi Shirtdress","A repeatable business-casual midi that can work with flats, loafers or boots.","The smocked waist makes it more relaxed than a tailored sheath.",[
        ev("Glamour","Editor work-dress pick","https://www.glamour.com/story/best-work-dresses-for-women")
      ]),
      pick("Norma Kamali","Diana Dress","Diana Dress","The event-oriented ruched option with unusually strong repeat wedding-season recommendations.","The body-skimming fit is intentional and less casual than a shirt or knit midi.",[
        ev("The Strategist","Wedding guest editor pick","https://nymag.com/strategist/article/25-best-wedding-guest-dresses-2024.html"),
        ev("Glamour","Fall wedding guest pick","https://www.glamour.com/gallery/best-fall-wedding-guest-dresses")
      ]),
      pick("Banana Republic","Cotton Poplin Shirt Dress","Poplin Shirt Dress","The crisp everyday-work midi for shoppers who want more structure and less cling.","Woven poplin has less give than knit dresses, so bust and waist fit matter.",[
        ev("Vogue","Vogue editor-approved work dress","https://www.vogue.com/article/best-work-dresses")
      ])
    ]
  ),

  "best-midi-skirts-for-women":guide(
    "Best midi skirts for women",
    "Midi skirts selected for versatile styling across work, weekends and transitional seasons.",
    "A useful midi skirt should work with more than one shoe and top formula. These picks cover slip, clean and fuller silhouettes.",
    [
      pick("J.Crew","Gwyneth Slip Skirt","Gwyneth Slip Skirt","A classic fluid midi that can move between office, dinner and casual styling.","Bias-cut satin highlights fit through the hip more than an A-line cotton skirt.",[
        ev("Vogue","Midi-skirt styling staple","https://www.vogue.com/article/midi-skirt-styling")
      ]),
      pick("Reformation","Midi Skirt","Midi Skirt","A fashion-forward midi option for shoppers who want a cleaner, more directional silhouette.","Reformation rotates skirt names and fabrics; Reccas matches the live catalog product before linking.",[
        ev("Vogue","Runway-informed midi-skirt edit","https://www.vogue.com/article/midi-skirt-styling")
      ]),
      pick("& Other Stories","Gathered Midi Skirt","Gathered Midi Skirt","A fuller everyday midi with enough volume to style with fitted knits, tees and flats.","The gathered volume works best when the top half is kept relatively clean.",[
        ev("Vogue","Midi-skirt trend and styling guide","https://www.vogue.com/article/midi-skirt-styling")
      ])
    ]
  ),

  "best-slip-skirts-for-women":guide(
    "Best slip skirts for women",
    "Slip skirts selected for drape, styling versatility and repeat wear.",
    "The best slip skirt should work with knitwear, tees and occasion tops instead of being a one-outfit purchase.",
    [
      pick("J.Crew","Gwyneth Slip Skirt","Gwyneth Slip Skirt","The classic satin slip-skirt formula: simple enough for work, dinner and knitwear.","Bias-cut satin follows the hip line; sizing for drape is usually better than sizing for a tight fit.",[
        ev("Vogue","Slip-skirt styling reference","https://www.vogue.com/article/midi-skirt-styling")
      ]),
      pick("Tuckernuck","Belmont Slip Skirt","Belmont Slip Skirt","A straightforward slip silhouette for shoppers who want the look without a designer price.","Check the live fabric and length because seasonal colorways can vary.",[
        ev("Vogue","Midi/slip skirt styling guidance","https://www.vogue.com/article/midi-skirt-styling")
      ]),
      pick("Quince","Washable Silk Skirt","Washable Silk Skirt","The washable-silk value option for a fluid skirt that can be dressed up or down.","Silk is less forgiving of friction and snagging than synthetic satin even when washable.",[
        ev("The Daily Beast","Editor-recommended Quince silk basics","https://www.thedailybeast.com/what-to-buy-from-quince-for-women/")
      ])
    ]
  ),

  "best-bras-for-women":guide(
    "Best bras for women",
    "Bras tested by textile labs, fashion editors and large consumer panels for fit, comfort, support and durability.",
    "Bra fit is too personal for a single universal winner, but these styles have unusually strong repeated testing behind them.",
    [
      pick("Natori","Pure Luxe Custom Coverage Bra","Pure Luxe Custom Coverage","The lab-tested all-rounder, with unusually strong comfort scores across both smaller and larger cup testers.","It is a traditional underwire bra; lace straps can show under some tops.",[
        ev("Good Housekeeping","Best overall bra · tested by 1,000+ women","https://www.goodhousekeeping.com/what-to-buy/a71320491/best-bras/"),
        ev("Good Housekeeping","Top-tested bra deal","https://www.goodhousekeeping.com/what-to-buy/sales-shopping-news/a73308589/nordstrom-anniversary-sale-best-bra-deals/")
      ]),
      pick("ThirdLove","24/7 Classic T-Shirt Bra","24/7 Classic T-Shirt Bra","The T-shirt bra pick for broad sizing and half-cup options, with repeated test evidence for shaping and support.","Stretch recovery is not the strongest in lab testing, so rotation matters for longevity.",[
        ev("Good Housekeeping","Best T-shirt bra · tested","https://www.goodhousekeeping.com/what-to-buy/a71320491/best-bras/"),
        ev("Vogue","Bra-brand editor pick","https://www.vogue.com/article/best-bras"),
        ev("Glamour","Comfort-tested T-shirt bra","https://www.glamour.com/gallery/most-comfortable-bras")
      ]),
      pick("Natori","Feathers Contour Plunge Bra","Feathers Contour Plunge Bra","The lower-cut Natori option for shoppers who want a plunge shape with a long-running editorial following.","The plunge and lace construction solve a different wardrobe problem than full coverage.",[
        ev("Vogue","Natori editor bra pick","https://www.vogue.com/article/best-bras"),
        ev("Glamour","Small-bust editor pick","https://www.glamour.com/gallery/how-to-shop-for-bras-small-boobs")
      ])
    ]
  ),

  "best-black-leggings-for-women":guide(
    "Best black leggings for women",
    "Black leggings selected for comfort, training performance, compression and repeat wear.",
    "Black leggings are a wardrobe basic with very different fabric jobs. These picks cover soft yoga, versatile training and compression-first fits.",
    [
      pick("lululemon","Align High-Rise Pant","Align High-Rise Pant","The yoga and all-day comfort benchmark, prized for its very soft hand feel and low-friction fit.","The fabric is optimized for low-impact wear rather than abrasive training.",[
        ev("Woman & Home","Best for yoga and all-day wear · tested","https://www.womanandhome.com/health-wellbeing/best-workout-leggings/")
      ]),
      pick("Athleta","Salutation Stash High Rise Legging","Salutation Stash High Rise","A versatile everyday-training legging with a more practical pocket setup than minimalist yoga tights.","Compression is moderate; shoppers wanting a very held-in feel may prefer a firmer training tight.",[
        ev("Glamour","Editor-tested legging favorite","https://www.glamour.com/gallery/best-workout-leggings")
      ]),
      pick("Spanx","Booty Boost Active Leggings","Booty Boost Active Leggings","The compression-first option for shoppers who want a firmer, sculpting training feel.","The snug waistband and compression are intentional and feel less lounge-friendly than Align-style leggings.",[
        ev("Women's Health","Editor-tested activewear pick","https://www.womenshealthmag.com/fitness/g44841542/best-workout-leggings/")
      ])
    ]
  ),

  "best-underwear-for-women":guide(
    "Best underwear for women",
    "Women's underwear tested for comfort, durability, visibility under clothes and everyday wear.",
    "The best pair depends on cut and use case, so this list spans breathable everyday, low-rise thong and smoothing brief options.",
    [
      pick("Natori","Bliss French-Cut Panties","Bliss French-Cut","The polished everyday cotton option: breathable, smooth under clothing and repeatedly praised by editors.","The French-cut leg is higher than a bikini or brief; choose based on coverage preference.",[
        ev("Glamour","Editor-tested cotton underwear pick","https://www.glamour.com/gallery/best-womens-underwear"),
        ev("Glamour","Best-overall lingerie brand everyday underwear","https://www.glamour.com/story/best-lingerie-brands")
      ]),
      pick("Hanky Panky","Signature Low-Rise Thong","Signature Low-Rise Thong","The lace thong with one of the longest-running fashion-editor followings.","Stretch lace and thong coverage are highly preference-dependent; this is not the pick for maximum coverage.",[
        ev("Glamour","Best lingerie underwear · tested","https://www.glamour.com/gallery/best-womens-underwear"),
        ev("Glamour","Best lingerie brand for underwear","https://www.glamour.com/story/best-lingerie-brands")
      ]),
      pick("Spanx","SpanxShape ExtraOrdinary Brief","ExtraOrdinary Brief","The smoothing brief for days when you want more waist support without moving into full shapewear.","The firmer construction is less barely-there than a seamless bikini or thong.",[
        ev("Glamour","Best tummy-control underwear · tested","https://www.glamour.com/gallery/best-womens-underwear")
      ])
    ]
  )
};

const d=(title,description,deck,sourceSlugs,include,maxPicks)=>({title,seoTitle:title+" | Reccas",description,deck,checkedLabel:"Oct 2026",freshnessCopy:"Each pick must still satisfy this shopping use case and remain available when Reccas checks it.",sourceSlugs,include:include||null,maxPicks:maxPicks||3});

export const DERIVED_GUIDES={
  "best-comfortable-loafers-for-women":d("Best comfortable loafers for women","Comfortable loafers with editor testing for cushioning, break-in time, support and all-day wear.","Loafers look polished, but many are too stiff for real life. These picks have the strongest comfort evidence in Reccas's loafer corpus.",["best-loafers-under-250"],["Vionic Uptown","Sam Edelman Loraine","G.H. Bass Whitney"]),
  "best-loafers-for-walking":d("Best loafers for walking","Loafers editors have actually walked in, prioritized for cushioning, traction and long-wear comfort.","This edit favors loafers with real walking evidence rather than pairs that only photograph well.",["best-loafers-under-250"],["Vionic Uptown","G.H. Bass Whitney","Sam Edelman Loraine"]),
  "best-loafers-for-work":d("Best loafers for work","Polished loafers for office days and commutes, ranked from editor and tester recommendations.","A work loafer has to survive the commute and still look right with trousers. These are the strongest office-ready options in Reccas's evidence set.",["best-loafers-under-250"],["Sam Edelman Loraine","G.H. Bass Whitney","Vionic Uptown"]),
  "best-ballet-flats-for-walking":d("Best ballet flats for walking","Ballet flats with real-world comfort evidence for commuting, travel and high-step-count days.","Traditional ballet flats can be brutally thin. This list pulls the walkable options from Reccas's flat testing evidence.",["best-ballet-flats-under-250","best-flats-for-walking"],["Vionic Alameda","VIVAIA Margot","Madewell Greta"]),
  "best-comfortable-ballet-flats":d("Best comfortable ballet flats","Comfortable ballet flats backed by editor wear tests, podiatrist input and support-focused construction.","These are the ballet flats with the strongest evidence for softness, support or extended wear.",["best-flats-for-walking","best-ballet-flats-under-250"],["Vionic Alameda","VIVAIA Margot","Madewell Greta"]),
  "best-white-sneakers-for-women":d("Best white sneakers for women","White sneakers editors repeatedly recommend for everyday wear, travel and styling versatility.","A white sneaker should work with most of your wardrobe. Reccas ranks the pairs with the strongest repeat recommendations.",["best-white-sneakers-under-200","best-white-sneakers-to-wear-with-dresses"],["Reebok Club C","Veja Campo","adidas Samba"]),
  "best-sneakers-for-travel":d("Best sneakers for travel","Travel sneakers selected for airport days, city walking and suitcase versatility.","The strongest travel sneaker is comfortable enough for miles but polished enough that you do not need a second casual shoe.",["best-travel-shoes-for-europe","best-walking-sneakers-for-women","best-white-sneakers-under-200"],["Dr. Scholl's Time Off","HOKA Clifton","Veja Campo"]),
  "best-small-crossbody-bags":d("Best small crossbody bags","Compact crossbody bags for phone, wallet and daily essentials, backed by editor and travel testing.","When you want hands-free carry without a full-size bag, these are the strongest compact crossbody picks in Reccas's evidence set.",["best-crossbody-bags","best-crossbody-bags-for-travel"]),
  "best-work-bags-for-women":d("Best work bags for women","Work bags for laptops and commuting, including structured totes and polished hands-free options.","This broader work-bag edit keeps the strongest office and commute picks instead of limiting the answer to one tote silhouette.",["best-work-totes-for-women","best-crossbody-bags"]),
  "best-leather-tote-bags-for-women":d("Best leather tote bags for women","Leather tote bags with editor evidence for work, durability and everyday carry.","Leather totes are heavy enough that construction matters. These are the most credible leather workhorses in Reccas's current evidence.",["best-work-totes-for-women"],["Cuyana Classic Easy","Dagne Dover Allyn"]),
  "best-high-waisted-jeans-for-women":d("Best high-waisted jeans for women","High-rise jeans with editor fit evidence across wide-leg, straight and petite-friendly cuts.","Rise changes the whole proportion of a jean. These are the strongest high-waist options already supported by Reccas's denim evidence.",["best-wide-leg-jeans-for-women","best-jeans-for-petites","best-straight-leg-jeans-for-women"],["Everlane Way-High","AGOLDE Ren","Levi's 501","Madewell Longline"]),
  "best-work-pants-for-women":d("Best work pants for women","Work pants editors have worn and tested for office polish, comfort and repeatability.","These are the trousers that hold up across actual office days rather than only looking sharp in product photos.",["best-black-trousers-for-women","best-travel-pants-for-women"],["Aritzia Effortless","Reformation Mason","Athleta Brooklyn"]),
  "best-wide-leg-pants-for-women":d("Best wide-leg pants for women","Wide-leg pants with editor evidence for drape, fit, travel and office wear.","A wide leg only works when the rise, fabric and length are right. These picks have useful fit evidence behind them.",["best-black-trousers-for-women","best-travel-pants-for-women"],["Aritzia Effortless","Reformation Mason","SPANX AirEssentials"]),
  "best-trousers-for-women":d("Best trousers for women","Women's trousers ranked from editor wear tests across work, travel and everyday tailoring.","This is the broad trouser list: polished pants that earn repeat wear rather than one narrow color or occasion.",["best-black-trousers-for-women","best-travel-pants-for-women"],["Aritzia Effortless","Reformation Mason","COS Relaxed Fluid"]),
  "best-wrinkle-resistant-pants-for-women":d("Best wrinkle-resistant pants for women","Wrinkle-resistant pants with travel testing and enough polish for real outfits after a flight.","These picks prioritize fabrics and constructions that survive sitting, packing and long transit days.",["best-travel-pants-for-women"],["Athleta Brooklyn","SPANX AirEssentials","Aritzia Effortless"]),
  "best-cashmere-sweaters-for-women":d("Best cashmere sweaters for women","Cashmere sweaters editors repeatedly recommend across value, classic and layering categories.","The broad cashmere list removes the price cap and focuses on the products with the strongest repeat recommendations.",["best-cashmere-sweaters-under-200"],["Quince Mongolian Cashmere","NAADAM Original Cashmere","J.Crew Cashmere"]),
  "best-button-down-shirts-for-women":d("Best button-down shirts for women","Women's button-down shirts with editor wear tests for structure, opacity, fit and layering.","A strong button-down should work tucked, untucked and under a blazer. These are the most credible shirts already tracked by Reccas.",["best-white-button-down-shirts-for-women"]),
  "best-tops-for-work":d("Best tops for work","Work tops selected for office layering, opacity and repeat wear rather than trend-only styling.","This first work-top edit starts with the button-downs and refined tees that have the strongest editor testing in Reccas's corpus.",["best-white-button-down-shirts-for-women","best-white-t-shirts-for-women"],["J.Crew Étienne","Banana Republic Everyday Shirt","COS Clean Cut"]),
  "best-trench-coats-for-women":d("Best trench coats for women","Trench coats editors recommend for everyday wear, travel and transitional weather.","The broad trench list removes the price cap while keeping the fit and wear-test evidence that matters.",["best-trench-coats-under-300"]),
  "best-wedding-guest-dresses":d("Best wedding guest dresses","Wedding guest dresses with repeat editor recommendations across cocktail, formal and seasonal events.","The broad wedding-guest list removes the $250 ceiling and focuses on dresses with the strongest evidence for actual events.",["best-dresses-under-250-for-wedding-guests","best-little-black-dresses"],["Norma Kamali Diana","Abercrombie Giselle","J.Crew Pleated Evening"]),
  "best-t-shirts-for-women":d("Best T-shirts for women","Women's T-shirts with editor wear testing for fabric weight, shape retention, opacity and repeat washing.","This broad tee list starts with the most thoroughly tested core T-shirts in Reccas's current evidence set.",["best-white-t-shirts-for-women"])
};
